import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';

export interface BlockchainPokemon {
  id: number; // Pokemon species ID (1-151)
  name: string; // Nickname
  owner: PublicKey;
  gender: 'Male' | 'Female';
  isShiny: boolean;
  worth: number; // Value in coins
  bump: number;
  accountAddress: PublicKey; // The PDA address of this Pokemon account
}

interface PokemonStore {
  ownedPokemon: BlockchainPokemon[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setPokemon: (pokemon: BlockchainPokemon[]) => void;
  addPokemon: (pokemon: BlockchainPokemon) => void;
  removePokemon: (accountAddress: PublicKey) => void;
  updatePokemonName: (accountAddress: PublicKey, newName: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePokemonStore = create<PokemonStore>((set) => ({
  ownedPokemon: [],
  isLoading: false,
  error: null,

  setPokemon: (pokemon) => set({ ownedPokemon: pokemon, error: null }),
  addPokemon: (pokemon) =>
    set((state) => ({
      ownedPokemon: [...state.ownedPokemon, pokemon],
    })),
  removePokemon: (accountAddress) =>
    set((state) => ({
      ownedPokemon: state.ownedPokemon.filter(
        (p) => !p.accountAddress.equals(accountAddress)
      ),
    })),
  updatePokemonName: (accountAddress, newName) =>
    set((state) => ({
      ownedPokemon: state.ownedPokemon.map((p) =>
        p.accountAddress.equals(accountAddress) ? { ...p, name: newName } : p
      ),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ ownedPokemon: [], isLoading: false, error: null }),
}));
