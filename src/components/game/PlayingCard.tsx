'use client';

import type { CardView } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/constants';

interface PlayingCardProps {
  card: CardView;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-10 h-14 text-xs',
  md: 'w-14 h-20 text-sm',
  lg: 'w-20 h-28 text-lg',
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
        bg-white flex flex-col items-center justify-between
        p-1 shadow-md hover:shadow-lg transition-shadow
        ${card.faceDown ? 'ring-2 ring-amber-400' : ''}
      `}
    >
      <div className={`self-start leading-none ${textColor} font-bold`}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
      <div className={`text-xl ${textColor}`}>{symbol}</div>
      <div className={`self-end leading-none ${textColor} font-bold rotate-180`}>
        <div>{card.rank}</div>
        <div>{symbol}</div>
      </div>
    </div>
  );
}
