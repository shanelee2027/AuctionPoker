'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface BidPanelProps {
  maxChips: number;
  bidSubmitted: boolean;
  onSubmitBid: (amount: number) => Promise<void>;
  roundIndex: number;
}

export function BidPanel({ maxChips, bidSubmitted, onSubmitBid, roundIndex }: BidPanelProps) {
  const [bidText, setBidText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when a new round starts
  useEffect(() => {
    setBidText('');
    setIsSubmitting(false);
  }, [roundIndex]);

  const bidAmount = bidText === '' ? 0 : parseInt(bidText, 10) || 0;
  const clampedBid = Math.min(Math.max(0, bidAmount), maxChips);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitBid(clampedBid);
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
            value={clampedBid}
            onChange={(e) => setBidText(e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={bidText}
            placeholder="0"
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              if (raw === '') {
                setBidText('');
              } else {
                const num = Math.min(parseInt(raw, 10), maxChips);
                setBidText(String(num));
              }
            }}
            className="w-24 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <span className="text-gray-400">chips</span>

          <div className="flex gap-2 ml-auto">
            {[0, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                onClick={() => setBidText(String(Math.min(preset, maxChips)))}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
              >
                {preset}
              </button>
            ))}
            <button
              onClick={() => setBidText(String(maxChips))}
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
          {isSubmitting ? 'Submitting...' : `Bid ${clampedBid} Chips`}
        </Button>
      </div>
    </div>
  );
}
