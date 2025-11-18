"use client";

import { useEffect } from "react";
import { Button, Card } from "pixel-retroui";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "@/lib/hooks/useWalletAuth";

export default function Home() {
  const router = useRouter();
  const { connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { accountExists, checking } = useWalletAuth();

  // Redirect logic
  useEffect(() => {
    if (connected && !checking && accountExists !== null) {
      if (accountExists) {
        // User has account, go to home
        router.push("/home");
      } else {
        // User connected but no account, go to onboarding
        router.push("/onboarding");
      }
    }
  }, [connected, accountExists, checking, router]);

  const handleConnectWallet = () => {
    setVisible(true);
  };

  return (
    <div className="mobile-container">
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Pixelated background pattern */}
        <div className="absolute inset-0 opacity-10"/>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-16 w-full max-w-md px-4">
          {/* Logo/Title Section */}
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Title */}
            <div className="flex flex-col gap-3">
              <h1 className="!text-5xl font-bold tracking-wider" style={{
                color: '#c381b5',
                textShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.1em'
              }}>
                GACHADEX
              </h1>
              <p className="text-base md:text-lg tracking-widest opacity-80" style={{
                color: '#000'
              }}>
                GACHA ▪ COLLECT ▪ SELL
              </p>
            </div>
          </div>

          {/* Login Section */}
          <div className="flex flex-col gap-8 w-full">
            {/* Info Box */}
            <Card
              bg="#f0f0f0"
              textColor="#000"
              borderColor="#000"
              shadowColor="#767676"
            >
              <p>Connect your Phantom wallet and start completing your Pokedex!</p>
            </Card>

            {/* Connect Button */}
            <Button
              bg="#c381b5"
              textColor="#fefcd0"
              borderColor="#000"
              shadow="#000"
              onClick={handleConnectWallet}
              disabled={connecting || checking}
            >
              {connecting || checking ? "CONNECTING..." : "CONNECT WALLET"}
            </Button>

            {/* Footer text */}
            <p className="text-sm text-center opacity-60 mt-4" style={{
              color: '#000'
            }}>
              Powered by Solana ⚡ Blockchain
            </p>
          </div>
        </div>

        {/* Decorative pixel corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 opacity-50" style={{
          borderColor: '#c381b5'
        }}></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 opacity-50" style={{
          borderColor: '#c381b5'
        }}></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 opacity-50" style={{
          borderColor: '#c381b5'
        }}></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 opacity-50" style={{
          borderColor: '#c381b5'
        }}></div>
      </main>
    </div>
  );
}
