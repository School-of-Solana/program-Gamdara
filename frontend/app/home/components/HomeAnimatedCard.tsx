"use client";

import { useMemo } from "react";
import { Card } from "pixel-retroui";
import Image from "next/image";
import { getAnimatedSpritePath } from "@/lib/utils";
import { usePokemonStore } from "@/lib/stores/usePokemonStore";
import pokedexData from "@/pokedex.json";
import { Pokemon } from "@/lib/types";

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

interface HomeAnimatedCardProps {
  onNavigate?: () => void;
}

export default function HomeAnimatedCard({ onNavigate }: HomeAnimatedCardProps) {
  const { ownedPokemon } = usePokemonStore();

  // Select random background
  const randomBg = useMemo(() => {
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }, []);

  // Select 5 random owned Pokemon from blockchain data
  const floatingPokemon = useMemo(() => {
    const allPokemon = pokedexData as Pokemon[];

    // Convert blockchain Pokemon to display format
    const ownedList = ownedPokemon.map((bPokemon) => {
      const pokemonData = allPokemon.find((p) => p.id === bPokemon.id);

      if (!pokemonData) {
        console.warn(`Pokemon with ID ${bPokemon.id} not found in pokedex`);
        return null;
      }

      return {
        ...pokemonData,
        isShiny: bPokemon.isShiny,
        ownedId: bPokemon.accountAddress.toString(),
      };
    }).filter((p): p is Pokemon & { isShiny: boolean; ownedId: string } => p !== null);

    // Shuffle and take 5
    const shuffled = [...ownedList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, [ownedPokemon]);

  // Generate random positions for each Pokemon
  const pokemonPositions = useMemo(
    () =>
      floatingPokemon.map(() => ({
        top: `${Math.random() * 60 + 10}%`, // 10-70%
        left: `${Math.random() * 70 + 10}%`, // 10-80%
      })),
    [floatingPokemon]
  );

  return (
    <div
      onClick={onNavigate}
      className="cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <Card
        bg="#f0f0f0"
        textColor="#000"
        borderColor="#000"
        shadowColor="#767676"
        className="w-full"
      >
        <div
          className="relative h-64 md:h-80 overflow-hidden"
          style={{
            backgroundImage: `url(/sprites/bg/${randomBg}.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
        {/* Overlay for better visibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))",
          }}
        />

        {/* Floating Pokemon */}
        {floatingPokemon.map((pokemon, index) => (
          <div
            key={pokemon.ownedId}
            className={`absolute float-${index + 1}`}
            style={{
              top: pokemonPositions[index].top,
              left: pokemonPositions[index].left,
              animationDelay: `${index * 0.5}s`,
            }}
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24">
              <Image
                src={getAnimatedSpritePath(
                  pokemon.name,
                  pokemon.isShiny ? "shiny" : "normal"
                )}
                alt={pokemon.name}
                fill
                className="pixelated object-contain drop-shadow-lg"
                style={{ imageRendering: "pixelated" }}
                unoptimized
              />
            </div>
          </div>
        ))}

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className="inline-block px-4 py-2 border-4 border-black"
            style={{ backgroundColor: "#c381b5" }}
          >
            <h2
              className="text-xl md:text-2xl font-bold"
              style={{ color: "#fefcd0", textShadow: "2px 2px 0px #000" }}
            >
              MY POKEMON
            </h2>
          </div>
        </div>
      </div>
    </Card>
    </div>
  );
}
