'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerView } from '@/lib/types';

interface UseGameStateReturn {
  gameState: PlayerView | null;
  isLoading: boolean;
  error: string | null;
  submitBid: (amount: number) => Promise<void>;
  cancelBid: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  refreshState: () => Promise<void>;
}

export function useGameState(
  roomId: string,
  playerId: string | null
): UseGameStateReturn {
  const [gameState, setGameState] = useState<PlayerView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshState = useCallback(async () => {
    if (!playerId) return;
    try {
      const res = await fetch(`/api/game/state/${roomId}?playerId=${playerId}`);
      if (!res.ok) throw new Error('Failed to fetch game state');
      const data = await res.json();
      setGameState(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, playerId]);

  // Poll for state updates
  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 2000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const submitBid = useCallback(
    async (amount: number) => {
      try {
        const res = await fetch('/api/game/bid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, playerId, amount }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to submit bid');
        }

        setGameState((prev) =>
          prev ? { ...prev, myBidSubmitted: true } : prev
        );

        await refreshState();
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [roomId, playerId, refreshState]
  );

  const cancelBid = useCallback(async () => {
    try {
      const res = await fetch('/api/game/cancel-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel bid');
      }

      setGameState((prev) =>
        prev ? { ...prev, myBidSubmitted: false } : prev
      );

      await refreshState();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [roomId, playerId, refreshState]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      try {
        const res = await fetch('/api/game/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, playerId, text: trimmed }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to send message');
        }
        await refreshState();
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [roomId, playerId, refreshState]
  );

  return { gameState, isLoading, error, submitBid, cancelBid, sendMessage, refreshState };
}
