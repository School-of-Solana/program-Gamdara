export type PokemonRarity = 'R' | 'SR' | 'SSR' | 'UR';

export interface Pokemon {
  id: number;
  name: string;
  rarity: PokemonRarity;
  description: string;
  type: string[];
  weakness: string[];
}

export interface OwnedPokemon extends Pokemon {
  ownedId: string;      // Unique ID for this owned instance
  nickname?: string;    // Custom name given by user
  ownedAt: number;      // Timestamp when obtained
  isShiny?: boolean;    // Whether this Pokemon is shiny
}
