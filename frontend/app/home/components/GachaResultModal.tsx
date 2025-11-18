"use client";

import { useState } from "react";
import { Card, Button } from "pixel-retroui";
import Image from "next/image";
import { OwnedPokemon } from "@/lib/types";
import { getPokeballSprite, getAnimatedSpritePath } from "@/lib/utils";

interface GachaResultModalProps {
  pulledPokemon: OwnedPokemon[];
  onClose: () => void;
}

export default function GachaResultModal({
  pulledPokemon,
  onClose,
}: GachaResultModalProps) {
  // Track which Pokemon are revealed (true = revealed, false = pokeball)
  const [revealed, setRevealed] = useState<boolean[]>(
    new Array(pulledPokemon.length).fill(false)
  );

  // Check if all Pokemon are revealed
  const allRevealed = revealed.every((r) => r);

  // Handle individual reveal
  const handleReveal = (index: number) => {
    if (!revealed[index]) {
      setRevealed((prev) => {
        const newRevealed = [...prev];
        newRevealed[index] = true;
        return newRevealed;
      });
    }
  };

  // Handle reveal all
  const handleRevealAll = () => {
    setRevealed(new Array(pulledPokemon.length).fill(true));
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
    >
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card bg="#f0f0f0" textColor="#000" borderColor="#000">
          <div className="flex flex-col gap-6 p-6">

            {/* Results Grid */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {pulledPokemon.map((pokemon, index) => (
                <button
                  key={pokemon.ownedId}
                  onClick={() => handleReveal(index)}
                  className={`flex flex-col items-center gap-2 p-3 rounded transition-all ${
                    revealed[index]
                      ? "bg-transparent"
                      : "hover:bg-gray-200 hover:scale-105"
                  }`}
                  style={{
                    cursor: revealed[index] ? "default" : "pointer",
                  }}
                  disabled={revealed[index]}
                >
                  {/* Pokeball or Pokemon Sprite */}
                  <div
                    className={`relative ${
                      revealed[index] ? "w-24 h-24" : "w-16 h-16"
                    } transition-all`}
                  >
                    {revealed[index] ? (
                      // Revealed: Show animated Pokemon sprite
                      <Image
                        src={getAnimatedSpritePath(
                          pokemon.name,
                          pokemon.isShiny ? "shiny" : "normal"
                        )}
                        alt={pokemon.name}
                        fill
                        className="pixelated object-contain animate-in zoom-in duration-300"
                        style={{ imageRendering: "pixelated" }}
                        unoptimized
                      />
                    ) : (
                      // Hidden: Show pokeball
                      <Image
                        src={getPokeballSprite(pokemon.rarity)}
                        alt="Pokeball"
                        fill
                        className="pixelated object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    )}
                  </div>

                  {/* Pokemon Name (only when revealed) */}
                  {revealed[index] && (
                    <div className="text-center animate-in fade-in duration-300">
                      <p className="text-xs font-bold">{pokemon.name}</p>
                      {pokemon.isShiny && (
                        <p
                          className="text-xs font-bold"
                          style={{ color: "#FFD700" }}
                        >
                          ✨ SHINY
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rarity Badge (only when not revealed) */}
                  {!revealed[index] && (
                    <div className="flex items-center justify-center">
                      <span
                        className="text-xs font-bold px-2 py-1 border-2 border-black"
                        style={{
                          backgroundColor:
                            pokemon.rarity === "UR"
                              ? "#FF1493"
                              : pokemon.rarity === "SSR"
                              ? "#FFD700"
                              : pokemon.rarity === "SR"
                              ? "#4169E1"
                              : "#808080",
                          color: "#fff",
                        }}
                      >
                        {pokemon.rarity}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              {allRevealed ? (
                <Button
                  bg="#4169E1"
                  textColor="#fff"
                  borderColor="#000"
                  shadow="#000"
                  onClick={onClose}
                  className="px-12"
                >
                  OK
                </Button>
              ) : (
                <Button
                  bg="#4169E1"
                  textColor="#fff"
                  borderColor="#000"
                  shadow="#000"
                  onClick={handleRevealAll}
                  className="px-12"
                >
                  OPEN ALL
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
