'use client';

import { useState, useEffect } from 'react';

interface PlayerIdentity {
  playerId: string | null;
  playerName: string | null;
  setPlayer: (id: string, name: string) => void;
  clearPlayer: () => void;
}

export function usePlayer(): PlayerIdentity {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('auctionPokerPlayer');
    if (stored) {
      const { id, name } = JSON.parse(stored);
      setPlayerId(id);
      setPlayerName(name);
    }
  }, []);

  const setPlayer = (id: string, name: string) => {
    setPlayerId(id);
    setPlayerName(name);
    localStorage.setItem('auctionPokerPlayer', JSON.stringify({ id, name }));
  };

  const clearPlayer = () => {
    setPlayerId(null);
    setPlayerName(null);
    localStorage.removeItem('auctionPokerPlayer');
  };

  return { playerId, playerName, setPlayer, clearPlayer };
}
