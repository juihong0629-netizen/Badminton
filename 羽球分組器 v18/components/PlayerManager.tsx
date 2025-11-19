
import React, { useState } from 'react';
import { Player, Gender } from '../types';
import { TrashIcon, MaleIcon, FemaleIcon, StarIcon } from './icons';

interface PlayerManagerProps {
  players: Player[];
  selectedPlayerIds: Set<string>;
  onAddPlayer: (name: string, gender: Gender) => void;
  onDeletePlayer: (id: string) => void;
  onTogglePlayer: (id: string) => void;
  onTogglePlayerPriority: (id: string) => void;
  onToggleAll: (select: boolean) => void;
  onClearAll: () => void;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({
  players,
  selectedPlayerIds,
  onAddPlayer,
  onDeletePlayer,
  onTogglePlayer,
  onTogglePlayerPriority,
  onToggleAll,
  onClearAll,
}) => {
  const [maleInput, setMaleInput] = useState('');
  const [femaleInput, setFemaleInput] = useState('');

  const handleAddPlayers = (input: string, gender: Gender) => {
    if (input.trim()) {
      const names = input.trim().split(/[,，、\s]+/).filter(Boolean);
      names.forEach(name => {
        onAddPlayer(name, gender);
      });
    }
  };

  const handleMaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddPlayers(maleInput, Gender.Male);
    setMaleInput('');
  };

  const handleFemaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddPlayers(femaleInput, Gender.Female);
    setFemaleInput('');
  };

  const allSelected = players.length > 0 && players.every(p => selectedPlayerIds.has(p.id));

  return (
    <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-on-surface mb-4">1. 球員名單</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">新增球員</h3>
        <p className="text-sm text-on-surface-secondary mb-4 break-words">可一次輸入多位，可使用逗號、頓號、或空白分隔。</p>
        
        <div className="space-y-3 mt-4">
          <form onSubmit={handleMaleSubmit} className="flex items-center gap-2 sm:gap-3">
            <label htmlFor="male-input" className="text-blue-400 font-semibold w-8 shrink-0 text-lg flex justify-center items-center">
              {Gender.Male}
            </label>
            <input
              id="male-input"
              type="text"
              value={maleInput}
              onChange={(e) => setMaleInput(e.target.value)}
              placeholder="輸入球員"
              className="flex-1 bg-background border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none min-w-0 placeholder:opacity-50"
            />
            <button type="submit" className="bg-secondary hover:bg-indigo-600 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition duration-300 shrink-0 whitespace-nowrap">
              新增
            </button>
          </form>

          <form onSubmit={handleFemaleSubmit} className="flex items-center gap-2 sm:gap-3">
            <label htmlFor="female-input" className="text-pink-400 font-semibold w-8 shrink-0 text-lg flex justify-center items-center">
              {Gender.Female}
            </label>
            <input
              id="female-input"
              type="text"
              value={femaleInput}
              onChange={(e) => setFemaleInput(e.target.value)}
              placeholder="輸入球員"
              className="flex-1 bg-background border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none min-w-0 placeholder:opacity-50"
            />
            <button type="submit" className="bg-secondary hover:bg-indigo-600 text-white font-bold py-2 px-3 sm:px-4 rounded-md transition duration-300 shrink-0 whitespace-nowrap">
              新增
            </button>
          </form>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h3 className="text-lg font-semibold">選擇上場球員</h3>
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={onClearAll}
                  disabled={players.length === 0}
                  className="flex items-center text-sm text-red-500 hover:text-red-400 transition disabled:text-gray-600 disabled:cursor-not-allowed whitespace-nowrap"
                  title="清除所有球員"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">全部清除</span>
                  <span className="sm:hidden">清除</span>
                </button>
                <div className="flex items-center whitespace-nowrap">
                  <input
                      type="checkbox"
                      id="select-all"
                      checked={allSelected}
                      onChange={() => onToggleAll(!allSelected)}
                      className="h-4 w-4 rounded border-gray-500 text-primary focus:ring-primary bg-gray-700"
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm text-on-surface-secondary">全選</label>
                </div>
            </div>
        </div>

        <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
          {players.length === 0 ? (
             <p className="text-on-surface-secondary text-center py-4">尚未新增任何球員</p>
          ) : (
            players.map(player => (
            <div key={player.id} className="flex items-center justify-between bg-background p-2 sm:p-3 rounded-md hover:bg-gray-800 transition gap-2">
              <div className="flex items-center min-w-0 flex-1">
                <input
                  type="checkbox"
                  id={`player-${player.id}`}
                  checked={selectedPlayerIds.has(player.id)}
                  onChange={() => onTogglePlayer(player.id)}
                  className="h-5 w-5 rounded border-gray-500 text-primary focus:ring-primary bg-gray-700 shrink-0"
                />
                <label htmlFor={`player-${player.id}`} className="ml-2 sm:ml-4 flex items-center cursor-pointer min-w-0 flex-1">
                  {player.gender === Gender.Male 
                    ? <MaleIcon className="w-6 h-6 text-blue-400 shrink-0" /> 
                    : <FemaleIcon className="w-6 h-6 text-pink-400 shrink-0" />}
                  <span className="ml-2 text-base sm:text-lg truncate">{player.name}</span>
                </label>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <span className="text-xs sm:text-sm text-on-surface-secondary whitespace-nowrap flex items-center">
                    <span className="hidden sm:inline">上場: </span>
                    <span className="font-semibold text-on-surface ml-1">{player.playCount}</span>
                    <span className="sm:hidden ml-0.5">場</span>
                    <span className="hidden sm:inline ml-1"> 次</span>
                </span>
                <button 
                  onClick={() => onTogglePlayerPriority(player.id)} 
                  className={`flex items-center space-x-1 transition ${player.isPriority ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-500 hover:text-yellow-400'}`} 
                  title="設為必選"
                >
                  <StarIcon filled={!!player.isPriority} className="w-5 h-5" />
                  <span className="text-sm font-medium inline">必選</span>
                </button>
                <button onClick={() => onDeletePlayer(player.id)} className="text-gray-500 hover:text-red-500 transition">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
