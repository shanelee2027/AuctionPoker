'use client';

import type { CardGroupView } from '@/lib/types';
import { PlayingCard } from './PlayingCard';

interface CardGroupDisplayProps {
  group: CardGroupView;
  isActive: boolean;
  winnerName?: string;
}

export function CardGroupDisplay({
  group,
  isActive,
  winnerName,
}: CardGroupDisplayProps) {
  return (
    <div
      className={`
        rounded-xl p-3 transition-all duration-300
        ${isActive
          ? 'bg-amber-900/40 border-2 border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
          : group.auctioned
            ? 'bg-gray-800/50 border border-gray-700 opacity-70'
            : 'bg-gray-800/30 border border-gray-600'
        }
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">
          Group {group.index}
        </span>
        {group.auctioned && winnerName && (
          <span className="text-xs bg-green-800 text-green-200 px-2 py-0.5 rounded-full">
            {winnerName}
          </span>
        )}
        {isActive && (
          <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full animate-pulse">
            Bidding
          </span>
        )}
      </div>
      <div className="flex gap-1 flex-wrap justify-center">
        {group.cards.map((card, idx) => (
          <PlayingCard key={idx} card={card} size="sm" />
        ))}
      </div>
    </div>
  );
}
