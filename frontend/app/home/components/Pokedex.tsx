"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Input, Card } from "pixel-retroui";
import Image from "next/image";
import { Pokemon } from "@/lib/types";
import { getSpritePath } from "@/lib/utils";
import { usePokedexStore } from "@/lib/stores/usePokedexStore";
import PokemonModal from "./PokemonModal";
import pokedexData from "@/pokedex.json";

export default function Pokedex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [displayCount, setDisplayCount] = useState(40);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { isPokemonCaught } = usePokedexStore();

  // Filter Pokemon based on search query
  const filteredPokemon = useMemo(() => {
    const allPokemon = pokedexData as Pokemon[];
    if (!searchQuery.trim()) {
      return allPokemon;
    }
    return allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Paginated Pokemon for infinite scroll
  const displayedPokemon = useMemo(() => {
    return filteredPokemon.slice(0, displayCount);
  }, [filteredPokemon, displayCount]);

  // Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredPokemon.length) {
          setDisplayCount((prev) => Math.min(prev + 40, filteredPokemon.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredPokemon.length]);

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCount(40);
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 pb-2" style={{ backgroundColor: "transparent" }}>
        <Input
          placeholder="Search Pokemon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          bg="#fff"
          textColor="#000"
          borderColor="#000"
        />
      </div>

      {/* Pokemon Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {displayedPokemon.map((pokemon) => {
          const isUnlocked = isPokemonCaught(pokemon.id);
          return (
            <Card
              key={pokemon.id}
              bg="#f0f0f0"
              textColor="#000"
              borderColor="#000"
              shadowColor="#767676"
            >
              <button
                onClick={() => isUnlocked && setSelectedPokemon(pokemon)}
                className="flex flex-col items-center gap-2 p-2 w-full"
                style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
              >
                {/* Pokemon Sprite */}
                <div className="relative w-24 h-24">
                  <Image
                    src={getSpritePath(pokemon.name)}
                    alt={isUnlocked ? pokemon.name : "???"}
                    fill
                    className="pixelated"
                    style={{
                      imageRendering: "pixelated",
                      filter: isUnlocked ? "none" : "brightness(0)",
                    }}
                  />
                </div>

                {/* Pokemon Name (only if unlocked) */}
                {isUnlocked && (
                  <p className="text-xs font-bold text-center break-words">
                    {pokemon.name}
                  </p>
                )}
              </button>
            </Card>
          );
        })}
      </div>

      {/* Load More Trigger */}
      {displayCount < filteredPokemon.length && (
        <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
          <p className="text-sm" style={{ color: "#767676" }}>
            Loading more...
          </p>
        </div>
      )}

      {/* No Results */}
      {filteredPokemon.length === 0 && (
        <div className="flex items-center justify-center py-10">
          <p className="text-center" style={{ color: "#767676" }}>
            No Pokemon found
          </p>
        </div>
      )}

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
}
