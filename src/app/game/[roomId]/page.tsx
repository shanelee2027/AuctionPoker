'use client';

import { use } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import { useGameState } from '@/hooks/useGameState';
import { GameBoard } from '@/components/game/GameBoard';
import { ShowdownView } from '@/components/game/ShowdownView';

export default function GamePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const { playerId } = usePlayer();
  const { gameState, isLoading, error, submitBid, refreshState } =
    useGameState(roomId, playerId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={refreshState}
            className="text-amber-400 underline hover:text-amber-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || !playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 flex items-center justify-center">
        <p className="text-gray-400">Game not found</p>
      </div>
    );
  }

  // Showdown / Finished view
  if (gameState.status === 'showdown' || gameState.status === 'finished') {
    return (
      <ShowdownView
        gameState={gameState}
        currentPlayerId={playerId}
        onPlayAgain={() => window.location.href = '/'}
      />
    );
  }

  // Auction view
  return (
    <GameBoard
      gameState={gameState}
      currentPlayerId={playerId}
      onSubmitBid={submitBid}
    />
  );
}
