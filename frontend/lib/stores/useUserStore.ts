import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';

export interface UserData {
  address: PublicKey;
  username: string;
  bio: string;
  pokemonCount: number;
  balance: number;
}

interface UserStore {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUserData: (data: UserData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (newBalance: number) => void;
  incrementPokemonCount: () => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userData: null,
  isLoading: false,
  error: null,

  setUserData: (data) => set({ userData: data, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updateBalance: (newBalance) =>
    set((state) =>
      state.userData
        ? { userData: { ...state.userData, balance: newBalance } }
        : state
    ),
  incrementPokemonCount: () =>
    set((state) =>
      state.userData
        ? {
            userData: {
              ...state.userData,
              pokemonCount: state.userData.pokemonCount + 1,
            },
          }
        : state
    ),
  reset: () => set({ userData: null, isLoading: false, error: null }),
}));
