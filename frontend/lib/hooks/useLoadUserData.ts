'use client';

import { useEffect } from 'react';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram, getUserDataPDA, getPokedexPDA } from '../anchor/setup';
import { useUserStore } from '../stores/useUserStore';
import { usePokedexStore, decodePokemonBitfield } from '../stores/usePokedexStore';
import { usePokemonStore, BlockchainPokemon } from '../stores/usePokemonStore';

/**
 * Hook to load user data, pokedex, and owned Pokemon from the blockchain
 * Call this in your main authenticated pages
 */
export function useLoadUserData() {
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();

  const { setUserData, setLoading: setUserLoading, setError: setUserError } = useUserStore();
  const { setCaughtPokemon, setLoading: setPokedexLoading, setError: setPokedexError } = usePokedexStore();
  const { setPokemon, setLoading: setPokemonLoading, setError: setPokemonError } = usePokemonStore();

  useEffect(() => {
    async function loadData() {
      if (!connected || !publicKey || !anchorWallet) {
        return;
      }

      try {
        setUserLoading(true);
        setPokedexLoading(true);
        setPokemonLoading(true);

        const program = getProgram(anchorWallet);
        const [userDataPDA] = await getUserDataPDA(publicKey);
        const [pokedexPDA] = await getPokedexPDA(publicKey);

        // Fetch UserData account
        const userAccount = await program.account.userData.fetch(userDataPDA);

        setUserData({
          address: userAccount.address as PublicKey,
          username: userAccount.username as string,
          bio: userAccount.bio as string,
          pokemonCount: Number(userAccount.pokemonCount),
          balance: Number(userAccount.balance),
        });

        // Fetch Pokedex account
        console.log('Pokedex PDA:', pokedexPDA.toString());
        const pokedexAccount = await program.account.pokedex.fetch(pokedexPDA);
        console.log('Raw Pokedex account:', pokedexAccount);

        // The ids field contains the raw Pokemon IDs that were caught
        const caughtIds = Array.from(pokedexAccount.ids as number[]);
        console.log('Caught Pokemon IDs:', caughtIds);
        setCaughtPokemon(caughtIds);

        // Fetch all owned Pokemon
        // We need to fetch all Pokemon PDAs for this user
        const pokemonCount = Number(userAccount.pokemonCount);
        console.log(`Loading ${pokemonCount} Pokemon for user...`);
        const pokemonPromises: Promise<BlockchainPokemon | null>[] = [];

        for (let i = 0; i < pokemonCount; i++) {
          pokemonPromises.push(
            (async () => {
              try {
                // Derive Pokemon PDA - manually write u64 as little-endian bytes
                const countBuffer = Buffer.alloc(8);
                const value = BigInt(i);
                // Write each byte in little-endian order
                for (let j = 0; j < 8; j++) {
                  countBuffer[j] = Number((value >> BigInt(j * 8)) & BigInt(0xff));
                }

                const [pokemonPDA] = PublicKey.findProgramAddressSync(
                  [Buffer.from('POKEMON_SEED'), userDataPDA.toBuffer(), countBuffer],
                  program.programId
                );

                const pokemonAccount = await program.account.pokemon.fetch(pokemonPDA);

                return {
                  id: pokemonAccount.id as number,
                  name: pokemonAccount.name as string,
                  owner: pokemonAccount.owner as PublicKey,
                  gender: (pokemonAccount.gender as any).male ? 'Male' : 'Female',
                  isShiny: pokemonAccount.isShiny as boolean,
                  worth: Number(pokemonAccount.worth),
                  bump: pokemonAccount.bump as number,
                  accountAddress: pokemonPDA,
                } as BlockchainPokemon;
              } catch (err) {
                console.error(`Failed to fetch Pokemon ${i}:`, err);
                return null;
              }
            })()
          );
        }

        const allPokemon = await Promise.all(pokemonPromises);
        const validPokemon = allPokemon.filter((p): p is BlockchainPokemon => p !== null);
        console.log(`Loaded ${validPokemon.length} Pokemon:`, validPokemon);
        setPokemon(validPokemon);

        setUserLoading(false);
        setPokedexLoading(false);
        setPokemonLoading(false);
      } catch (error: any) {
        console.error('Error loading user data:', error);
        const errorMsg = error?.message || 'Failed to load user data';
        setUserError(errorMsg);
        setPokedexError(errorMsg);
        setPokemonError(errorMsg);
        setUserLoading(false);
        setPokedexLoading(false);
        setPokemonLoading(false);
      }
    }

    loadData();
  }, [connected, publicKey, anchorWallet]);
}
