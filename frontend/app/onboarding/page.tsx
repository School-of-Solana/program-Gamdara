"use client";

import { Button, Input } from "pixel-retroui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useOnboardingGuard } from "@/lib/hooks/useWalletAuth";
import { getProgram, getUserDataPDA, getPokedexPDA } from "@/lib/anchor/setup";
import { SystemProgram } from "@solana/web3.js";

export default function Onboarding() {
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();

  // Route protection - will redirect if not connected or if account already exists
  const { checking } = useOnboardingGuard();

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    if (!publicKey || !anchorWallet) {
      setError("Wallet not connected");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const program = getProgram(anchorWallet);
      const [userDataPDA] = await getUserDataPDA(publicKey);
      const [pokedexPDA] = await getPokedexPDA(publicKey);

      // Call create_user instruction
      const tx = await program.methods
        .createUser(username)
        .accounts({
          signer: publicKey,
          userData: userDataPDA,
          pokedex: pokedexPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("User created successfully! Transaction:", tx);

      // Navigate to home page
      router.push("/home");
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create account. Please try again.");
      setIsCreating(false);
    }
  };

  // Show loading while checking account status
  if (checking) {
    return (
      <div className="mobile-container">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <p className="text-lg" style={{ color: '#000' }}>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <main className="flex min-h-screen flex-col items-center justify-between px-6 py-12 relative">
        {/* Centered Onboarding Text */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <p className="text-lg mb-6" style={{ color: '#000' }}>
              Hello there! Welcome to the world of Pokemon!
            </p>
            <p className="text-base mb-4 leading-relaxed" style={{ color: '#000' }}>
              My name is Professor Oak. People call me the Pokemon Prof!
            </p>
            <p className="text-base mb-6 leading-relaxed opacity-90" style={{ color: '#000' }}>
              This world is inhabited by creatures called Pokemon! For some people, Pokemon are pets. Others use them for battles.
            </p>
            <p className="text-base mb-6 leading-relaxed" style={{ color: '#000' }}>
              Myself... I study Pokemon as a profession. Your very own Pokemon legend is about to unfold on the Solana blockchain!
            </p>
            <p className="text-lg font-bold" style={{
              color: '#c381b5',
            }}>
              But first, tell me... What is your name?
            </p>
          </div>
        </div>

        {/* Bottom Username Input Section */}
        <div className="w-full ">
          {error && (
            <p className="text-sm mb-4 text-center text-red-600">
              {error}
            </p>
          )}
          <p className="text-sm mb-4 text-center" style={{ color: '#000' }}>
            Choose your trainer name
          </p>
          <div className="flex gap-3 w-full ">
            <div className="flex-1">
              <Input
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="#fff"
                textColor="#000"
                borderColor="#000"
                className="w-full"
                disabled={isCreating}
              />
            </div>
            <Button
              bg="#c381b5"
              textColor="#fefcd0"
              borderColor="#000"
              shadow="#000"
              onClick={handleSubmit}
              disabled={isCreating || !username.trim()}
            >
              {isCreating ? "CREATING..." : "START"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
