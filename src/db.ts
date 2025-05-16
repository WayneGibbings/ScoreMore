import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import type { TeamData, GameResult, LogEntry } from './App';

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (db) {
    return db;
  }
  const SQL = await initSqlJs({
    locateFile: () => `/sql-wasm.wasm` // Point to the WASM file in the public directory
  });
  const dbFile = localStorage.getItem('sqliteDb');
  if (dbFile) {
    try {
      const Uints = new Uint8Array(dbFile.split(',').map(Number));
      db = new SQL.Database(Uints);
    } catch (e) {
      console.error("Error loading database from localStorage, reinitializing:", e);
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
}

// Schema initialization, only call this if db is new
async function initializeDatabaseSchema(currentDb: Database) {
  currentDb.exec(`
    CREATE TABLE IF NOT EXISTS current_game_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      teams_json TEXT,
      game_active INTEGER,
      is_halftime INTEGER,
      current_inning INTEGER,
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
  console.log('Database schema initialized in sql.js');
  // Save immediately after schema creation
  saveDb(currentDb);
}

// Public function to ensure schema is initialized (e.g. called from App.tsx on mount if needed)
// However, getDb handles new DB initialization now.
export async function ensureDbInitialized() {
  await getDb(); // This will initialize if not already done.
  console.log('Database is ready (sql.js).');
}

// --- Game State Functions ---
export interface CurrentGameState {
  teams: TeamData[];
  gameActive: boolean;
  isHalftime: boolean;
  currentInning: number;
  gameStatus: string;
}

export async function saveCurrentGameState(state: CurrentGameState) {
  const currentDb = await getDb();
  const { teams, gameActive, isHalftime, currentInning, gameStatus } = state;
  currentDb.run(
    `INSERT OR REPLACE INTO current_game_state (id, teams_json, game_active, is_halftime, current_inning, game_status, timestamp)
     VALUES (1, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
    [
      JSON.stringify(teams),
      gameActive ? 1 : 0,
      isHalftime ? 1 : 0,
      currentInning,
      gameStatus
    ]
  );
  await saveDb(currentDb);
}

export async function loadCurrentGameState(): Promise<CurrentGameState | null> {
  const currentDb = await getDb();
  const stmt = currentDb.prepare('SELECT * FROM current_game_state WHERE id = 1');
  let result: CurrentGameState | null = null;
  if (stmt.step()) { // if a row was found
    const row = stmt.getAsObject();
    let parsedTeams: TeamData[];
    try {
      if (row.teams_json) {
        parsedTeams = JSON.parse(row.teams_json as string);
        if (!Array.isArray(parsedTeams)) {
          console.warn("Parsed teams_json from current_game_state is not an array, defaulting.");
          parsedTeams = [];
        }
      } else {
        parsedTeams = [];
      }
    } catch (error) {
      console.error("Failed to parse teams_json from current_game_state:", error);
      parsedTeams = [];
    }
    result = {
      teams: parsedTeams,
      gameActive: !!row.game_active,
      isHalftime: !!row.is_halftime,
      currentInning: (row.current_inning as number) === null || (row.current_inning as number) === undefined ? 1 : (row.current_inning as number),
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
    'INSERT INTO game_history (id, date, teams_json, winner, timestamp) VALUES (?, ?, ?, ?, datetime(\'now\', \'localtime\'))',
    [gameResult.id, gameResult.date, JSON.stringify(gameResult.teams), gameResult.winner]
  );
  await saveDb(currentDb);
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
      } else {
        parsedTeams = [];
      }
    } catch (e) {
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
function parseLogEntries(rows: any[]): LogEntry[] {
    if (!rows) return [];
    return rows.reduce((acc: LogEntry[], row: any) => {
      try {
        if (row.entry_json) {
          const entry = JSON.parse(row.entry_json as string);
          if (entry && typeof entry.id === 'string') {
            acc.push(entry);
          } else {
            console.warn("Parsed log entry is invalid:", entry);
          }
        } else {
          console.warn("entry_json is null or undefined in score_log row.");
        }
      } catch (e) {
        console.error("Failed to parse entry_json in score_log:", e);
      }
      return acc;
    }, []);
  }

export async function addLogEntryToDb(logEntry: LogEntry, gameHistoryId: string | null = null) {
  const currentDb = await getDb();
  currentDb.run(
    'INSERT INTO score_log (id, entry_json, game_history_id, timestamp) VALUES (?, ?, ?, datetime(\'now\', \'localtime\'))',
    [logEntry.id, JSON.stringify(logEntry), gameHistoryId]
  );
  await saveDb(currentDb);
}

export async function loadScoringLogForCurrentGame(): Promise<LogEntry[]> {
  const currentDb = await getDb();
  const stmt = currentDb.prepare('SELECT entry_json FROM score_log WHERE game_history_id IS NULL ORDER BY timestamp DESC');
  const rows: any[] = [];
  while(stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return parseLogEntries(rows);
}

export async function associateScoreLogToGameHistory(logIds: string[], gameHistoryId: string) {
  const currentDb = await getDb();
  if (logIds.length === 0) return;
  const placeholders = logIds.map(() => '?').join(',');
  currentDb.run(
    `UPDATE score_log SET game_history_id = ? WHERE id IN (${placeholders})`,
    [gameHistoryId, ...logIds]
  );
  await saveDb(currentDb);
}

export async function clearUnassociatedScoreLog() {
  const currentDb = await getDb();
  currentDb.run('DELETE FROM score_log WHERE game_history_id IS NULL');
  await saveDb(currentDb);
}

export async function loadScoringLogForGame(gameHistoryId: string): Promise<LogEntry[]> {
  const currentDb = await getDb();
  const stmt = currentDb.prepare('SELECT entry_json FROM score_log WHERE game_history_id = ? ORDER BY timestamp ASC');
  stmt.bind([gameHistoryId]);
  const rows: any[] = [];
  while(stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return parseLogEntries(rows);
}
