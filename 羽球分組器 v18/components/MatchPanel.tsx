
import React from 'react';
import { Match, Player, GameMode } from '../types';
import { ShuffleIcon } from './icons';
import { CourtDisplay } from './CourtDisplay';

interface MatchPanelProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  numberOfCourts: number;
  setNumberOfCourts: (value: number) => void;
  onGenerateMatch: () => void;
  onConfirmMatch: () => void;
  currentMatches: Match[];
  error: string | null;
  selectedCount: number;
}

export const MatchPanel: React.FC<MatchPanelProps> = ({
  gameMode,
  setGameMode,
  numberOfCourts,
  setNumberOfCourts,
  onGenerateMatch,
  onConfirmMatch,
  currentMatches,
  error,
  selectedCount
}) => {
  const isSinglesMode = [GameMode.MensSingles, GameMode.WomensSingles, GameMode.AnySingles].includes(gameMode);
  const playersPerMatch = isSinglesMode ? 2 : 4;
  const totalPlayersNeeded = playersPerMatch * numberOfCourts;

  return (
    <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-on-surface mb-4">2. 對戰設定</h2>
      
      <div className="space-y-4 mb-6">
        <div className="space-y-4">
          <h3 className="text-on-surface">比賽模式</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(GameMode).map(mode => (
              <button
                key={mode}
                onClick={() => setGameMode(mode)}
                className={`w-full text-center px-2 py-2 text-xs sm:text-sm rounded-md transition ${gameMode === mode ? 'bg-primary text-white font-bold' : 'bg-background hover:bg-gray-800'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-background rounded-md">
          <label htmlFor="number-of-courts" className="text-on-surface">場地數量</label>
          <div className="flex items-center space-x-3">
              <button 
                onClick={() => setNumberOfCourts(Math.max(1, numberOfCourts - 1))}
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 font-bold text-lg flex items-center justify-center"
              >-</button>
              <span className="text-lg font-bold w-8 text-center">{numberOfCourts}</span>
              <button 
                onClick={() => setNumberOfCourts(numberOfCourts + 1)}
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 font-bold text-lg flex items-center justify-center"
              >+</button>
          </div>
        </div>
      </div>

      <button
        onClick={onGenerateMatch}
        className="w-full flex items-center justify-center bg-primary hover:bg-primary-focus text-white font-bold py-3 px-4 rounded-md transition duration-300 text-sm sm:text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        disabled={selectedCount < totalPlayersNeeded}
      >
        <ShuffleIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 shrink-0" />
        <span className="truncate">產生對戰組合 ({selectedCount} / {totalPlayersNeeded} 位)</span>
      </button>

      <div className="mt-6 border-t border-gray-700 pt-6">
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {currentMatches.length > 0 ? (
          <div className="w-full space-y-6 animate-fade-in">
             <div className="space-y-6">
                {currentMatches.map((match, index) => (
                    <CourtDisplay key={index} match={match} courtNumber={index + 1} />
                ))}
            </div>
            <button
              onClick={onConfirmMatch}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
            >
              確認所有比賽結束 (更新上場次數)
            </button>
          </div>
        ) : (
            <div className="text-center text-on-surface-secondary min-h-[250px] flex flex-col justify-center items-center">
                <p>請先勾選至少 {totalPlayersNeeded} 位球員</p>
                <p>並點擊上方按鈕來產生對戰組合</p>
            </div>
        )}
      </div>
    </div>
  );
};
