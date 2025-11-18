import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { PROGRAM_ID, RPC_ENDPOINT } from '../constants';
import IDL from '../../idl.json';
import { PokegachaContract } from '@/pokegacha_contract';

export type PokegachaProgram = Program<PokegachaContract>;

// Create connection
export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Get program instance with wallet
export function getProgram(wallet: AnchorWallet): PokegachaProgram {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new Program(IDL as Idl, provider);
}

// Get program instance without wallet (for read-only operations)
export function getProgramReadOnly(): PokegachaProgram {
  const provider = new AnchorProvider(
    connection,
    {} as AnchorWallet,
    { commitment: 'confirmed' }
  );

  return new Program(IDL as Idl, provider);
}

// Helper to derive PDA addresses
export async function getUserDataPDA(userPublicKey: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('USER_SEED'), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

export async function getPokedexPDA(userPublicKey: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('POKEDEX_SEED'), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

export async function getPokemonPDA(
  userDataPubkey: PublicKey,
  pokemonCount: number
): Promise<[PublicKey, number]> {
  // Manually write u64 as little-endian bytes
  const countBuffer = Buffer.alloc(8);
  const value = BigInt(pokemonCount);

  // Write each byte in little-endian order
  for (let i = 0; i < 8; i++) {
    countBuffer[i] = Number((value >> BigInt(i * 8)) & BigInt(0xff));
  }

  return PublicKey.findProgramAddressSync(
    [Buffer.from('POKEMON_SEED'), userDataPubkey.toBuffer(), countBuffer],
    PROGRAM_ID
  );
}

export async function getConfigPDA(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('CONFIG_SEED')],
    PROGRAM_ID
  );
}
