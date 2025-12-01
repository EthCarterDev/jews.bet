'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewMarketPage() {
  const { user } = usePrivy();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privyUserId: user.id,
          question,
          description,
          closesAt: new Date(closesAt).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create market');
      }

      router.push(`/markets/${data.market.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create market');
      setIsSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateTime = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create New Market</h1>

      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-[#050608] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#d4af37] focus:outline-none"
              placeholder="Will Bitcoin reach $100k by end of 2024?"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#050608] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#d4af37] focus:outline-none h-32 resize-none"
              placeholder="Additional details about the market..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Closes At
            </label>
            <input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              min={minDateTime}
              className="w-full bg-[#050608] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#d4af37] focus:outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#d4af37] hover:bg-[#c49d2d] text-black font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Market'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
