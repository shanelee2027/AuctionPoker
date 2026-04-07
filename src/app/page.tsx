'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePlayer } from '@/hooks/usePlayer';

export default function Home() {
  const router = useRouter();
  const { setPlayer } = usePlayer();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlayer(data.playerId, name.trim());
      router.push(`/lobby/${data.roomId}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Enter a room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomCode.trim().toUpperCase(),
          playerName: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlayer(data.playerId, name.trim());
      router.push(`/lobby/${data.roomId}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-amber-400 mb-2">
            Auction Poker
          </h1>
          <p className="text-gray-400">
            Bid on cards. Build your hand. Win the pot.
          </p>
        </div>

        {mode === 'menu' && (
          <div className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              className="w-full"
              size="lg"
            >
              Create Room
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Join Room
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-gray-800/60 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Create a Room</h2>
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button
                onClick={() => { setMode('menu'); setError(''); }}
                variant="secondary"
              >
                Back
              </Button>
              <Button onClick={handleCreate} disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-gray-800/60 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Join a Room</h2>
            <Input
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
            <Input
              label="Room Code"
              placeholder="e.g. ABCD"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
              className="font-mono text-lg tracking-widest text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button
                onClick={() => { setMode('menu'); setError(''); }}
                variant="secondary"
              >
                Back
              </Button>
              <Button onClick={handleJoin} disabled={loading} className="flex-1">
                {loading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
