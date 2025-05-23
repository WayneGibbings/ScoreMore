import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import type { TeamData, GameResult, LogEntry } from './App';

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) {
    return db;
  }
  const SQL = await initSqlJs({
    locateFile: () => `/sql-wasm.wasm`, // Point to the WASM file in the public directory
  });
  const dbFile = localStorage.getItem('sqliteDb');
  if (dbFile) {
    try {
      const Uints = new Uint8Array(dbFile.split(',').map(Number));
      db = new SQL.Database(Uints);
    } catch (e) {
      console.error('Error loading database from localStorage, reinitializing:', e);
      localStorage.removeItem('sqliteDb'); // Clear corrupted data
      db = new SQL.Database();
      await initializeDatabaseSchema(db);
    }
  } else {
    db = new SQL.Database();
    await initializeDatabaseSchema(db);
  }
  return db;
}

async function saveDb(currentDb: Database) {
  const binaryArray = currentDb.export();
  localStorage.setItem('sqliteDb', Array.from(binaryArray).toString());

  // Create a promise that resolves after a small delay to ensure write completes
  // This helps prevent race conditions when refreshing the page immediately after state changes
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, 10); // Small delay to ensure persistence completes
  });
}

// Schema initialization, only call this if db is new
async function initializeDatabaseSchema(currentDb: Database) {
  currentDb.exec(`
    CREATE TABLE IF NOT EXISTS current_game_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      teams_json TEXT,
      game_active INTEGER,
      is_halftime INTEGER,
      current_half INTEGER, -- Renamed from current_inning
      game_status TEXT,
      timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS game_history (
      id TEXT PRIMARY KEY,
      date TEXT,
      teams_json TEXT,
      winner TEXT,
      timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS score_log (
      id TEXT PRIMARY KEY,
      entry_json TEXT,
      game_history_id TEXT,
      timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);
  // Save immediately after schema creation
  saveDb(currentDb);
}

// Public function to ensure schema is initialized (e.g. called from App.tsx on mount if needed)
// However, getDb handles new DB initialization now.
export async function ensureDbInitialized() {
  await getDb(); // This will initialize if not already done.
}

// --- Game State Functions ---
export interface CurrentGameState {
  teams: TeamData[];
  gameActive: boolean;
  isHalftime: boolean;
  currentHalf: number; // Renamed from currentInning
  gameStatus: string;
}

export async function saveCurrentGameState(state: CurrentGameState) {
  const currentDb = await getDb();
  const { teams, gameActive, isHalftime, currentHalf, gameStatus } = state;

  // Ensure data consistency: if we're in the second half (not halftime and currentHalf > 1),
  // make sure we're explicitly setting currentHalf to 2 to avoid any state inconsistencies
  let halfToSave = currentHalf;
  if (gameActive && !isHalftime && currentHalf > 1) {
    halfToSave = 2; // Force to exactly 2 for second half
  }

  currentDb.run(
    `INSERT OR REPLACE INTO current_game_state (id, teams_json, game_active, is_halftime, current_half, game_status, timestamp)
     VALUES (1, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [
      JSON.stringify(teams),
      gameActive ? 1 : 0,
      isHalftime ? 1 : 0,
      halfToSave, // Use the validated half value
      gameStatus,
    ]
  );

  // Wait for the save operation to complete with a small delay
  // This helps prevent race conditions during refreshes
  return await saveDb(currentDb);
}

export async function loadCurrentGameState(): Promise<CurrentGameState | null> {
  const currentDb = await getDb();
  const stmt = currentDb.prepare('SELECT * FROM current_game_state WHERE id = 1');
  let result: CurrentGameState | null = null;
  if (stmt.step()) {
    // if a row was found
    const row = stmt.getAsObject();
    let parsedTeams: TeamData[];
    try {
      if (row.teams_json) {
        parsedTeams = JSON.parse(row.teams_json as string);
        if (!Array.isArray(parsedTeams)) {
          console.warn('Parsed teams_json from current_game_state is not an array, defaulting.');
          parsedTeams = [];
        }

        // Ensure each team has a valid players array and each player has required properties
        parsedTeams = parsedTeams.map(team => ({
          ...team,
          players: Array.isArray(team.players)
            ? team.players.map(player => ({
                ...player,
                id: player.id ?? '',
                name: player.name ?? '',
                score: typeof player.score === 'number' ? player.score : 0,
                active: player.active !== undefined ? player.active : true,
              }))
            : [],
        }));
      } else {
        parsedTeams = [];
      }
    } catch (error) {
      console.error('Failed to parse teams_json from current_game_state:', error);
      parsedTeams = [];
    } // Extract values from database row
    let currentHalfFromDb = row.current_half as number;
    if (currentHalfFromDb === null || currentHalfFromDb === undefined) {
      currentHalfFromDb = 1;
    }

    // Handle boolean conversion explicitly to avoid potential issues
    const isActive = row.game_active === 1;
    const isHalftimeFromDb = row.is_halftime === 1;

    // Important: Make sure halftime and currentHalf are consistent with each other
    // If we're in the second half (currentHalf > 1), we CANNOT be at halftime
    let finalIsHalftime = isHalftimeFromDb;
    const finalCurrentHalf = currentHalfFromDb;

    // Special case: If currentHalf is 2, we must not be at halftime
    if (finalCurrentHalf > 1) {
      finalIsHalftime = false;
    }

    // Log the values we're loading for debugging
    console.log('Loading game state:', {
      raw_is_halftime: row.is_halftime,
      raw_current_half: row.current_half,
      isHalftime: finalIsHalftime,
      currentHalf: finalCurrentHalf,
    });

    result = {
      teams: parsedTeams,
      gameActive: isActive,
      isHalftime: finalIsHalftime,
      currentHalf: finalCurrentHalf,
      gameStatus: (row.game_status as string) || 'initial',
    };
  }
  stmt.free();
  return result;
}

// --- Game History Functions ---
export async function saveCompletedGame(gameResult: GameResult) {
  const currentDb = await getDb();
  currentDb.run(
    "INSERT INTO game_history (id, date, teams_json, winner, timestamp) VALUES (?, ?, ?, ?, datetime('now', 'localtime'))",
    [gameResult.id, gameResult.date, JSON.stringify(gameResult.teams), gameResult.winner]
  );
  await saveDb(currentDb);
}

// New function to update completed game team names
export async function updateCompletedGame(
  gameId: string,
  updatedGame: GameResult
): Promise<boolean> {
  try {
    const currentDb = await getDb();

    // Update the game history record
    currentDb.run('UPDATE game_history SET teams_json = ?, winner = ? WHERE id = ?', [
      JSON.stringify(updatedGame.teams),
      updatedGame.winner,
      gameId,
    ]);

    // Update related log entries if needed
    const logEntries = await loadScoringLogForGame(gameId);
    for (const entry of logEntries) {
      // Only update entries of type 'score'
      if (entry.type === 'score') {
        // Find which team this log entry belongs to
        const teamIndex = updatedGame.teams.findIndex(team =>
          team.players.some(player => player.name === entry.playerName)
        );

        if (teamIndex !== -1) {
          // Update the team name in the log entry
          entry.teamName = updatedGame.teams[teamIndex].name;

          // Update the log entry in the database
          await currentDb.run(
            'UPDATE score_log SET entry_json = ? WHERE id = ? AND game_history_id = ?',
            [JSON.stringify(entry), entry.id, gameId]
          );
        }
      }
    }

    // Save the DB changes
    await saveDb(currentDb);
    return true;
  } catch (error) {
    console.error('Error updating completed game:', error);
    return false;
  }
}

export async function loadGameHistory(): Promise<GameResult[]> {
  const currentDb = await getDb();
  const stmt = currentDb.prepare('SELECT * FROM game_history ORDER BY timestamp DESC');
  const results: GameResult[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    let parsedTeams: TeamData[];
    try {
      if (row.teams_json) {
        parsedTeams = JSON.parse(row.teams_json as string);
        if (!Array.isArray(parsedTeams)) {
          parsedTeams = [];
        }

        // Ensure all players have active property set to true by default
        parsedTeams = parsedTeams.map(team => ({
          ...team,
          players: team.players.map(player => ({
            ...player,
            active: player.active !== undefined ? player.active : true,
          })),
        }));
      } else {
        parsedTeams = [];
      }
    } catch {
      // Silently handle parse errors by setting empty teams array
      parsedTeams = [];
    }
    results.push({
      id: row.id as string,
      date: row.date as string,
      teams: parsedTeams,
      winner: row.winner as string,
    });
  }
  stmt.free();
  return results;
}

// --- Scoring Log Functions ---
function parseLogEntries(rows: Record<string, unknown>[]): LogEntry[] {
  if (!rows) return [];
  return rows.reduce((acc: LogEntry[], row: Record<string, unknown>) => {
    try {
      if (row.entry_json) {
        const entry = JSON.parse(row.entry_json as string);
        if (entry && typeof entry.id === 'string') {
          acc.push(entry);
        } else {
          console.warn('Parsed log entry is invalid:', entry);
        }
      } else {
        console.warn('entry_json is null or undefined in score_log row.');
      }
    } catch (e) {
      console.error('Failed to parse entry_json in score_log:', e);
    }
    return acc;
  }, []);
}

export async function addLogEntryToDb(logEntry: LogEntry, gameHistoryId: string | null = null) {
  const currentDb = await getDb();
  currentDb.run(
    "INSERT INTO score_log (id, entry_json, game_history_id, timestamp) VALUES (?, ?, ?, datetime('now', 'localtime'))",
    [logEntry.id, JSON.stringify(logEntry), gameHistoryId]
  );
  await saveDb(currentDb);
}

export async function loadScoringLogForCurrentGame(): Promise<LogEntry[]> {
  const currentDb = await getDb();
  const stmt = currentDb.prepare(
    'SELECT entry_json FROM score_log WHERE game_history_id IS NULL ORDER BY timestamp DESC'
  );
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return parseLogEntries(rows);
}

export async function associateScoreLogToGameHistory(logIds: string[], gameHistoryId: string) {
  const currentDb = await getDb();
  if (logIds.length === 0) return;
  const placeholders = logIds.map(() => '?').join(',');
  currentDb.run(`UPDATE score_log SET game_history_id = ? WHERE id IN (${placeholders})`, [
    gameHistoryId,
    ...logIds,
  ]);
  await saveDb(currentDb);
}

export async function clearUnassociatedScoreLog() {
  const currentDb = await getDb();
  currentDb.run('DELETE FROM score_log WHERE game_history_id IS NULL');
  await saveDb(currentDb);
}

export async function loadScoringLogForGame(gameHistoryId: string): Promise<LogEntry[]> {
  const currentDb = await getDb();
  const stmt = currentDb.prepare(
    'SELECT entry_json FROM score_log WHERE game_history_id = ? ORDER BY timestamp ASC'
  );
  stmt.bind([gameHistoryId]);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return parseLogEntries(rows);
}

export async function deleteGameFromHistory(gameId: string): Promise<boolean> {
  try {
    const currentDb = await getDb();

    // First, delete associated scoring logs
    currentDb.run('DELETE FROM score_log WHERE game_history_id = ?', [gameId]);

    // Then delete the game itself
    currentDb.run('DELETE FROM game_history WHERE id = ?', [gameId]);

    // Save the DB changes
    await saveDb(currentDb);
    return true;
  } catch (error) {
    console.error('Error deleting game from history:', error);
    return false;
  }
}

// Function to edit a note in game history
export async function editGameNote(
  noteId: string,
  gameHistoryId: string,
  newContent: string
): Promise<boolean> {
  try {
    const currentDb = await getDb();

    // First get the existing note
    const stmt = currentDb.prepare(
      'SELECT entry_json FROM score_log WHERE id = ? AND game_history_id = ?'
    );
    stmt.bind([noteId, gameHistoryId]);

    if (!stmt.step()) {
      stmt.free();
      console.error('Note not found for edit:', noteId);
      return false;
    }

    const row = stmt.getAsObject();
    stmt.free();

    try {
      // Parse the entry JSON, update it, and save it back
      const entry: LogEntry = JSON.parse(row.entry_json as string);

      if (entry.type !== 'note') {
        console.error('Cannot edit non-note entry:', noteId);
        return false;
      }

      entry.content = newContent;
      // Update the timestamp to show it was edited
      entry.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Save the updated entry
      currentDb.run('UPDATE score_log SET entry_json = ? WHERE id = ? AND game_history_id = ?', [
        JSON.stringify(entry),
        noteId,
        gameHistoryId,
      ]);

      await saveDb(currentDb);
      return true;
    } catch (error) {
      console.error('Error parsing or updating note:', error);
      return false;
    }
  } catch (error) {
    console.error('Error editing game note:', error);
    return false;
  }
}

// Function to delete a note from game history
export async function deleteGameNote(noteId: string, gameHistoryId: string): Promise<boolean> {
  try {
    const currentDb = await getDb();

    // Delete the note
    currentDb.run(
      'DELETE FROM score_log WHERE id = ? AND game_history_id = ? AND entry_json LIKE \'%"type":"note"%\'',
      [noteId, gameHistoryId]
    );

    await saveDb(currentDb);
    return true;
  } catch (error) {
    console.error('Error deleting game note:', error);
    return false;
  }
}
