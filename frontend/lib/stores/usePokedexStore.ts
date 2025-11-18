import { create } from 'zustand';

interface PokedexStore {
  caughtPokemon: Set<number>; // Set of Pokemon IDs that have been caught (1-151)
  isLoading: boolean;
  error: string | null;

  // Actions
  setCaughtPokemon: (pokemonIds: number[]) => void;
  addCaughtPokemon: (pokemonId: number) => void;
  isPokemonCaught: (pokemonId: number) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePokedexStore = create<PokedexStore>((set, get) => ({
  caughtPokemon: new Set<number>(),
  isLoading: false,
  error: null,

  setCaughtPokemon: (pokemonIds) =>
    set({ caughtPokemon: new Set(pokemonIds), error: null }),
  addCaughtPokemon: (pokemonId) =>
    set((state) => {
      const newSet = new Set(state.caughtPokemon);
      newSet.add(pokemonId);
      return { caughtPokemon: newSet };
    }),
  isPokemonCaught: (pokemonId) => get().caughtPokemon.has(pokemonId),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ caughtPokemon: new Set(), isLoading: false, error: null }),
}));

// Helper functions to work with bitfield (bytes from blockchain)
export function decodePokemonBitfield(bytes: Uint8Array): number[] {
  const caughtIds: number[] = [];

  for (let byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
    const byte = bytes[byteIndex];
    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      if ((byte & (1 << bitIndex)) !== 0) {
        const pokemonId = byteIndex * 8 + bitIndex;
        if (pokemonId >= 1 && pokemonId <= 151) {
          caughtIds.push(pokemonId);
        }
      }
    }
  }

  return caughtIds;
}

export function isPokemonInBitfield(bytes: Uint8Array, pokemonId: number): boolean {
  if (pokemonId < 1 || pokemonId > 151) return false;

  const byteIndex = Math.floor((pokemonId - 1) / 8);
  const bitIndex = (pokemonId - 1) % 8;

  if (byteIndex >= bytes.length) return false;

  return (bytes[byteIndex] & (1 << bitIndex)) !== 0;
}
