'use client';

import type { Card, HandResult } from '@/lib/types';
import { PlayingCard } from './PlayingCard';

interface WonCardsProps {
  cards: Card[];
  bestHand: HandResult | null;
}

export function WonCards({ cards, bestHand }: WonCardsProps) {
  if (cards.length === 0) {
    return (
      <div className="bg-gray-800/40 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-sm">No cards won yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400">Your Cards</h3>
        {bestHand && (
          <span className="text-xs bg-amber-800 text-amber-200 px-2 py-0.5 rounded-full">
            {bestHand.description}
          </span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {cards.map((card, idx) => (
          <PlayingCard
            key={idx}
            card={{ ...card, hidden: false }}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
}
