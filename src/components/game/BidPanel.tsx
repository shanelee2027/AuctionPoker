'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';

interface BidPanelProps {
  maxChips: number;
  bidSubmitted: boolean;
  onSubmitBid: (amount: number) => Promise<void>;
}

export function BidPanel({ maxChips, bidSubmitted, onSubmitBid }: BidPanelProps) {
  const [bidAmount, setBidAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitBid(bidAmount);
    } catch {
      setIsSubmitting(false);
    }
  };

  if (bidSubmitted) {
    return (
      <div className="bg-gray-800/60 rounded-xl p-6 text-center">
        <div className="text-green-400 text-lg font-semibold mb-1">
          Bid Submitted
        </div>
        <p className="text-gray-400 text-sm">Waiting for other players...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/60 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Place Your Bid</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>0</span>
            <span>{maxChips} chips</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxChips}
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={maxChips}
            value={bidAmount}
            onChange={(e) => {
              const val = Math.min(Math.max(0, Number(e.target.value)), maxChips);
              setBidAmount(val);
            }}
            className="w-24 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <span className="text-gray-400">chips</span>

          <div className="flex gap-2 ml-auto">
            {[0, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                onClick={() => setBidAmount(Math.min(preset, maxChips))}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
              >
                {preset}
              </button>
            ))}
            <button
              onClick={() => setBidAmount(maxChips)}
              className="px-2 py-1 text-xs bg-amber-800 hover:bg-amber-700 rounded text-amber-200 transition-colors"
            >
              All In
            </button>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : `Bid ${bidAmount} Chips`}
        </Button>
      </div>
    </div>
  );
}
