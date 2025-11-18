"use client";

import { useState, useMemo } from "react";
import { Input, Card, Button, Popup } from "pixel-retroui";
import Image from "next/image";
import { Pokemon } from "@/lib/types";
import { getSpritePath } from "@/lib/utils";
import { usePokemonStore, BlockchainPokemon } from "@/lib/stores/usePokemonStore";
import { useUserStore } from "@/lib/stores/useUserStore";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getProgram, getUserDataPDA, getConfigPDA } from "@/lib/anchor/setup";
import PokemonModal from "./PokemonModal";
import pokedexData from "@/pokedex.json";

const backgrounds = [
  "beach",
  "cave",
  "ciy",
  "crag",
  "desert",
  "forest",
  "river",
  "savana",
  "seafloor",
  "sky",
  "snow",
  "volcano",
];

export default function OwnedPokemon() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPokemon, setSelectedPokemon] = useState<(Pokemon & { accountAddress?: PublicKey; nickname?: string; isShiny?: boolean; worth?: number }) | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();

  const { ownedPokemon, updatePokemonName, removePokemon } = usePokemonStore();
  const { updateBalance } = useUserStore();

  const itemsPerPage = 20;

  // Get background based on current page (cycles through backgrounds)
  const currentBg = useMemo(() => {
    return backgrounds[(currentPage - 1) % backgrounds.length];
  }, [currentPage]);

  // Convert blockchain Pokemon to display format with metadata from pokedex
  const ownedPokemonList = useMemo(() => {
    const allPokemon = pokedexData as Pokemon[];
    return ownedPokemon.map((bPokemon) => {
      const pokemonData = allPokemon.find((p) => p.id === bPokemon.id) || {
        id: bPokemon.id,
        name: "Unknown",
        rarity: "R" as const,
        description: "",
        type: [],
        weakness: [],
      };

      return {
        ...pokemonData,
        nickname: bPokemon.name !== pokemonData.name ? bPokemon.name : undefined,
        isShiny: bPokemon.isShiny,
        accountAddress: bPokemon.accountAddress,
        worth: bPokemon.worth,
        gender: bPokemon.gender,
      };
    });
  }, [ownedPokemon]);

  // Filter Pokemon based on search query
  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) {
      return ownedPokemonList;
    }
    return ownedPokemonList.filter((pokemon) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        pokemon.name.toLowerCase().includes(searchTerm) ||
        pokemon.nickname?.toLowerCase().includes(searchTerm)
      );
    });
  }, [searchQuery, ownedPokemonList]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPagePokemon = filteredPokemon.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate range display
  const rangeStart = filteredPokemon.length > 0 ? startIndex + 1 : 0;
  const rangeEnd = Math.min(endIndex, filteredPokemon.length);

  // Handle rename with blockchain transaction
  const handleRename = async (pokemon: Pokemon & { accountAddress?: PublicKey; nickname?: string }, newName: string) => {
    if (!publicKey || !anchorWallet || !pokemon.accountAddress) {
      setSuccessMessage("Wallet not connected or Pokemon account not found");
      setShowSuccess(true);
      return;
    }

    try {
      const program = getProgram(anchorWallet);

      // Call rename instruction
      const tx = await program.methods
        .rename(newName)
        .accounts({
          signer: publicKey,
          pokemon: pokemon.accountAddress,
        })
        .rpc();

      console.log("Rename successful! Transaction:", tx);

      // Update store
      updatePokemonName(pokemon.accountAddress, newName);

      setSuccessMessage(`Successfully renamed to ${newName}!`);
      setShowSuccess(true);
      setSelectedPokemon(null);
    } catch (err: any) {
      console.error("Error renaming Pokemon:", err);
      setSuccessMessage(err.message || "Failed to rename Pokemon");
      setShowSuccess(true);
    }
  };

  // Handle release with blockchain transaction
  const handleRelease = async (pokemon: Pokemon & { accountAddress?: PublicKey; nickname?: string; worth?: number }) => {
    if (!publicKey || !anchorWallet || !pokemon.accountAddress) {
      setSuccessMessage("Wallet not connected or Pokemon account not found");
      setShowSuccess(true);
      return;
    }

    try {
      const program = getProgram(anchorWallet);
      const [userDataPDA] = await getUserDataPDA(publicKey);
      const [configPDA] = await getConfigPDA();

      // Call release instruction
      const tx = await program.methods
        .release()
        .accounts({
          signer: publicKey,
          userData: userDataPDA,
          pokemon: pokemon.accountAddress,
          config: configPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Release successful! Transaction:", tx);

      // Update stores
      removePokemon(pokemon.accountAddress);

      // Fetch updated balance
      const updatedUserData = await (program.account as any).userData.fetch(userDataPDA);
      updateBalance(Number(updatedUserData.balance));

      setSuccessMessage(`Successfully released ${pokemon.nickname || pokemon.name}!`);
      setShowSuccess(true);
      setSelectedPokemon(null);
    } catch (err: any) {
      console.error("Error releasing Pokemon:", err);
      setSuccessMessage(err.message || "Failed to release Pokemon");
      setShowSuccess(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search Bar */}
      <div>
        <Input
          placeholder="Search owned Pokemon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg="#fff"
          textColor="#000"
          borderColor="#000"
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between gap-2">
        <Button
          bg="#c381b5"
          textColor="#fefcd0"
          borderColor="#000"
          shadow="#000"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          ◀
        </Button>

        <Card bg="#f0f0f0" textColor="#000" borderColor="#000" className="w-full">
          <div className="px-4 py-2 font-bold text-center min-w-[100px]">
            {rangeStart}-{rangeEnd}
          </div>
        </Card>

        <Button
          bg="#c381b5"
          textColor="#fefcd0"
          borderColor="#000"
          shadow="#000"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages || filteredPokemon.length === 0}
        >
          ▶
        </Button>
      </div>

      {/* PC Box Card */}
      <Card bg="#f0f0f0" textColor="#000" borderColor="#000" shadowColor="#767676">
        <div
          className="relative p-4 min-h-[400px]"
          style={{
            backgroundImage: `url(/sprites/bg/${currentBg}.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for better visibility */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(240,240,240,0.35), rgba(240,240,240,0.75))",
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {filteredPokemon.length === 0 ? (
              <div className="text-center py-10">
                <p style={{ color: "#767676" }}>
                  {searchQuery ? "No Pokemon found" : "No owned Pokemon"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {currentPagePokemon.map((pokemon) => (
                  <button
                    key={pokemon.accountAddress?.toString() || `${pokemon.id}-${pokemon.name}`}
                    onClick={() => setSelectedPokemon(pokemon)}
                    className="flex flex-col items-center gap-1 p-2 bg-white/60 hover:bg-white/80 rounded transition-colors border-2 border-black"
                    style={{ cursor: "pointer" }}
                  >
                    {/* Pokemon Sprite */}
                    <div className="relative w-24 h-24">
                      <Image
                        src={getSpritePath(pokemon.name, pokemon.isShiny ? 'shiny' : 'normal')}
                        alt={pokemon.nickname || pokemon.name}
                        fill
                        className="pixelated"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>

                    {/* Pokemon Name or Nickname */}
                    <p className="text-xs font-bold text-center break-words w-full">
                      {pokemon.nickname || pokemon.name}
                    </p>
                  </button>
                ))}

                {/* Fill empty slots to maintain grid structure */}
                {Array.from({ length: itemsPerPage - currentPagePokemon.length }).map(
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="flex flex-col items-center gap-1 p-2"
                    >
                      <div className="w-24 h-24 border-2 border-dashed border-gray-400 rounded bg-white/30" />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
          showActions={true}
          onRename={handleRename}
          onRelease={handleRelease}
        />
      )}

      {/* Success Popup */}
      {showSuccess && (
        <Popup
          bg="#c381b5"
          textColor="#fefcd0"
          borderColor="#000"
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
        >
          <div className="flex flex-col items-center gap-4 p-4">
            <h3 className="text-xl font-bold text-center">{successMessage}</h3>
            <Button
              bg="#fefcd0"
              textColor="#c381b5"
              borderColor="#000"
              shadow="#000"
              onClick={() => setShowSuccess(false)}
              className="w-full mt-2"
            >
              OK
            </Button>
          </div>
        </Popup>
      )}
    </div>
  );
}
