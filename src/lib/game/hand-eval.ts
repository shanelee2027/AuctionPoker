import type { Card, HandResult } from '../types';
import { HandRank } from '../types';
import { RANK_VALUES } from '../constants';

function cardValue(card: Card): number {
  return RANK_VALUES[card.rank];
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const results: T[][] = [];

  function combine(start: number, combo: T[]) {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return results;
}

export function evaluateHand(fiveCards: Card[]): HandResult {
  if (fiveCards.length !== 5) {
    throw new Error('Hand must have exactly 5 cards');
  }

  const values = fiveCards.map(cardValue).sort((a, b) => b - a);
  const suits = fiveCards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Check for straight
  const isStraight = checkStraight(values);

  // Count ranks
  const rankCounts = new Map<number, number>();
  for (const v of values) {
    rankCounts.set(v, (rankCounts.get(v) || 0) + 1);
  }
  const counts = Array.from(rankCounts.entries())
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  // Determine hand rank
  // Royal Flush: A-K-Q-J-10 all same suit
  if (isFlush && isStraight && values[0] === 14 && values[4] === 10) {
    return {
      rank: HandRank.ROYAL_FLUSH,
      cards: fiveCards,
      values,
      description: 'Royal Flush',
    };
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return {
      rank: HandRank.STRAIGHT_FLUSH,
      cards: fiveCards,
      values,
      description: `Straight Flush, ${rankName(values[0])} high`,
    };
  }

  // Flush (beats four of a kind in short deck)
  if (isFlush) {
    return {
      rank: HandRank.FLUSH,
      cards: fiveCards,
      values,
      description: `Flush, ${rankName(values[0])} high`,
    };
  }

  // Four of a Kind
  if (counts[0][1] === 4) {
    const quadVal = counts[0][0];
    const kicker = counts[1][0];
    return {
      rank: HandRank.FOUR_OF_A_KIND,
      cards: fiveCards,
      values: [quadVal, kicker],
      description: `Four of a Kind, ${rankName(quadVal)}s`,
    };
  }

  // Full House
  if (counts[0][1] === 3 && counts[1][1] === 2) {
    return {
      rank: HandRank.FULL_HOUSE,
      cards: fiveCards,
      values: [counts[0][0], counts[1][0]],
      description: `Full House, ${rankName(counts[0][0])}s full of ${rankName(counts[1][0])}s`,
    };
  }

  // Three of a Kind
  if (counts[0][1] === 3) {
    const tripVal = counts[0][0];
    const kickers = counts.slice(1).map((c) => c[0]).sort((a, b) => b - a);
    return {
      rank: HandRank.THREE_OF_A_KIND,
      cards: fiveCards,
      values: [tripVal, ...kickers],
      description: `Three of a Kind, ${rankName(tripVal)}s`,
    };
  }

  // Straight
  if (isStraight) {
    return {
      rank: HandRank.STRAIGHT,
      cards: fiveCards,
      values,
      description: `Straight, ${rankName(values[0])} high`,
    };
  }

  // Two Pair
  if (counts[0][1] === 2 && counts[1][1] === 2) {
    const highPair = Math.max(counts[0][0], counts[1][0]);
    const lowPair = Math.min(counts[0][0], counts[1][0]);
    const kicker = counts[2][0];
    return {
      rank: HandRank.TWO_PAIR,
      cards: fiveCards,
      values: [highPair, lowPair, kicker],
      description: `Two Pair, ${rankName(highPair)}s and ${rankName(lowPair)}s`,
    };
  }

  // One Pair
  if (counts[0][1] === 2) {
    const pairVal = counts[0][0];
    const kickers = counts.slice(1).map((c) => c[0]).sort((a, b) => b - a);
    return {
      rank: HandRank.ONE_PAIR,
      cards: fiveCards,
      values: [pairVal, ...kickers],
      description: `One Pair, ${rankName(pairVal)}s`,
    };
  }

  // High Card
  return {
    rank: HandRank.HIGH_CARD,
    cards: fiveCards,
    values,
    description: `High Card, ${rankName(values[0])}`,
  };
}

function checkStraight(sortedValues: number[]): boolean {
  // Check if consecutive (descending)
  for (let i = 0; i < sortedValues.length - 1; i++) {
    if (sortedValues[i] - sortedValues[i + 1] !== 1) {
      return false;
    }
  }
  return true;
}

function rankName(value: number): string {
  const names: Record<number, string> = {
    9: 'Nine',
    10: 'Ten',
    11: 'Jack',
    12: 'Queen',
    13: 'King',
    14: 'Ace',
  };
  return names[value] || String(value);
}

export function compareHands(a: HandResult, b: HandResult): number {
  // Lower rank enum = better hand
  if (a.rank !== b.rank) {
    return a.rank - b.rank; // negative = a is better
  }

  // Same rank: compare values (kickers) in order
  for (let i = 0; i < Math.min(a.values.length, b.values.length); i++) {
    if (a.values[i] !== b.values[i]) {
      return b.values[i] - a.values[i]; // higher value is better, so negative = a better
    }
  }

  return 0; // truly tied
}

export function bestFiveCardHand(cards: Card[]): HandResult | null {
  if (cards.length < 5) return null;

  const combos = combinations(cards, 5);
  let best: HandResult | null = null;

  for (const combo of combos) {
    const result = evaluateHand(combo);
    if (!best || compareHands(result, best) < 0) {
      best = result;
    }
  }

  return best;
}
