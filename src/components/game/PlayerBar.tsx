'use client';

import type { PlayerPublicInfo, CardGroupView } from '@/lib/types';
import { RANK_VALUES } from '@/lib/constants';
import { PlayingCard } from './PlayingCard';

interface PlayerBarProps {
  player: PlayerPublicInfo;
  isCurrentPlayer: boolean;
  showBidStatus: boolean;
  wonGroups: CardGroupView[];
}

export function PlayerBar({ player, isCurrentPlayer, showBidStatus, wonGroups }: PlayerBarProps) {
  // Collect and sort this player's won cards (visible ones sorted by suit then rank, hidden ones at the end)
  const wonCards = wonGroups.flatMap((g) => g.cards);
  const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
  const visibleCards = wonCards
    .filter((c) => !c.hidden && c.suit && c.rank)
    .sort((a, b) => {
      const suitDiff = suitOrder[a.suit!] - suitOrder[b.suit!];
      if (suitDiff !== 0) return suitDiff;
      return RANK_VALUES[b.rank!] - RANK_VALUES[a.rank!];
    });
  const hiddenCards = wonCards.filter((c) => c.hidden);
  const sortedCards = [...visibleCards, ...hiddenCards];

  return (
    <div
      className={`
        rounded-lg
        ${isCurrentPlayer
          ? 'bg-amber-900/30 border border-amber-600/50'
          : 'bg-gray-800/50 border border-gray-700'
        }
      `}
    >
      <div className="flex items-center justify-between px-4 py-3">
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

      {sortedCards.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-1 flex-wrap">
            {sortedCards.map((card, idx) => (
              <PlayingCard key={idx} card={card} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
