'use client';

import type { PlayerPublicInfo } from '@/lib/types';

interface PlayerBarProps {
  player: PlayerPublicInfo;
  isCurrentPlayer: boolean;
  showBidStatus: boolean;
}

export function PlayerBar({ player, isCurrentPlayer, showBidStatus }: PlayerBarProps) {
  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3 rounded-lg
        ${isCurrentPlayer
          ? 'bg-amber-900/30 border border-amber-600/50'
          : 'bg-gray-800/50 border border-gray-700'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            player.connected ? 'bg-green-500' : 'bg-gray-500'
          }`}
        />
        <div>
          <div className="text-white font-medium text-sm">
            {player.name}
            {isCurrentPlayer && (
              <span className="text-amber-400 text-xs ml-1">(you)</span>
            )}
            {player.isHost && (
              <span className="text-yellow-400 text-xs ml-1">HOST</span>
            )}
          </div>
          <div className="text-gray-400 text-xs">
            {player.cardCount} cards won
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showBidStatus && (
          <div
            className={`text-xs px-2 py-0.5 rounded-full ${
              player.bidSubmitted
                ? 'bg-green-800 text-green-200'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {player.bidSubmitted ? 'Bid In' : 'Thinking...'}
          </div>
        )}
        <div className="text-right">
          <div className="text-amber-400 font-bold">{player.chips}</div>
          <div className="text-gray-500 text-xs">chips</div>
        </div>
      </div>
    </div>
  );
}
