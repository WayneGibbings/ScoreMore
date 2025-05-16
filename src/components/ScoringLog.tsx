import React from 'react';
import { LogEntry } from '../App';
import { ClockIcon } from 'lucide-react';
interface ScoringLogProps {
  entries: LogEntry[];
}
export const ScoringLog: React.FC<ScoringLogProps> = ({
  entries
}) => {
  return <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Scoring Log</h2>
      <div className="h-[400px] overflow-y-auto">
        {entries.length === 0 ? <div className="text-center text-gray-500 py-4">
            No goals scored yet
          </div> : <div className="space-y-2">
            {entries.map(entry => <div key={entry.id} className="flex items-start space-x-2 p-2 border-b last:border-b-0">
                <ClockIcon size={16} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">{entry.timestamp}</div>
                  {entry.type === 'halftime' ? <div className="font-medium text-yellow-600">Half Time</div> : <div>
                      <span className="font-medium">{entry.playerName}</span> (
                      {entry.teamName}){' '}
                      <span className={entry.points > 0 ? 'text-green-600' : 'text-red-600'}>
                        {entry.points > 0 ? '+' : ''}
                        {entry.points} goal
                        {Math.abs(entry.points) !== 1 ? 's' : ''}
                      </span>
                    </div>}
                </div>
              </div>)}
          </div>}
      </div>
    </div>;
};