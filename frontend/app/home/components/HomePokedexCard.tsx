"use client";

import { Card } from "pixel-retroui";
import { usePokedexStore } from "@/lib/stores/usePokedexStore";

interface HomePokedexCardProps {
  onNavigate: () => void;
}

export default function HomePokedexCard({ onNavigate }: HomePokedexCardProps) {
  const { caughtPokemon } = usePokedexStore();

  // Get count of caught Pokemon
  const unlockedCount = caughtPokemon.size;

  const progress = (unlockedCount / 151) * 100;

  return (
    <button
      onClick={onNavigate}
      className="w-full hover:scale-105 transition-transform"
    >
      <Card
        bg="#f0f0f0"
        textColor="#000"
        borderColor="#000"
        shadowColor="#767676"
        className="w-full h-full"
      >
        <div className="flex flex-col items-center justify-center p-6 gap-4 min-h-[150px]">
          {/* Icon */}
          {/* <i
            className="hn hn-book-heart text-5xl"
            style={{ color: "#c381b5" }}
          ></i> */}

          {/* Title */}
          <h3 className="text-xl font-bold" style={{ color: "#c381b5" }}>
            POKEDEX
          </h3>

          {/* Progress */}
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Progress</span>
              <span className="text-lg font-bold" style={{ color: "#c381b5" }}>
                {unlockedCount} / 151
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 border-2 border-black bg-white">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#c381b5",
                }}
              />
            </div>
          </div>

          {/* CTA */}
          <p className="text-xs" style={{ color: "#767676" }}>
            Click to view all Pokemon
          </p>
        </div>
      </Card>
    </button>
  );
}
