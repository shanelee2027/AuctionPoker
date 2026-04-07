'use client';

import type { PlayerView } from '@/lib/types';
import { PlayingCard } from './PlayingCard';
import { Button } from '../ui/Button';

interface ShowdownViewProps {
  gameState: PlayerView;
  currentPlayerId: string;
  onPlayAgain?: () => void;
}

export function ShowdownView({
  gameState,
  currentPlayerId,
  onPlayAgain,
}: ShowdownViewProps) {
  const { winner } = gameState;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Winner announcement */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-amber-400">Game Over!</h1>
          {winner && (
            <>
              <p className="text-2xl text-white">
                {winner.playerId === currentPlayerId
                  ? 'You Win!'
                  : `${winner.playerName} Wins!`}
              </p>
              <p className="text-lg text-amber-300">{winner.hand.description}</p>
              <div className="flex gap-2 justify-center mt-4">
                {winner.hand.cards.map((card, idx) => (
                  <PlayingCard
                    key={idx}
                    card={{ ...card, hidden: false }}
                    size="lg"
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* All players' hands */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-400 text-center">
            All Players
          </h2>
          {gameState.players.map((player) => {
            const isWinner = winner?.playerId === player.id;
            return (
              <div
                key={player.id}
                className={`
                  rounded-xl p-4
                  ${isWinner
                    ? 'bg-amber-900/40 border-2 border-amber-500'
                    : 'bg-gray-800/50 border border-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">
                      {player.name}
                      {player.id === currentPlayerId && (
                        <span className="text-amber-400 text-sm ml-1">(you)</span>
                      )}
                    </span>
                    {isWinner && (
                      <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">
                        Winner
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {player.chips} chips remaining
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {/* Show all cards for all players in showdown */}
                  {gameState.groups
                    .filter((g) => g.winnerId === player.id)
                    .flatMap((g) => g.cards)
                    .map((card, idx) => (
                      <PlayingCard key={idx} card={card} size="sm" />
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Play again */}
        {onPlayAgain && (
          <div className="text-center">
            <Button onClick={onPlayAgain} size="lg">
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
