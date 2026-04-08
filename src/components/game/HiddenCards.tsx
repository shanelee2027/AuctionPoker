'use client';

import { useMemo } from 'react';
import type { PlayerView, Rank, Suit } from '@/lib/types';
import { SUITS, RANKS, SUIT_SYMBOLS, RANK_VALUES } from '@/lib/constants';

interface HiddenCardsProps {
  gameState: PlayerView;
}

export function HiddenCards({ gameState }: HiddenCardsProps) {
  const unknownCards = useMemo(() => {
    // Build set of all known cards (visible face-up cards + player's own won cards)
    const known = new Set<string>();

    // Cards visible in groups (not hidden)
    for (const group of gameState.groups) {
      for (const card of group.cards) {
        if (!card.hidden && card.rank && card.suit) {
          known.add(`${card.rank}-${card.suit}`);
        }
      }
    }

    // Player's own won cards (includes face-down cards revealed to them)
    for (const card of gameState.myCards) {
      known.add(`${card.rank}-${card.suit}`);
    }

    // Full deck minus known = unknown
    const unknown: { rank: Rank; suit: Suit }[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        if (!known.has(`${rank}-${suit}`)) {
          unknown.push({ rank, suit });
        }
      }
    }

    // Sort by rank value then suit
    const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
    unknown.sort((a, b) => {
      const rv = RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
      if (rv !== 0) return rv;
      return suitOrder[a.suit] - suitOrder[b.suit];
    });

    return unknown;
  }, [gameState.groups, gameState.myCards]);

  if (unknownCards.length === 0) return null;

  return (
    <div className="bg-gray-800/40 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">
        Hidden Cards
        <span className="ml-2 text-xs text-gray-500">
          ({unknownCards.length} remaining)
        </span>
      </h3>
      <div className="flex gap-1 flex-wrap">
        {unknownCards.map(({ rank, suit }) => {
          const isRed = suit === 'hearts' || suit === 'diamonds';
          return (
            <div
              key={`${rank}-${suit}`}
              className={`
                w-10 h-14 rounded-lg border border-gray-600
                bg-gray-700/60 flex flex-col items-center justify-center
                text-xs
              `}
            >
              <span className={`font-bold leading-tight ${isRed ? 'text-red-400' : 'text-gray-300'}`}>
                {rank}
              </span>
              <span className={`text-sm leading-tight ${isRed ? 'text-red-400' : 'text-gray-300'}`}>
                {SUIT_SYMBOLS[suit]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
