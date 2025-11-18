"use client";

import { useState } from "react";
import { Card, Button, Popup } from "pixel-retroui";
import Image from "next/image";
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getProgram, getUserDataPDA, getConfigPDA } from "@/lib/anchor/setup";
import { useUserStore } from "@/lib/stores/useUserStore";

interface TopupOption {
  coins: number;
  price: number; // in SOL
}

interface TopupModalProps {
  onClose: () => void;
}

export default function TopupModal({ onClose }: TopupModalProps) {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { updateBalance } = useUserStore();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedAmount, setPurchasedAmount] = useState(0);

  const topupOptions: TopupOption[] = [
    { coins: 5, price: 0.0005 },
    { coins: 10, price: 0.001 },
    { coins: 50, price: 0.005 },
    { coins: 100, price: 0.01 },
    { coins: 500, price: 0.05 },
    { coins: 1000, price: 0.1 },
  ];

  const handlePurchase = async (option: TopupOption) => {
    if (!publicKey || !anchorWallet) {
      setError("Wallet not connected");
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      const program = getProgram(anchorWallet);
      const [userDataPDA] = await getUserDataPDA(publicKey);
      const [configPDA] = await getConfigPDA();

      // Convert SOL to lamports
      const amountInLamports = option.coins;

      // Call topup instruction
      const tx = await program.methods
        .topup(new BN(amountInLamports))
        .accounts({
          signer: publicKey,
          userData: userDataPDA,
          config: configPDA,
          // systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Topup successful! Transaction:", tx);

      // Update the balance in the store (optimistic update)
      // The actual balance will be refreshed when we reload data
      updateBalance(option.coins);

      // Optionally refresh user data from blockchain
      const updatedUserData = await program.account.userData.fetch(userDataPDA);
      updateBalance(Number(updatedUserData.balance));

      setPurchasedAmount(option.coins);
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Error during topup:", err);

      // Extract user-friendly error message from Anchor error
      let errorMessage = "Transaction failed. Please try again.";

      if (err.message) {
        // Try to extract the "Error Message:" part from Anchor errors
        const match = err.message.match(/Error Message: (.+?)\./);
        if (match && match[1]) {
          errorMessage = match[1] + ".";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Card bg="#f0f0f0" textColor="#000" borderColor="#000">
          <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "#c381b5" }}>
                BUY COINS
              </h2>
              <Button
                bg="#DC143C"
                textColor="#fff"
                borderColor="#000"
                shadow="#000"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center"
                disabled={isPurchasing}
              >
                <i className="hn hn-times text-lg"></i>
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 border-2 border-red-600 bg-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Topup Options Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {topupOptions.map((option) => (
                <button
                  key={option.coins}
                  onClick={() => handlePurchase(option)}
                  className="border-4 border-black p-4 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#fff",
                  }}
                  disabled={isPurchasing}
                >
                  <div className="flex flex-col items-center gap-3">
                    {/* Coin Icon and Amount */}
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6">
                        <Image
                          src="/sprites/pokecoin.png"
                          alt="Coins"
                          fill
                          className="pixelated object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <span className="text-xl font-bold">{option.coins}</span>
                    </div>

                    {/* SOL Price */}
                    <div
                      className="px-3 py-1 border-2 border-black w-full text-center"
                      style={{ backgroundColor: "#c381b5" }}
                    >
                      <span className="font-bold" style={{ color: "#fefcd0" }}>
                        {option.price} SOL
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer Note */}
            <p className="text-xs text-center" style={{ color: "#767676" }}>
              Payments are processed securely via Solana blockchain
            </p>
          </div>
        </Card>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <Popup
          bg="#c381b5"
          textColor="#fefcd0"
          borderColor="#000"
          isOpen={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            onClose();
          }}
        >
          <div className="flex flex-col items-center gap-4 p-4">
            <h3 className="text-xl font-bold text-center">Purchase Successful!</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg">You received</span>
              <div className="flex items-center gap-1">
                <div className="relative w-6 h-6">
                  <Image
                    src="/sprites/pokecoin.png"
                    alt="Coins"
                    fill
                    className="pixelated object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <span className="text-xl font-bold">{purchasedAmount}</span>
              </div>
              <span className="text-lg">coins!</span>
            </div>
            <Button
              bg="#fefcd0"
              textColor="#c381b5"
              borderColor="#000"
              shadow="#000"
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
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
