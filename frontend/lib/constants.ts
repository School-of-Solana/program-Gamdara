import { PublicKey, clusterApiUrl } from '@solana/web3.js';
import IDL from '../idl.json';

// Program ID from IDL
export const PROGRAM_ID = new PublicKey(IDL.address);

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl(NETWORK as 'devnet' | 'mainnet-beta');

// PDA seeds (from IDL)
export const SEEDS = {
  USER: Buffer.from('USER_SEED'),
  POKEDEX: Buffer.from('POKEDEX_SEED'),
  POKEMON: Buffer.from('POKEMON_SEED'),
  CONFIG: Buffer.from('CONFIG_SEED'),
} as const;

// Game constants
export const POKEMON_COUNT = 151; // Gen 1 Pokemon
export const GACHA_COST = 10; // Cost per gacha pull in coins

// Admin address for gacha and other admin operations
export const ADMIN_ADDRESS = new PublicKey('4AAkicFU2Rc89k9FPgKzmmsaGQowWtPNcqwTH2TqEFY3');
