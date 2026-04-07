'use client';

import type { CardView } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/constants';

interface PlayingCardProps {
  card: CardView;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-10 h-14',
  md: 'w-14 h-20',
  lg: 'w-20 h-28',
};

const rankSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

const suitSizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function PlayingCard({ card, size = 'md' }: PlayingCardProps) {
  const isHidden = card.hidden || (!card.rank && !card.suit);

  if (isHidden) {
    return (
      <div
        className={`
          ${sizeClasses[size]} rounded-lg border-2 border-gray-500
          bg-gradient-to-br from-blue-900 to-blue-700
          flex items-center justify-center shadow-md
          relative overflow-hidden
        `}
      >
        <div className="absolute inset-1 border border-blue-400/30 rounded" />
        <span className="text-blue-300 font-bold">?</span>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const textColor = isRed ? 'text-red-500' : 'text-gray-900';
  const symbol = card.suit ? SUIT_SYMBOLS[card.suit] : '';

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-lg border border-gray-300
        bg-white flex flex-col items-center justify-center
        shadow-md hover:shadow-lg transition-shadow
        relative overflow-hidden
      `}
    >
      {/* Blue stripe for cards that were face-down (hidden from opponents) */}
      {card.faceDown && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
      )}
      <span className={`${rankSizes[size]} ${textColor} font-bold leading-tight`}>
        {card.rank}
      </span>
      <span className={`${suitSizes[size]} ${textColor} leading-tight`}>
        {symbol}
      </span>
    </div>
  );
}
