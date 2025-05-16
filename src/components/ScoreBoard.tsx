import React from 'react';
import { TeamData } from '../App';

interface ScoreBoardProps {
  teams: TeamData[];
  isHalftime: boolean;
}

// Helper function to get color CSS variable or fallback hex color
const getTeamScoreColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    'red': '#f87171',
    'blue': '#60a5fa',
    'green': '#4ade80',
    'yellow': '#facc15',
    'purple': '#c084fc',
    'pink': '#f472b6',
    'orange': '#fb923c',
    'teal': '#2dd4bf',
    'indigo': '#818cf8',
    'black': '#1a1a1a' // Much darker gray, very close to black
  };
  return colorMap[color] || colorMap['black'];
};

// Function to determine if a color is considered "dark" and needs a light background
const isDarkColor = (color: string): boolean => {
  return color === 'black' || color === 'purple' || color === 'indigo';
};

// No longer using text shadow effects
const getTextShadowStyle = (_color: string): React.CSSProperties => {
  return {};
};

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
          <div className="text-lg font-bold">
            {teams[0].name}
          </div>
          <div 
            className={`text-4xl font-bold rounded px-3 py-1 mt-1 inline-block ${isDarkColor(teams[0].color) ? 'bg-gray-200 bg-opacity-30' : ''}`}
            style={{ 
              color: getTeamScoreColor(teams[0].color),
              ...getTextShadowStyle(teams[0].color)
            }}
          >
            {teams[0].totalScore}
          </div>
        </div>
        <div className="text-3xl font-bold px-4">:</div>
        <div className="flex-1 text-center">
          <div className="text-lg font-bold">
            {teams[1].name}
          </div>
          <div 
            className={`text-4xl font-bold rounded px-3 py-1 mt-1 inline-block ${isDarkColor(teams[1].color) ? 'bg-gray-200 bg-opacity-30' : ''}`}
            style={{ 
              color: getTeamScoreColor(teams[1].color),
              ...getTextShadowStyle(teams[1].color)
            }}
          >
            {teams[1].totalScore}
          </div>
        </div>
      </div>
    </div>;
};