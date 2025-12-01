import { createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy, useSolanaWallets } from '@privy-io/react-auth';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  needsSolanaWallet: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  updateUsername: async () => {},
  needsSolanaWallet: false,
});

export const useAuth = () => useContext(AuthContext);

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { user: privyUser, ready, authenticated } = usePrivy();
  const { wallets: solanaWallets, ready: solanaReady } = useSolanaWallets();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSolanaWallet, setNeedsSolanaWallet] = useState(false);

  const refreshUser = async () => {
    if (!privyUser?.id) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('[DEBUG] Fetching user for privy_id:', privyUser.id);
      console.log('[DEBUG] Solana wallets ready:', solanaReady);
      console.log('[DEBUG] Solana wallets:', solanaWallets);

      let walletAddress: string | null = null;

      if (solanaReady) {
        if (!solanaWallets || solanaWallets.length === 0) {
          console.warn('⚠️ [Privy] No Solana wallets detected from Privy.');
          console.warn('This may indicate an issue with Privy configuration.');
          console.warn('Expected: Privy should create an embedded Solana wallet on login.');
          console.warn('Check: embeddedWallets.createOnLogin and solanaClusters config.');

          setNeedsSolanaWallet(true);
        } else {
          setNeedsSolanaWallet(false);
          const embeddedWallet = solanaWallets.find((w) => w.walletClientType === 'privy');
          if (embeddedWallet) {
            walletAddress = embeddedWallet.address;
            console.log('[DEBUG] Found embedded Solana wallet:', walletAddress);
          } else {
            walletAddress = solanaWallets[0].address;
            console.log('[DEBUG] Using first available Solana wallet:', walletAddress);
          }
        }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('privy_id', privyUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error);
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.log('[DEBUG] User not found, creating new user...');

        const email = privyUser.email?.address || null;

        console.log('[DEBUG] Creating user with data:', {
          privy_id: privyUser.id,
          email,
          wallet_address: walletAddress
        });

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              privy_id: privyUser.id,
              email: email,
              wallet_address: walletAddress,
              balance_available: 0,
              balance_locked: 0,
              username: null,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user:', insertError);
          setIsLoading(false);
          return;
        }

        console.log('[DEBUG] User created successfully:', newUser);
        setUser(newUser);
      } else {
        console.log('[DEBUG] User found:', data);

        if (walletAddress && data.wallet_address !== walletAddress) {
          console.log('[DEBUG] Updating wallet address from', data.wallet_address, 'to', walletAddress);
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ wallet_address: walletAddress })
            .eq('privy_id', privyUser.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating wallet address:', updateError);
          } else {
            setUser(updatedUser);
            return;
          }
        }

        setUser(data);
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ready && solanaReady) {
      if (authenticated && privyUser) {
        refreshUser();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, [ready, solanaReady, authenticated, privyUser?.id, solanaWallets?.length]);

  const updateUsername = async (username: string) => {
    if (!user) throw new Error('No user logged in');

    console.log('Attempting to update username for user:', user.id, 'to:', username);

    const { data, error } = await supabase
      .from('users')
      .update({ username })
      .eq('privy_id', user.privy_id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating username:', error);
      if (error.code === '23505') {
        throw new Error('Username already taken');
      }
      throw new Error(error.message || 'Failed to update username');
    }

    if (!data) {
      throw new Error('User not found');
    }

    console.log('Username updated successfully:', data);
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, updateUsername, needsSolanaWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#FFD700',
          logo: '/f266e188-5416-4587-9f30-50a0b17d2a54.png',
        },
        loginMethods: ['wallet', 'email', 'twitter', 'google'],
        embeddedWallets: {
          createOnLogin: 'all-users',
          requireUserPasswordOnCreate: false,
          noPromptOnSignature: true,
        },
        solanaClusters: [
          {
            name: 'mainnet-beta',
            rpcUrl: 'https://api.mainnet-beta.solana.com',
          },
        ],
      }}
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </PrivyProvider>
  );
}
