"use client";

import { useState } from "react";
import { Card } from "pixel-retroui";
import { useUserStore } from "@/lib/stores/useUserStore";
import Image from "next/image";
import TopupModal from "./TopupModal";

export default function CoinsDisplay() {
  const { userData, isLoading } = useUserStore();
  const [showTopup, setShowTopup] = useState(false);

  const coins = userData?.balance ?? 0;

  return (
    <div className="absolute top-4 right-4 z-20">
      <Card className="p-0" bg="#f0f0f0" textColor="#000" borderColor="#000" shadowColor="#767676">
        <div className="flex items-center gap-2 ">
          {/* Coin Icon */}
          <div className="relative w-5 h-5">
            <Image
              src="/sprites/pokecoin.png"
              alt="Coins"
              fill
              className="pixelated object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Coin Amount */}
          <span className="font-bold text-sm">
            {isLoading ? "..." : coins}
          </span>

          {/* Plus Button */}
          <button
            className="w-6 h-6 flex items-center justify-center border-2 transition-colors hover:bg-gray-200"
            style={{ borderColor: "#000" }}
            onClick={() => setShowTopup(true)}
            disabled={isLoading}
          >
            <i className="hn hn-plus text-sm"></i>
          </button>
        </div>
      </Card>

      {/* Topup Modal */}
      {showTopup && <TopupModal onClose={() => setShowTopup(false)} />}
    </div>
  );
}
