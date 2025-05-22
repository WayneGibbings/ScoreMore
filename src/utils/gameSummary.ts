/**
 * Utility functions for creating and formatting game summaries
 */

import type { GameResult, LogEntry } from '../App';
import { formatDateForDisplay } from './dateFormat';

/**
 * Format a game result into a text summary suitable for sharing
 *
 * @param game - The game result to summarize
 * @param notes - Optional notes associated with the game
 * @returns Formatted text summary of the game
 */
export function formatGameSummary(
  game: GameResult,
  gameNotes: Record<string, LogEntry[]> = {}
): string {
  let summary = `Game Summary (${formatDateForDisplay(game.date)})\n`;
  summary += `${game.teams[0].name} ${game.teams[0].totalScore} - ${game.teams[1].totalScore} ${game.teams[1].name}\n\n`;

  // Add team summaries
  game.teams.forEach(team => {
    summary += `${team.name}:\n`;

    // Make sure we have players to show
    if (team.players && team.players.length > 0) {
      // Sort active players alphabetically
      [...team.players]
        .filter(player => player.active) // Only include active players
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(player => {
          if (player.score > 0) {
            summary += `- ${player.name}: ${player.score} ${player.score === 1 ? 'goal' : 'goals'}\n`;
          } else {
            summary += `- ${player.name}\n`;
          }
        });
    } else {
      summary += `- No players\n`;
    }

    summary += '\n';
  });

  // Add notes if available
  if (gameNotes[game.id] && gameNotes[game.id].length > 0) {
    const notes = gameNotes[game.id].filter(entry => entry.type === 'note');
    if (notes.length > 0) {
      summary += `Notes:\n`;
      notes.forEach(note => {
        summary += `- ${note.content}\n`;
      });
      summary += '\n';
    }
  }

  return summary;
}
