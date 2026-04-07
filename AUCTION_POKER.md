# Auction Poker

A multiplayer card game hosted on Vercel where players compete to build the best poker hand by bidding on groups of cards in anonymous second-price auctions.

---

## Tech Stack

- **Frontend:** Next.js (React) with TypeScript
- **Backend:** Next.js API routes / server actions
- **Real-time:** WebSockets (e.g. Pusher, Ably, or Socket.io via a lightweight server)
- **Database:** Redis or Vercel KV for game state (ephemeral, session-based)
- **Hosting:** Vercel
- **Styling:** Tailwind CSS

---

## Game Overview

2–3 players compete to assemble the best 5-card poker hand from cards won through auctions. Cards are dealt into randomized groups, and players bid chips to win each group. Strategy lies in evaluating which groups are worth bidding on and how much to spend.

---

## Core Rules

### Deck

- **Short deck:** 24 cards total
- **4 suits:** Hearts, Diamonds, Clubs, Spades
- **6 ranks:** 9, 10, J, Q, K, A

### Hand Rankings (high to low)

Because a short deck makes flushes harder to hit than four-of-a-kind, the rankings are adjusted:

1. Royal Flush
2. Straight Flush
3. Flush
4. Four of a Kind
5. Full House
6. Three of a Kind
7. Straight
8. Two Pair
9. One Pair
10. High Card

> **Key change from standard poker:** Flush beats Four of a Kind (and Full House). All other relative rankings remain standard.

### Card Groups

- The 24 cards are randomly partitioned into groups before the game begins.
- Group sizes should have meaningful variation — expect a mix like `[2, 6, 3, 4, 1, 3, 5]` or similar. At least one group should be size 5+, and some groups can be as small as 1.
- A suggested approach: randomly partition 24 cards into 5–8 groups with sizes drawn from a distribution that allows sizes 1–7+.
- A small number of cards (roughly 3–5) are dealt **face down**; all others are **face up**.
  - Face-down cards are visible to all players only as "unknown" until won.
  - When a player wins a group, any face-down cards in it are revealed **only to that player** (other players never see them).
- Groups are numbered (Group 1, Group 2, etc.) and auctioned in order.

### Auction Mechanics

- Each player starts with **100 chips**.
- Auctions proceed one group at a time, in order.
- Each auction is an **anonymous second-price (Vickrey) auction**:
  - All players simultaneously submit a secret bid (any whole number of chips from 0 up to their remaining balance).
  - The **highest bidder wins** the group.
  - The winner **pays the second-highest bid** (not their own bid).
  - If only one player bids above 0, they pay 0.
- **Tie-breaking:** If two or more players submit the same highest bid, the winner is chosen **randomly** among the tied players.
- After the auction resolves:
  - The winning player receives all cards in the group (face-down cards revealed privately to them).
  - All players see who won and what price was paid.
  - Remaining chip counts are updated.
- Proceed to the next group until all groups are auctioned.

### Winning

- After all auctions conclude, each player's best possible 5-card hand is automatically determined from all cards they won.
- The player with the **best hand** wins the game.
- **Tiebreaker:** If two players have equivalently ranked hands, the player who **completed their winning hand first** (i.e., won the decisive card in an earlier auction round) wins.

---

## Game Flow

```
1. Lobby / Room Creation
   - A player creates a room, gets a room code
   - Other player(s) join via code
   - 2–3 players required to start

2. Setup Phase
   - Server shuffles the 24-card deck
   - Cards are randomly partitioned into groups
   - A few cards per group are randomly marked face-down
   - All players see the groups with face-up cards visible and face-down cards hidden

3. Auction Phase (repeat for each group)
   a. Display current group (face-up cards shown, face-down shown as hidden)
   b. All players privately submit their bids
   c. Once all bids are in, resolve the auction:
      - Announce winner, price paid (2nd price), and cards won
      - Reveal face-down cards privately to winner
      - Deduct chips from winner
   d. Update game state, move to next group

4. Showdown
   - All auctions complete
   - Each player's best 5-card hand is calculated
   - Reveal all hands (including previously hidden cards)
   - Announce winner with tiebreak logic if needed

5. Post-Game
   - Show final results, hand breakdowns
   - Option to play again with same players
```

---

## Data Models

### Game State

```typescript
interface GameState {
  id: string;                    // room/game ID
  status: 'lobby' | 'auction' | 'showdown' | 'finished';
  players: Player[];
  deck: Card[];
  groups: CardGroup[];
  currentGroupIndex: number;
  auctionResults: AuctionResult[];
}

interface Player {
  id: string;
  name: string;
  chips: number;
  wonCards: Card[];              // all cards this player has won
  currentBid: number | null;     // bid for current auction (null = not yet submitted)
  connected: boolean;
}

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: '9' | '10' | 'J' | 'Q' | 'K' | 'A';
  faceDown: boolean;             // whether this card is hidden until won
}

interface CardGroup {
  index: number;                 // group number (1-based)
  cards: Card[];
  auctioned: boolean;
  winnerId: string | null;
}

interface AuctionResult {
  groupIndex: number;
  bids: { playerId: string; amount: number }[];
  winnerId: string;
  pricePaid: number;             // second-highest bid
}
```

---

## Key Implementation Details

### Card Group Generation

```
function partitionDeck(cards: Card[]): CardGroup[] {
  // Shuffle the 24 cards
  // Randomly partition into 5–8 groups
  // Ensure at least one group has 5+ cards
  // Ensure variation (avoid all groups being size 3)
  // Randomly mark ~3–5 total cards as face-down
}
```

Suggested algorithm: repeatedly slice a random size (1–7) from the shuffled deck until all cards are assigned. Reject partitions that are too uniform.

### Second-Price Auction Resolution

```
function resolveAuction(bids: {playerId: string, amount: number}[]): {winnerId: string, price: number} {
  // Sort bids descending
  // If top bid is tied, pick winner randomly among tied players
  // Winner pays the second-highest bid amount
  // If winner is the only bidder > 0, they pay 0
}
```

### Hand Evaluation

- Evaluate best 5-card combination from all cards a player has won (could be many more than 5).
- Use short-deck ranking: Flush > Four of a Kind > Full House.
- Track which auction round completed each player's best hand (for tiebreaking).

### Information Visibility

| Information | Visible to |
|---|---|
| Face-up cards in upcoming groups | All players |
| Face-down card existence (but not value) | All players |
| Face-down card value after winning | Only the winner |
| Each player's chip count | All players |
| Bid amounts (after resolution) | All players |
| Auction winner + price paid | All players |
| Other players' won face-down cards | Hidden until showdown |
| Each player's current best hand | Only that player (until showdown) |

---

## UI Pages / Views

1. **Home** — Create or join a room
2. **Lobby** — Waiting room, show connected players, start button
3. **Game Board** — Main game view:
   - Card groups displayed (with face-down cards as card backs)
   - Current auction group highlighted
   - Bid input + submit button
   - Player chip counts
   - Player's own won cards
   - Auction history log
4. **Showdown** — Final reveal of all hands, winner announcement
5. **Results** — Recap with stats, play-again option

---

## Stretch Goals

- Spectator mode
- Animated card reveals and auction countdowns
- Sound effects
- Game history / replay
- ELO or win-tracking across sessions
- Chat during game
- Mobile-optimized layout
- AI opponent for single-player practice
