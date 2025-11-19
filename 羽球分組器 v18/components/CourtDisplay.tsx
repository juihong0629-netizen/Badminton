
import React from 'react';
import { Match } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface CourtDisplayProps {
  match: Match;
  courtNumber: number;
}

export const CourtDisplay: React.FC<CourtDisplayProps> = ({ match, courtNumber }) => {
  const isSingles = match.teamA.length === 1;

  // Ensure we have players to display to avoid errors
  const teamAPlayers = match.teamA || [];
  const teamBPlayers = match.teamB || [];

  return (
    <div className="w-full bg-surface p-4 rounded-lg shadow-inner">
      <h4 className="text-lg font-bold text-center text-primary mb-3">第 {courtNumber} 場地</h4>
      <div className="relative bg-[#4CAF50] aspect-[1/1.5] w-full max-w-[280px] sm:max-w-sm mx-auto p-1 border-2 border-white rounded-md flex flex-col justify-between">
        
        {/* Net Area - A thicker band, z-10 */}
        <div className="absolute top-1/2 left-0 right-0 h-6 bg-[#4CAF50] border-t-2 border-b-2 border-white transform -translate-y-1/2 z-10"></div>
        
        {/* Center line for doubles, z-0 */}
        {!isSingles && <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/80 transform -translate-x-1/2 z-0"></div>}
        
        {/* Team A Area */}
        <div className={`flex h-1/2 ${isSingles ? 'justify-center items-center' : 'justify-around items-center'} py-2`}>
          {teamAPlayers.map((player) => (
            <div key={player.id} className="z-20">
              <PlayerAvatar player={player} />
            </div>
          ))}
        </div>

        {/* Team B Area */}
        <div className={`flex h-1/2 ${isSingles ? 'justify-center items-center' : 'justify-around items-center'} py-2`}>
          {teamBPlayers.map((player) => (
            <div key={player.id} className="z-20">
              <PlayerAvatar player={player} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
