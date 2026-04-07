'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { usePlayer } from '@/hooks/usePlayer';

interface LobbyPlayer {
  id: string;
  name: string;
  connected: boolean;
  isHost: boolean;
}

export default function LobbyPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { playerId } = usePlayer();
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  const fetchLobby = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${roomId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.status === 'auction' || data.status === 'showdown' || data.status === 'finished') {
        router.push(`/game/${roomId}`);
        return;
      }

      setPlayers(data.players);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [roomId, router]);

  useEffect(() => {
    fetchLobby();
    // Poll for updates (fallback without Pusher)
    const interval = setInterval(fetchLobby, 2000);
    return () => clearInterval(interval);
  }, [fetchLobby]);

  const isHost = players.find((p) => p.id === playerId)?.isHost ?? false;
  const canStart = isHost && players.length >= 2;

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/game/${roomId}`);
    } catch (err) {
      setError((err as Error).message);
      setStarting(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">
            Waiting Room
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400">Room Code:</span>
            <button
              onClick={copyCode}
              className="font-mono text-2xl text-white bg-gray-800 px-4 py-1 rounded-lg hover:bg-gray-700 transition-colors tracking-widest"
              title="Click to copy"
            >
              {roomId}
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Share this code with friends to join
          </p>
        </div>

        <div className="bg-gray-800/60 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">
            Players ({players.length}/3)
          </h2>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-700/40 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-white font-medium">
                    {player.name}
                    {player.id === playerId && (
                      <span className="text-amber-400 text-sm ml-1">(you)</span>
                    )}
                  </span>
                </div>
                {player.isHost && (
                  <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">
                    HOST
                  </span>
                )}
              </div>
            ))}

            {players.length < 3 && (
              <div className="flex items-center gap-3 bg-gray-700/20 rounded-lg px-4 py-3 border border-dashed border-gray-600">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                <span className="text-gray-500">Waiting for player...</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {isHost ? (
          <Button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="w-full"
            size="lg"
          >
            {starting
              ? 'Starting...'
              : canStart
                ? 'Start Game'
                : 'Need at least 2 players'}
          </Button>
        ) : (
          <p className="text-gray-400 text-center text-sm">
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}
