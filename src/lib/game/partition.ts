import type { Card, CardGroup } from '../types';
import {
  MIN_GROUPS,
  MAX_GROUPS,
  FACE_DOWN_COUNT_MIN,
  FACE_DOWN_COUNT_MAX,
  DECK_SIZE,
} from '../constants';
import { randomInt } from '../utils';

export function partitionDeck(cards: Card[]): CardGroup[] {
  if (cards.length !== DECK_SIZE) {
    throw new Error(`Expected ${DECK_SIZE} cards, got ${cards.length}`);
  }

  const sizes = generateGroupSizes();
  const groups: CardGroup[] = [];
  let offset = 0;

  for (let i = 0; i < sizes.length; i++) {
    const groupCards = cards.slice(offset, offset + sizes[i]).map((c) => ({ ...c }));
    groups.push({
      index: i + 1,
      cards: groupCards,
      auctioned: false,
      winnerId: null,
    });
    offset += sizes[i];
  }

  // Mark some cards face-down
  markFaceDown(groups);

  return groups;
}

function generateGroupSizes(): number[] {
  // Retry until we get a valid partition
  for (let attempt = 0; attempt < 100; attempt++) {
    const numGroups = randomInt(MIN_GROUPS, MAX_GROUPS);
    const sizes = randomPartition(DECK_SIZE, numGroups);

    if (!sizes) continue;

    // Validate: at least one group with 5+ cards, sizes between 1-7
    const hasLargeGroup = sizes.some((s) => s >= 5);
    const allValidSize = sizes.every((s) => s >= 1 && s <= 7);
    // Avoid too uniform (not all the same size)
    const uniqueSizes = new Set(sizes).size;
    const hasVariation = uniqueSizes >= 2;

    if (hasLargeGroup && allValidSize && hasVariation) {
      return sizes;
    }
  }

  // Fallback: guaranteed valid partition
  return [5, 4, 4, 3, 3, 2, 2, 1];
}

function randomPartition(total: number, parts: number): number[] | null {
  if (parts > total) return null;

  // Generate random breakpoints
  const breakpoints: number[] = [];
  for (let i = 0; i < parts - 1; i++) {
    breakpoints.push(randomInt(1, total - 1));
  }
  breakpoints.sort((a, b) => a - b);

  const sizes: number[] = [];
  let prev = 0;
  for (const bp of breakpoints) {
    sizes.push(bp - prev);
    prev = bp;
  }
  sizes.push(total - prev);

  // Filter out zeros
  if (sizes.some((s) => s <= 0)) return null;

  return sizes;
}

function markFaceDown(groups: CardGroup[]): void {
  // Collect all card references with their group/card indices
  const allCards: { groupIdx: number; cardIdx: number }[] = [];
  for (let g = 0; g < groups.length; g++) {
    for (let c = 0; c < groups[g].cards.length; c++) {
      allCards.push({ groupIdx: g, cardIdx: c });
    }
  }

  // Shuffle the indices and pick 3-5 to be face-down
  const count = randomInt(FACE_DOWN_COUNT_MIN, FACE_DOWN_COUNT_MAX);
  const shuffled = [...allCards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (let i = 0; i < count; i++) {
    const { groupIdx, cardIdx } = shuffled[i];
    groups[groupIdx].cards[cardIdx].faceDown = true;
  }
}
