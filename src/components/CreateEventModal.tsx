import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
}: CreateEventModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [daysUntilClose, setDaysUntilClose] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const days = parseInt(daysUntilClose);

    if (isNaN(days) || days <= 0) {
      setError('Invalid number of days');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const closesAt = new Date();
      closesAt.setDate(closesAt.getDate() + days);

      await api.createMarket({
        privyUserId: user.privy_id,
        question: title.trim(),
        description: description.trim() || undefined,
        closesAt: closesAt.toISOString(),
      });

      setTitle('');
      setDescription('');
      setDaysUntilClose('7');
      onEventCreated();
      onClose();
    } catch (err: any) {
      console.error('Error creating market:', err);
      setError(err.message || 'Failed to create market');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl border-2 border-gray-800 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Create Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Market Question
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
              placeholder="Will Bitcoin reach $110k by end of 2025?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none resize-none"
              placeholder="Add details about resolution criteria, sources, etc..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Market Duration (Days)
            </label>
            <input
              type="number"
              value={daysUntilClose}
              onChange={(e) => setDaysUntilClose(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
              placeholder="7"
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Market will close in {daysUntilClose} day(s) from creation
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#0a0a0a] hover:bg-[#151515] text-white py-3 rounded-lg font-medium transition-colors border border-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#FFD700] hover:bg-[#FFC700] text-black py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Market'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
