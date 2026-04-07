# 🃏 Auction Poker

A strategic multiplayer card game where poker meets auctions. Bid on groups of cards, build the best hand, and outsmart your opponents.

**[Play Now](https://auctionpoker.vercel.app/)** *(hosted on Vercel)*

---

## What Is Auction Poker?

Auction Poker is a 2–3 player online card game. Instead of being dealt cards, you **bid on them**. A short deck is split into random groups, and players compete in blind auctions to win each group. After all auctions settle, whoever built the best 5-card poker hand wins.

The twist: you have limited chips, some cards are hidden, and every bid is a gamble.

---

## How to Play

### Setup

- A **24-card short deck** is used: four suits (♠ ♥ ♦ ♣), ranks 9 through Ace.
- The deck is randomly split into **5–8 groups** of varying size. Some groups might have 1–2 cards, others might have 6+.
- Most cards are **face up** — everyone can see them. A few cards in each game are **face down**, shown only as card backs.
- Every player starts with **100 chips**.

### Auctions

Groups are auctioned one at a time, in order.

1. **Bid secretly.** Everyone submits a bid at the same time. You can bid any whole number from 0 up to your remaining chips.
2. **Highest bid wins the group.** The winner takes all the cards in that group.
3. **You pay the second-highest bid**, not your own. This is a [second-price (Vickrey) auction](https://en.wikipedia.org/wiki/Vickrey_auction) — it rewards honest bidding.
4. **Ties are broken randomly.** If two players bid the same top amount, the winner is chosen by coin flip.
5. **Face-down cards** in a won group are revealed **only to the winner**. Other players never see them until the final showdown.

Repeat until every group has been auctioned.

### Showdown

Once all auctions are done:

- Your best possible **5-card poker hand** is automatically built from all the cards you won.
- All hands are revealed, including any face-down cards.
- **Best hand wins.**
- If two players tie, the player who **completed their hand earlier** (won the key card in an earlier round) takes it.

---

## Hand Rankings

Because the short deck makes flushes significantly harder to hit, the rankings differ slightly from standard poker:

| Rank | Hand | Example |
|------|------|---------|
| 1 | Royal Flush | A♠ K♠ Q♠ J♠ 10♠ |
| 2 | Straight Flush | Q♥ J♥ 10♥ 9♥ + wraps |
| 3 | **Flush** | A♦ K♦ J♦ 10♦ 9♦ |
| 4 | Four of a Kind | K♠ K♥ K♦ K♣ + any |
| 5 | Full House | Q♠ Q♥ Q♦ 9♠ 9♣ |
| 6 | Three of a Kind | J♠ J♥ J♦ + two others |
| 7 | Straight | K Q J 10 9 |
| 8 | Two Pair | A♠ A♥ 10♦ 10♣ + any |
| 9 | One Pair | A♠ A♣ + three others |
| 10 | High Card | Best single card wins |

> **Key difference from standard poker:** Flush beats Four of a Kind and Full House. Everything else ranks the same as normal.

---

## Strategy Tips

- **You pay the second price, not your bid.** Bidding your true value is a strong baseline strategy — you'll never overpay.
- **Track chips.** If an opponent is low on chips, you can win later groups cheaply.
- **Face-down cards are wildcards.** A group with hidden cards might complete someone's flush — or be worthless. Price the uncertainty.
- **You don't need every group.** You only need 5 cards for a hand. Spending big early might leave you empty-handed later.
- **Watch what others win.** If someone already has three Kings, that group with the fourth King is worth a lot more to them than to you.

---

## Quick Reference

| | |
|---|---|
| **Players** | 2–3 |
| **Deck** | 24 cards (9, 10, J, Q, K, A × 4 suits) |
| **Starting Chips** | 100 per player |
| **Auction Type** | Anonymous second-price (Vickrey) |
| **Goal** | Best 5-card poker hand from won cards |
| **Tie in auction** | Random winner among tied bidders |
| **Tie in hands** | Player who completed the hand first wins |

---

## Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/auction-poker.git
cd auction-poker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech Stack

- **Next.js** + TypeScript
- **Tailwind CSS**
- **Vercel** for hosting
- **WebSockets** for real-time multiplayer

---

## License

MIT