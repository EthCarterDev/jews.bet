import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface UsernameSetupModalProps {
  onSubmit: (username: string) => Promise<void>;
}

export function UsernameSetupModal({ onSubmit }: UsernameSetupModalProps) {
  const { logout } = usePrivy();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 25) {
      setError('Username must be less than 25 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onSubmit(username);
    } catch (err: any) {
      setError(err.message || 'Failed to set username');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl p-8 max-w-lg w-full border border-gray-800 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-3">Set Your Username</h2>

        <p className="text-gray-400 text-sm mb-6">
          Choose a unique username to identify yourself on the platform.
          <br />
          You can also sign out if you'd prefer to do this later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your username"
              className="w-full px-4 py-3 bg-[#0a0a0a] border-2 border-[#9945FF] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#7d3ad4] transition-colors"
              autoFocus
              disabled={loading}
            />
            <p className="text-gray-500 text-xs mt-2">
              3-25 characters. Letters, numbers, and underscores only.
            </p>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-3 bg-[#6b9b3f] hover:bg-[#5a8334] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {loading ? 'Setting username...' : 'Set Username'}
          </button>
        </form>

        <button
          onClick={logout}
          disabled={loading}
          className="w-full mt-4 py-3 text-red-400 hover:text-red-300 font-semibold transition-colors uppercase tracking-wide"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
