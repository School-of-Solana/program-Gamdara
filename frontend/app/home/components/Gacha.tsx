"use client";

import { useState, useMemo } from "react";
import { Card, Button } from "pixel-retroui";
import Image from "next/image";
import { getSpritePath, performGachaPull } from "@/lib/utils";
import pokedexData from "@/pokedex.json";
import { Pokemon, OwnedPokemon } from "@/lib/types";
import GachaResultModal from "./GachaResultModal";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getProgram, getUserDataPDA, getPokedexPDA, getPokemonPDA, getConfigPDA } from "@/lib/anchor/setup";
import { useUserStore } from "@/lib/stores/useUserStore";
import { usePokemonStore } from "@/lib/stores/usePokemonStore";
import { usePokedexStore } from "@/lib/stores/usePokedexStore";
import { GACHA_COST, ADMIN_ADDRESS } from "@/lib/constants";
import TopupModal from "./TopupModal";

export default function Gacha() {
  const [pulling, setPulling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingPull, setPendingPull] = useState<{ count: number; cost: number } | null>(null);
  const [pulledPokemon, setPulledPokemon] = useState<OwnedPokemon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTopup, setShowTopup] = useState(false);

  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { userData, updateBalance, incrementPokemonCount } = useUserStore();
  const { addPokemon } = usePokemonStore();
  const { addCaughtPokemon } = usePokedexStore();

  // Get random Pokemon for banner background - split into rows
  const marqueeRows = useMemo(() => {
    const allPokemon = pokedexData as Pokemon[];
    const shuffled = [...allPokemon].sort(() => Math.random() - 0.5);

    // Create 4 rows with 8 Pokemon each for smooth scrolling
    const rows = [];
    for (let i = 0; i < 4; i++) {
      const rowPokemon = shuffled.slice(i * 8, (i + 1) * 8);
      rows.push(rowPokemon);
    }
    return rows;
  }, []);

  const handlePull = (count: number, cost: number) => {
    const coins = userData?.balance ?? 0;
    if (coins < cost) {
      // Show topup modal instead of alert
      setShowTopup(true);
      return;
    }

    // Show confirmation modal
    setPendingPull({ count, cost });
    setShowConfirmation(true);
  };

  const confirmPull = async () => {
    if (!pendingPull || !publicKey || !anchorWallet) {
      alert("Wallet not connected");
      return;
    }

    setShowConfirmation(false);
    setPulling(true);
    setError(null);

    try {
      const program = getProgram(anchorWallet);
      const [userDataPDA] = await getUserDataPDA(publicKey);
      const [pokedexPDA] = await getPokedexPDA(publicKey);
      const [configPDA] = await getConfigPDA();

      // Perform gacha pull to get results
      const gachaResults = performGachaPull(pendingPull.count);

      console.log(SystemProgram.programId.toString() ,gachaResults);

      // Build a single transaction with all gacha instructions
      const transaction = await program.methods
        .gacha({
          id: gachaResults[0].pokemonId,
          isShiny: gachaResults[0].isShiny,
          gender: gachaResults[0].gender === 'Male' ? { male: {} } : { female: {} },
          worth: new BN(gachaResults[0].worth),
        })
        .accounts({
          owner: publicKey,
          userData: userDataPDA,
          pokedex: pokedexPDA,
          pokemon: await getPokemonPDA(userDataPDA, userData?.pokemonCount ?? 0).then(([pda]) => pda),
        })
        .transaction();

      // Add remaining gacha instructions to the same transaction
      for (let i = 1; i < gachaResults.length; i++) {
        const result = gachaResults[i];
        const currentPokemonCount = (userData?.pokemonCount ?? 0) + i;
        const [pokemonPDA] = await getPokemonPDA(userDataPDA, currentPokemonCount);
        const gender = result.gender === 'Male' ? { male: {} } : { female: {} };

        const instruction = await program.methods
          .gacha({
            id: result.pokemonId,
            isShiny: result.isShiny,
            gender: gender,
            worth: new BN(result.worth),
          })
          .accounts({
            owner: publicKey,
            userData: userDataPDA,
            pokedex: pokedexPDA,
            pokemon: pokemonPDA,
          })
          .instruction();

        transaction.add(instruction);
      }

      // Send the single transaction with all instructions
      const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await anchorWallet.signTransaction(transaction);
      const txSignature = await program.provider.connection.sendRawTransaction(signedTx.serialize());
      await program.provider.connection.confirmTransaction({
        signature: txSignature,
        blockhash,
        lastValidBlockHeight
      });

      console.log(`Gacha ${pendingPull.count}x pull successful! Transaction:`, txSignature);

      // Process results for display and store updates
      const pulledPokemonList: OwnedPokemon[] = [];
      const allPokemon = pokedexData as Pokemon[];

      for (let i = 0; i < gachaResults.length; i++) {
        const result = gachaResults[i];
        const currentPokemonCount = (userData?.pokemonCount ?? 0) + i;
        const [pokemonPDA] = await getPokemonPDA(userDataPDA, currentPokemonCount);

        const pokemonData = allPokemon.find(p => p.id === result.pokemonId);

        if (pokemonData) {
          // Add to display list
          pulledPokemonList.push({
            ...pokemonData,
            ownedId: pokemonPDA.toString(),
            ownedAt: Date.now(),
            isShiny: result.isShiny,
          });

          // Update stores
          addPokemon({
            id: result.pokemonId,
            name: pokemonData.name,
            owner: publicKey,
            gender: result.gender,
            isShiny: result.isShiny,
            worth: result.worth,
            bump: 0,
            accountAddress: pokemonPDA,
          });

          addCaughtPokemon(result.pokemonId);
          incrementPokemonCount();
        }
      }

      // Update balance
      const newBalance = (userData?.balance ?? 0) - pendingPull.cost;
      updateBalance(newBalance);

      // Show results
      setPulledPokemon(pulledPokemonList);
    } catch (err: any) {
      console.error("Error during gacha pull:", err);
      setError(err.message || "Gacha pull failed. Please try again.");
      alert(err.message || "Gacha pull failed. Please try again.");
    } finally {
      setPulling(false);
      setPendingPull(null);
    }
  };

  const cancelPull = () => {
    setShowConfirmation(false);
    setPendingPull(null);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Banner */}
      <Card
        bg="#f0f0f0"
        textColor="#000"
        borderColor="#000"
        shadowColor="#767676"
        className="w-full"
      >
        <div className="relative min-h-[65vh] flex flex-col items-center justify-center overflow-hidden">
          {/* Marquee Background Pokemon Sprites */}
          <div className="absolute inset-0 flex flex-col justify-around opacity-75">
            {marqueeRows.map((row, rowIndex) => (
              <div key={rowIndex} className="overflow-hidden h-20">
                <div
                  className={`flex gap-4 ${
                    rowIndex % 2 === 0 ? "marquee-left" : "marquee-right"
                  }`}
                  style={{ width: "200%" }}
                >
                  {/* Duplicate the row for seamless loop */}
                  {[...row, ...row].map((pokemon, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <Image
                        src={getSpritePath(pokemon.name)}
                        alt=""
                        fill
                        className="pixelated object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Overlay for better text readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(240,240,240,0.8), rgba(240,240,240,0.4))",
            }}
          />

          {/* Content */}
          <div className="relative flex flex-col items-center z-10 gap-4 text-center space-y-6 p-8">
            <div className="w-fit inline-block px-6 py-2 border-4 border-black " style={{ backgroundColor: "#c381b5" }}>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#fefcd0", textShadow: "2px 2px 0px #000" }}>
                ★ GEN 1 POKEMON ★
              </h2>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold my-4" style={{ color: "#000" }}>
              ALL 151 POKEMON AVAILABLE!
            </h1>

            {/* Guaranteed SSR Badge */}
            <div className="inline-block px-6 py-3 border-4 border-black" style={{ backgroundColor: "#FFD700" }}>
              <p className="text-lg md:text-xl font-bold flex items-center gap-2 justify-center">
                <i className="hn hn-star"></i>
                10 PULLS GUARANTEED SSR
                <i className="hn hn-star"></i>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pull Buttons */}
      <div className="flex gap-6 flex-col md:flex-row">
        <div className="flex-1">
          <Button
            bg="#c381b5"
            textColor="#fefcd0"
            borderColor="#000"
            shadow="#000"
            onClick={() => handlePull(1, 10)}
            disabled={pulling}
            className="w-full"
          >
            <div className="flex flex-col items-center py-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">1x PULL (</span>
                <div className="relative w-5 h-5 inline-block">
                  <Image
                    src="/sprites/pokecoin.png"
                    alt="Coins"
                    fill
                    className="pixelated object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <span className="text-xl font-bold">10)</span>
              </div>
            </div>
          </Button>
        </div>

        <div className="flex-1">
          <Button
            bg="#FFD700"
            textColor="#000"
            borderColor="#000"
            shadow="#000"
            onClick={() => handlePull(10, 100)}
            disabled={pulling}
            className="w-full"
          >
            <div className="flex flex-col items-center py-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">10x PULL (</span>
                <div className="relative w-5 h-5 inline-block">
                  <Image
                    src="/sprites/pokecoin.png"
                    alt="Coins"
                    fill
                    className="pixelated object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <span className="text-xl font-bold">100)</span>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && pendingPull && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={cancelPull}
        >
          <div
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Card bg="#f0f0f0" textColor="#000" borderColor="#000">
              <div className="flex flex-col items-center gap-6 p-6">
                {/* Title */}
                <h2 className="text-2xl font-bold text-center">
                  Confirm Pull
                </h2>

                {/* Message */}
                <div className="text-center space-y-2">
                  <p className="text-lg flex items-center justify-center gap-2">
                    Spend{" "}
                    <span className="font-bold flex items-center gap-1">
                      <div className="relative w-5 h-5">
                        <Image
                          src="/sprites/pokecoin.png"
                          alt="Coins"
                          fill
                          className="pixelated object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      {pendingPull.cost}
                    </span>{" "}
                    coins
                  </p>
                  <p className="text-lg">
                    for <span className="font-bold" style={{ color: "#c381b5" }}>
                      {pendingPull.count}x Pull{pendingPull.count > 1 ? 's' : ''}
                    </span>?
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 w-full">
                  <div className="flex-1">
                    <Button
                      bg="#808080"
                      textColor="#fff"
                      borderColor="#000"
                      shadow="#000"
                      onClick={cancelPull}
                      className="w-full"
                    >
                      CANCEL
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button
                      bg="#c381b5"
                      textColor="#fefcd0"
                      borderColor="#000"
                      shadow="#000"
                      onClick={confirmPull}
                      className="w-full"
                    >
                      CONFIRM
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Gacha Result Modal */}
      {pulledPokemon && (
        <GachaResultModal
          pulledPokemon={pulledPokemon}
          onClose={() => setPulledPokemon(null)}
        />
      )}

      {/* Topup Modal */}
      {showTopup && <TopupModal onClose={() => setShowTopup(false)} />}
    </div>
  );
}
