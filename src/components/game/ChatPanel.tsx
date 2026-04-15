'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentPlayerId: string;
  onSend: (text: string) => Promise<void>;
}

export function ChatPanel({ messages, currentPlayerId, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await onSend(text);
      setDraft('');
    } catch {
      // error surfaces via hook
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-800/60 rounded-xl flex flex-col h-80">
      <h2 className="text-sm font-semibold text-gray-400 px-4 pt-3 pb-2 border-b border-gray-700">
        Chat
      </h2>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-sm"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 italic">No messages yet. Say hi!</p>
        ) : (
          messages.map((m) => {
            const isMe = m.playerId === currentPlayerId;
            return (
              <div key={m.id} className="leading-snug">
                <span
                  className={
                    isMe ? 'text-amber-400 font-semibold' : 'text-green-400 font-semibold'
                  }
                >
                  {m.playerName}
                  {isMe && <span className="text-amber-300/70"> (you)</span>}:
                </span>{' '}
                <span className="text-gray-200 break-words">{m.text}</span>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-2 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 text-white placeholder-gray-500 text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded px-3 py-1.5 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
