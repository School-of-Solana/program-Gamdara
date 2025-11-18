'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { connection, getUserDataPDA, getPokedexPDA } from '../anchor/setup';
import { useUserStore } from '../stores/useUserStore';
import { usePokedexStore, decodePokemonBitfield } from '../stores/usePokedexStore';
import { usePokemonStore } from '../stores/usePokemonStore';

export function useWalletAuth() {
  const { publicKey, connected, connecting } = useWallet();
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const { setUserData, setLoading, setError, reset: resetUser } = useUserStore();
  const { reset: resetPokedex } = usePokedexStore();
  const { reset: resetPokemon } = usePokemonStore();

  // Check if user account exists on-chain
  useEffect(() => {
    async function checkAccount() {
      if (!publicKey || !connected) {
        setAccountExists(null);
        resetUser();
        resetPokedex();
        resetPokemon();
        return;
      }

      setChecking(true);
      setLoading(true);

      try {
        const [userDataPDA] = await getUserDataPDA(publicKey);
        const accountInfo = await connection.getAccountInfo(userDataPDA);

        if (accountInfo) {
          setAccountExists(true);
          // Fetch user data
          await fetchUserData();
        } else {
          setAccountExists(false);
          resetUser();
        }
      } catch (error) {
        console.error('Error checking account:', error);
        setError('Failed to check account status');
        setAccountExists(false);
      } finally {
        setChecking(false);
        setLoading(false);
      }
    }

    checkAccount();
  }, [publicKey, connected]);

  // Fetch user data from blockchain
  async function fetchUserData() {
    if (!publicKey) return;

    try {
      const [userDataPDA] = await getUserDataPDA(publicKey);
      const accountInfo = await connection.getAccountInfo(userDataPDA);

      if (!accountInfo) {
        setUserData(null);
        return;
      }

      // Parse account data (this is a simplified version - you may need to use proper deserialization)
      // For now, we'll need to fetch this using the Anchor program
      // This will be implemented when we integrate with components

      // Also fetch pokedex
      const [pokedexPDA] = await getPokedexPDA(publicKey);
      const pokedexInfo = await connection.getAccountInfo(pokedexPDA);

      if (pokedexInfo) {
        // Parse pokedex data (bitfield)
        // This will be implemented when we integrate with components
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    }
  }

  return {
    connected,
    connecting,
    publicKey,
    accountExists,
    checking,
    isReady: connected && accountExists !== null,
    isAuthenticated: connected && accountExists === true,
  };
}

// Hook for protecting routes that require wallet connection
export function useRequireWallet(redirectTo: string = '/') {
  const { connected, connecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connecting && !connected) {
      router.push(redirectTo);
    }
  }, [connected, connecting, router, redirectTo]);

  return { connected, connecting };
}

// Hook for protecting routes that require user account
export function useRequireAccount() {
  const { connected, connecting, publicKey } = useWallet();
  const router = useRouter();
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccount() {
      if (!connecting && !connected) {
        router.push('/');
        return;
      }

      if (!publicKey) {
        setChecking(false);
        return;
      }

      try {
        const [userDataPDA] = await getUserDataPDA(publicKey);
        const accountInfo = await connection.getAccountInfo(userDataPDA);

        if (accountInfo) {
          setAccountExists(true);
        } else {
          setAccountExists(false);
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error checking account:', error);
        router.push('/');
      } finally {
        setChecking(false);
      }
    }

    checkAccount();
  }, [connected, connecting, publicKey, router]);

  return { accountExists, checking, connected };
}

// Hook for onboarding page (wallet connected but no account yet)
export function useOnboardingGuard() {
  const { connected, connecting, publicKey } = useWallet();
  const router = useRouter();
  const [accountExists, setAccountExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccount() {
      if (!connecting && !connected) {
        router.push('/');
        return;
      }

      if (!publicKey) {
        setChecking(false);
        return;
      }

      try {
        const [userDataPDA] = await getUserDataPDA(publicKey);
        const accountInfo = await connection.getAccountInfo(userDataPDA);

        if (accountInfo) {
          // Account already exists, redirect to home
          setAccountExists(true);
          router.push('/home');
        } else {
          setAccountExists(false);
        }
      } catch (error) {
        console.error('Error checking account:', error);
      } finally {
        setChecking(false);
      }
    }

    checkAccount();
  }, [connected, connecting, publicKey, router]);

  return { accountExists, checking, connected };
}
