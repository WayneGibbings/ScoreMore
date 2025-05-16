import React from 'react';
import { TeamData } from '../App';
interface ScoreBoardProps {
  teams: TeamData[];
  isHalftime: boolean;
}
export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  teams,
  isHalftime
}) => {
  return <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4 mb-6">
      <h2 className="text-center text-lg font-medium mb-3">
        {isHalftime && <span className="ml-2 text-yellow-400">(Half Time)</span>}
      </h2>
      <div className="flex justify-center items-center">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold">{teams[0].name}</div>
          <div className={`text-4xl font-bold text-${teams[0].color}-400`}>{teams[0].totalScore}</div>
        </div>
        <div className="text-3xl font-bold px-4">:</div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold">{teams[1].name}</div>
          <div className={`text-4xl font-bold text-${teams[1].color}-400`}>{teams[1].totalScore}</div>
        </div>
      </div>
    </div>;
};