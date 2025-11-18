import { OwnedPokemon, Pokemon } from './types';
import pokedexData from '@/pokedex.json';

/**
 * Normalizes Pokemon name for sprite paths
 * @param pokemonName - The name of the Pokemon
 * @returns Normalized name for file paths
 */
function normalizePokemonName(pokemonName: string): string {
  let normalizedName = pokemonName.toLowerCase();

  // Special cases for Pokemon with different directory names
  if (normalizedName === "nidoran♀") {
    normalizedName = "nidoran-f";
  } else if (normalizedName === "nidoran♂") {
    normalizedName = "nidoran-m";
  } else if (normalizedName === "farfetch'd") {
    normalizedName = "farfetchd";
  } else if (normalizedName === "mr. mime") {
    normalizedName = "mr-mime";
  }

  return normalizedName;
}

/**
 * Generates the sprite path for a Pokemon (static)
 * @param pokemonName - The name of the Pokemon (e.g., "Pikachu", "Mr. Mime")
 * @param variant - The sprite variant (default: "normal")
 * @returns The path to the sprite image
 */
export function getSpritePath(
  pokemonName: string,
  variant: 'normal' | 'shiny' | 'back-normal' | 'back-shiny' = 'normal'
): string {
  const normalizedName = normalizePokemonName(pokemonName);
  return `/sprites/gen5/static/${normalizedName}/${variant}.png`;
}

/**
 * Generates the animated sprite path for a Pokemon
 * @param pokemonName - The name of the Pokemon (e.g., "Pikachu", "Mr. Mime")
 * @param variant - The sprite variant (default: "normal")
 * @returns The path to the animated sprite image
 */
export function getAnimatedSpritePath(
  pokemonName: string,
  variant: 'normal' | 'shiny' = 'normal'
): string {
  const normalizedName = normalizePokemonName(pokemonName);
  return `/sprites/gen5/animated/${normalizedName}/${variant}.gif`;
}

/**
 * Checks if a Pokemon is unlocked (dummy implementation)
 * @param pokemonId - The Pokemon's Pokedex ID
 * @returns true if unlocked, false if locked
 */
export function isPokemonUnlocked(pokemonId: number): boolean {
  // For now, unlock first 30 Pokemon as dummy data
  return pokemonId <= 30;
}

/**
 * Gets owned Pokemon (dummy implementation)
 * @returns Array of owned Pokemon with metadata
 */
export function getOwnedPokemon(): OwnedPokemon[] {
  const allPokemon = pokedexData as Pokemon[];

  // Generate 50 random owned Pokemon for dummy data
  const ownedCount = 50;
  const owned: OwnedPokemon[] = [];
  const usedIndices = new Set<number>();

  // Randomly select 50 unique Pokemon
  while (owned.length < ownedCount && owned.length < allPokemon.length) {
    const randomIndex = Math.floor(Math.random() * allPokemon.length);

    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      const pokemon = allPokemon[randomIndex];

      owned.push({
        ...pokemon,
        ownedId: `owned-${pokemon.id}-${Date.now()}-${Math.random()}`,
        ownedAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time within last 30 days
        isShiny: Math.random() < 0.1, // 10% chance to be shiny
      });
    }
  }

  // Sort by ownedAt (most recent first)
  return owned.sort((a, b) => b.ownedAt - a.ownedAt);
}

/**
 * Gets user's coin balance (dummy implementation)
 * @returns Coin balance
 */
export function getUserCoins(): number {
  // For now, return a dummy balance
  return 500;
}

/**
 * Checks if user can afford a gacha pull
 * @param cost - Cost of the pull
 * @returns true if user has enough coins
 */
export function canAffordPull(cost: number): boolean {
  return getUserCoins() >= cost;
}

/**
 * Gets pokeball sprite path based on rarity
 * @param rarity - The Pokemon's rarity (R, SR, SSR, UR)
 * @returns Path to the pokeball sprite
 */
export function getPokeballSprite(rarity: 'R' | 'SR' | 'SSR' | 'UR'): string {
  const pokeballMap = {
    R: 'poke',
    SR: 'great',
    SSR: 'ultra',
    UR: 'master',
  };
  return `/sprites/pokeballs/${pokeballMap[rarity]}.png`;
}

/**
 * Performs a gacha pull and returns random Pokemon
 * @param count - Number of Pokemon to pull
 * @returns Array of pulled Pokemon with ownership details
 */
export interface GachaResult {
  pokemonName: string;
  pokemonId: number;
  rarity: 'R' | 'SR' | 'SSR' | 'UR';
  isShiny: boolean;
  gender: 'Male' | 'Female';
  worth: number;
}

export function performGachaPull(count: number): GachaResult[] {
  const ratesData = require('../rates.json');
  const allPokemon = pokedexData as Pokemon[];
  const results: GachaResult[] = [];

  // Load rates and Pokemon lists from rates.json
  const rarityRates = ratesData.rates;
  const pokemonByRarity = ratesData.pokemon;

  // Base worth by rarity
  const baseWorth = {
    R: 2,
    SR: 6,
    SSR: 25,
    UR: 80,
  };

  for (let i = 0; i < count; i++) {
    const isLastPullOfTen = count === 10 && i === 9;
    let selectedRarity: 'R' | 'SR' | 'SSR' | 'UR';

    if (isLastPullOfTen) {
      // 10th pull of a 10-pull: Guaranteed SSR or UR
      // 99% SSR, 1% UR
      const rand = Math.random();
      selectedRarity = rand < 0.01 ? 'UR' : 'SSR';
    } else {
      // Normal rarity selection based on rates
      const rand = Math.random();

      if (rand < rarityRates.UR) {
        selectedRarity = 'UR';
      } else if (rand < rarityRates.UR + rarityRates.SSR) {
        selectedRarity = 'SSR';
      } else if (rand < rarityRates.UR + rarityRates.SSR + rarityRates.SR) {
        selectedRarity = 'SR';
      } else {
        selectedRarity = 'R';
      }
    }

    // Get Pokemon list for this rarity from rates.json
    const pokemonNames = pokemonByRarity[selectedRarity];

    // Select random Pokemon name from that rarity
    const randomPokemonName = pokemonNames[Math.floor(Math.random() * pokemonNames.length)];

    // Get full Pokemon data from pokedex
    const pokemonData = allPokemon.find(p => p.name === randomPokemonName);

    if (!pokemonData) {
      console.error(`Pokemon ${randomPokemonName} not found in pokedex`);
      continue;
    }

    // Randomize shiny (10% chance)
    const isShiny = Math.random() < 0.10;

    // Randomize gender (50/50)
    const gender: 'Male' | 'Female' = Math.random() < 0.5 ? 'Male' : 'Female';

    // Calculate worth
    let worth = baseWorth[selectedRarity];
    if (isShiny) {
      worth *= 2; // Double worth if shiny
    }

    results.push({
      pokemonName: pokemonData.name,
      pokemonId: pokemonData.id,
      rarity: selectedRarity,
      isShiny,
      gender,
      worth,
    });
  }

  return results;
}
