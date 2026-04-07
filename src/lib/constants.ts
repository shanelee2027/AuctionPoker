import type { Suit, Rank } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['9', '10', 'J', 'Q', 'K', 'A'];

export const RANK_VALUES: Record<Rank, number> = {
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

export const STARTING_CHIPS = 100;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 3;
export const MIN_GROUPS = 5;
export const MAX_GROUPS = 8;
export const FACE_DOWN_COUNT_MIN = 3;
export const FACE_DOWN_COUNT_MAX = 5;
export const DECK_SIZE = 24; // 4 suits * 6 ranks

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};
