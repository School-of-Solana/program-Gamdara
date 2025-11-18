"use client";

import { Card } from "pixel-retroui";
import Image from "next/image";
import { useUserStore } from "@/lib/stores/useUserStore";

interface HomeGachaCardProps {
  onNavigate: () => void;
}

export default function HomeGachaCard({ onNavigate }: HomeGachaCardProps) {
  const { userData } = useUserStore();
  const coins = userData?.balance ?? 0;

  return (
    <button
      onClick={onNavigate}
      className="w-full hover:scale-105 transition-transform"
    >
      <Card
        bg="#FFD700"
        textColor="#000"
        borderColor="#000"
        shadowColor="#767676"
        className="w-full h-full"
      >
        <div className="flex flex-col items-center justify-center gap-4 min-h-[150px]">
          {/* Icon */}
          {/* <i className="hn hn-sparkles text-5xl" style={{ color: "#c381b5" }}></i> */}

          {/* Title */}
          <h3 className="text-xl font-bold" style={{ color: "#c381b5" }}>
            GACHA
          </h3>

          {/* CTA Text */}
          <p className="text-lg font-bold">Try Your Luck!</p>

          {/* Coin Balance */}
          <div className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white">
            <div className="relative w-5 h-5">
              <Image
                src="/sprites/pokecoin.png"
                alt="Coins"
                fill
                className="pixelated object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <span className="font-bold">{coins}</span>
          </div>

          {/* Description */}
          <p className="text-xs" style={{ color: "#767676" }}>
            Click to pull Pokemon
          </p>
        </div>
      </Card>
    </button>
  );
}
