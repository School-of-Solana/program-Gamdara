"use client";

import { useState } from "react";
import { Card } from "pixel-retroui";
import Pokedex from "./components/Pokedex";
import OwnedPokemon from "./components/OwnedPokemon";
import Gacha from "./components/Gacha";
import CoinsDisplay from "./components/CoinsDisplay";
import HomeAnimatedCard from "./components/HomeAnimatedCard";
import HomePokedexCard from "./components/HomePokedexCard";
import HomeGachaCard from "./components/HomeGachaCard";
import { useRequireAccount } from "@/lib/hooks/useWalletAuth";
import { useLoadUserData } from "@/lib/hooks/useLoadUserData";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");

  // Route protection - will redirect if not connected or if account doesn't exist
  const { checking } = useRequireAccount();

  // Load user data from blockchain
  useLoadUserData();

  const navItems = [
    { id: "home", label: "HOME", icon: "hn-home" },
    { id: "owned", label: "OWNED", icon: "hn-folder" },
    { id: "pokedex", label: "POKEDEX", icon: "hn-book-heart" },
    { id: "gacha", label: "GACHA", icon: "hn-sparkles" },
  ];

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
      <main className="flex min-h-screen max-h-screen flex-col relative">
        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          {/* Coins Display - Top Right */}
          <CoinsDisplay />
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#c381b5' }}>
            {activeTab === "home" && "Home"}
            {activeTab === "owned" && "Owned Pokemon"}
            {activeTab === "pokedex" && "Pokedex"}
            {activeTab === "gacha" && "Gacha"}
          </h1>

          {/* Tab Content */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-6">
              {/* Animated Pokemon Card - Full Width */}
              <HomeAnimatedCard onNavigate={() => setActiveTab("owned")} />

              {/* Navigation Cards - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HomePokedexCard onNavigate={() => setActiveTab("pokedex")} />
                <HomeGachaCard onNavigate={() => setActiveTab("gacha")} />
              </div>
            </div>
          )}
          {activeTab === "owned" && <OwnedPokemon />}
          {activeTab === "pokedex" && <Pokedex />}
          {activeTab === "gacha" && <Gacha />}
        </div>

        {/* Bottom Navigation Bar */}
        <nav
          className="border-t-4 grid grid-cols-4 flex-shrink-0"
          style={{
            borderColor: '#000',
            backgroundColor: '#f0f0f0',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-4 px-2 border-r-4 last:border-r-0 transition-colors"
              style={{
                borderColor: '#000',
                backgroundColor: activeTab === item.id ? 'transparent' : '#f0f0f0',
              }}
            >
              {activeTab === item.id ? (
                <Card
                  bg="#c381b5"
                  textColor="#fefcd0"
                  borderColor="#000"
                  shadowColor="#c381b5"
                  className="w-full"
                >
                  <div className="flex flex-col items-center gap-1">
                    <i className={`hn ${item.icon} text-2xl`}></i>
                    <span className="text-xs font-bold">{item.label}</span>
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col items-center gap-1" style={{ color: '#000' }}>
                  <i className={`hn ${item.icon} text-2xl`}></i>
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
