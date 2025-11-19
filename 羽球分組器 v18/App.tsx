
import React, { useState, useEffect, useCallback } from 'react';
import { Player, Gender, Match, GameMode } from './types';
import { PlayerManager } from './components/PlayerManager';
import { MatchPanel } from './components/MatchPanel';

const LOCAL_STORAGE_KEY = 'badminton_app_data';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedData ? JSON.parse(savedData).players || [] : [];
    } catch (error) {
      console.error("Failed to load players from localStorage", error);
      return [];
    }
  });

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(() => {
     try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Ensure selectedPlayerIds is an array before creating a Set
        return new Set(Array.isArray(parsedData.selectedPlayerIds) ? parsedData.selectedPlayerIds : []);
      }
      const initialIds = players.map(p => p.id);
      return new Set(initialIds);
    } catch (error) {
      console.error("Failed to load selected players from localStorage", error);
       const initialIds = players.map(p => p.id);
      return new Set(initialIds);
    }
  });

  const [gameMode, setGameMode] = useState<GameMode>(GameMode.MixedDoubles);
  const [numberOfCourts, setNumberOfCourts] = useState(1);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Save state to localStorage whenever players or selectedPlayerIds change
  useEffect(() => {
    try {
      const dataToSave = {
        players,
        selectedPlayerIds: Array.from(selectedPlayerIds),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [players, selectedPlayerIds]);


  // Reset matches if settings change
  useEffect(() => {
    setCurrentMatches([]);
    setError(null);
  }, [selectedPlayerIds, gameMode, numberOfCourts]);


  const handleAddPlayer = useCallback((name: string, gender: Gender) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      gender,
      playCount: 0,
      isPriority: false,
    };
    setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
    setSelectedPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.add(newPlayer.id);
        return newSet;
    });
  }, []);

  const handleDeletePlayer = useCallback((id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    const newSelectedIds = new Set(selectedPlayerIds);
    newSelectedIds.delete(id);
    setSelectedPlayerIds(newSelectedIds);
  }, [players, selectedPlayerIds]);

  const handleTogglePlayer = useCallback((id: string) => {
    const newSet = new Set(selectedPlayerIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPlayerIds(newSet);
  }, [selectedPlayerIds]);

  const handleTogglePlayerPriority = useCallback((id: string) => {
    setPlayers(players.map(p =>
      p.id === id ? { ...p, isPriority: !p.isPriority } : p
    ));
  }, [players]);

  const handleToggleAll = useCallback((select: boolean) => {
      if(select) {
          const allIds = new Set(players.map(p => p.id));
          setSelectedPlayerIds(allIds);
      } else {
          setSelectedPlayerIds(new Set());
      }
  }, [players]);

  const handleClearAllPlayers = useCallback(() => {
    if (window.confirm('確定要清除所有球員資料嗎？此動作無法復原。')) {
      setPlayers([]);
      setSelectedPlayerIds(new Set());
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);
  
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const selectPlayers = (pool: Player[], count: number, prioritize: boolean): Player[] => {
    if (pool.length < count) return [];

    if (prioritize) {
        const tiers = pool.reduce<Record<number, Player[]>>((acc, player) => {
            const pCount = player.playCount;
            if (!acc[pCount]) acc[pCount] = [];
            acc[pCount].push(player);
            return acc;
        }, {} as Record<number, Player[]>);
        const sortedTiers = Object.entries(tiers).sort(([a], [b]) => Number(a) - Number(b));
        let selected: Player[] = [];
        for (const [, tierPlayers] of sortedTiers) {
            const shuffled = shuffleArray(tierPlayers);
            const needed = count - selected.length;
            selected.push(...shuffled.slice(0, needed));
            if (selected.length === count) break;
        }
        return selected;
    } else {
        return shuffleArray(pool).slice(0, count);
    }
  }

  const handleGenerateMatch = useCallback(() => {
    setError(null);
    setCurrentMatches([]);

    const availablePlayers = players.filter(p => selectedPlayerIds.has(p.id));
    const isSinglesMode = [GameMode.MensSingles, GameMode.WomensSingles, GameMode.AnySingles].includes(gameMode);
    const playersPerMatch = isSinglesMode ? 2 : 4;
    const totalPlayersNeeded = playersPerMatch * numberOfCourts;

    if (availablePlayers.length < totalPlayersNeeded) {
        setError(`人數不足。目前模式需要 ${totalPlayersNeeded} 位球員，但只勾選了 ${availablePlayers.length} 位。`);
        return;
    }

    const priorityPlayers = availablePlayers.filter(p => p.isPriority);
    if (priorityPlayers.length > totalPlayersNeeded) {
      setError(`必選球員人數 (${priorityPlayers.length}) 已超過此模式所需的總人數 (${totalPlayersNeeded})。`);
      return;
    }

    if (gameMode === GameMode.MixedDoubles) {
        const males = availablePlayers.filter(p => p.gender === Gender.Male);
        const females = availablePlayers.filter(p => p.gender === Gender.Female);
        const neededPerGender = 2 * numberOfCourts;

        const priorityMales = males.filter(p => p.isPriority);
        const priorityFemales = females.filter(p => p.isPriority);

        if (priorityMales.length > neededPerGender) {
            setError(`必選男性球員人數 (${priorityMales.length}) 超過混雙所需人數 (${neededPerGender})。`);
            return;
        }
        if (priorityFemales.length > neededPerGender) {
            setError(`必選女性球員人數 (${priorityFemales.length}) 超過混雙所需人數 (${neededPerGender})。`);
            return;
        }

        const regularMales = males.filter(p => !p.isPriority);
        const regularFemales = females.filter(p => !p.isPriority);
        
        const remainingMalesNeeded = neededPerGender - priorityMales.length;
        const remainingFemalesNeeded = neededPerGender - priorityFemales.length;

        if (regularMales.length < remainingMalesNeeded || regularFemales.length < remainingFemalesNeeded) {
            setError(`混雙模式湊對失敗，勾選的男/女球員不足。`);
            return;
        }

        const selectedRegularMales = selectPlayers(regularMales, remainingMalesNeeded, true);
        const selectedRegularFemales = selectPlayers(regularFemales, remainingFemalesNeeded, true);

        const selectedMales = shuffleArray([...priorityMales, ...selectedRegularMales]);
        const selectedFemales = shuffleArray([...priorityFemales, ...selectedRegularFemales]);
        
        const newMatches: Match[] = [];
        for (let i = 0; i < numberOfCourts; i++) {
            const m1 = selectedMales[i * 2];
            const m2 = selectedMales[i * 2 + 1];
            const f1 = selectedFemales[i * 2];
            const f2 = selectedFemales[i * 2 + 1];

            if (!m1 || !m2 || !f1 || !f2) continue;

            if (Math.random() > 0.5) {
                newMatches.push({ teamA: [m1, f1], teamB: [m2, f2] });
            } else {
                newMatches.push({ teamA: [m1, f2], teamB: [m2, f1] });
            }
        }
        setCurrentMatches(newMatches);
        return;
    }

    // Logic for all other modes
    let pool = availablePlayers;
    if (gameMode === GameMode.MensDoubles || gameMode === GameMode.MensSingles) {
        pool = availablePlayers.filter(p => p.gender === Gender.Male);
    } else if (gameMode === GameMode.WomensDoubles || gameMode === GameMode.WomensSingles) {
        pool = availablePlayers.filter(p => p.gender === Gender.Female);
    }
    
    const priorityPoolPlayers = pool.filter(p => p.isPriority);
    const regularPoolPlayers = pool.filter(p => !p.isPriority);
    
    if (priorityPoolPlayers.length > totalPlayersNeeded) {
        setError(`必選球員人數 (${priorityPoolPlayers.length}) 已超過此模式所需的總人數 (${totalPlayersNeeded})。`);
        return;
    }

    const remainingNeeded = totalPlayersNeeded - priorityPoolPlayers.length;

    if (regularPoolPlayers.length < remainingNeeded) {
        setError(`此模式需要 ${totalPlayersNeeded} 位指定條件的球員，但人數不足。`);
        return;
    }

    const selectedRegulars = selectPlayers(regularPoolPlayers, remainingNeeded, true);
    
    const allMatchPlayers = [...priorityPoolPlayers, ...selectedRegulars];
    
    const shuffledAll = shuffleArray(allMatchPlayers);
    const newMatches: Match[] = [];

    for (let i = 0; i < numberOfCourts; i++) {
        const startIndex = i * playersPerMatch;
        const matchPlayers = shuffledAll.slice(startIndex, startIndex + playersPerMatch);

        if (matchPlayers.length < playersPerMatch) continue;

        if (isSinglesMode) {
            newMatches.push({ teamA: [matchPlayers[0]], teamB: [matchPlayers[1]] });
        } else {
            newMatches.push({ teamA: [matchPlayers[0], matchPlayers[1]], teamB: [matchPlayers[2], matchPlayers[3]] });
        }
    }

    if (newMatches.length < numberOfCourts) {
        setError("產生對戰時發生未知錯誤，無法產生足夠的場次。");
        return;
    }

    setCurrentMatches(newMatches);

  }, [players, selectedPlayerIds, gameMode, numberOfCourts]);


  const handleConfirmMatch = () => {
    if (currentMatches.length === 0) return;

    const matchPlayerIds = new Set(
        currentMatches.flatMap(match => 
            [...match.teamA.map(p => p.id), ...match.teamB.map(p => p.id)]
        )
    );
    
    setPlayers(prevPlayers => 
      prevPlayers.map(p => 
        matchPlayerIds.has(p.id) ? { ...p, playCount: p.playCount + 1 } : p
      )
    );
    
    setCurrentMatches([]);
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text animated-gradient">
            羽球分組器
          </h1>
          <p className="text-on-surface-secondary mt-2">讓我們從從容容地分組</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <PlayerManager
              players={players}
              selectedPlayerIds={selectedPlayerIds}
              onAddPlayer={handleAddPlayer}
              onDeletePlayer={handleDeletePlayer}
              onTogglePlayer={handleTogglePlayer}
              onTogglePlayerPriority={handleTogglePlayerPriority}
              onToggleAll={handleToggleAll}
              onClearAll={handleClearAllPlayers}
            />
          </div>
          <div className="lg:col-span-2">
            <MatchPanel 
                gameMode={gameMode}
                setGameMode={setGameMode}
                numberOfCourts={numberOfCourts}
                setNumberOfCourts={setNumberOfCourts}
                onGenerateMatch={handleGenerateMatch}
                onConfirmMatch={handleConfirmMatch}
                currentMatches={currentMatches}
                error={error}
                selectedCount={selectedPlayerIds.size}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
