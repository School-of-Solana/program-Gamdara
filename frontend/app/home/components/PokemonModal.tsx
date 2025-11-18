import { Card, Button, Input } from "pixel-retroui";
import Image from "next/image";
import { useState } from "react";
import { Pokemon } from "@/lib/types";
import { getAnimatedSpritePath } from "@/lib/utils";

interface PokemonModalProps {
  pokemon: Pokemon & { isShiny?: boolean; worth?: number };
  onClose: () => void;
  showActions?: boolean;
  onRename?: (pokemon: Pokemon, newName: string) => void;
  onRelease?: (pokemon: Pokemon) => void;
}

export default function PokemonModal({
  pokemon,
  onClose,
  showActions = false,
  onRename,
  onRelease
}: PokemonModalProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);
  const rarityColors: Record<string, string> = {
    R: "#808080",
    SR: "#4169E1",
    SSR: "#FFD700",
    UR: "#FF1493",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Card bg="#f0f0f0" textColor="#000" borderColor="#000">
          <div className="flex flex-col items-center gap-4 p-4 relative">
            {/* Close Button - Top Right */}
            <Button
              bg="#DC143C"
              shadow="#DC143C"
              color="#fff"
              textColor="#fff"
              onClick={onClose}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center border-2"
            >
              <i className="hn hn-times text-lg"></i>
            </Button>

            {/* Pokemon Sprite */}
            <div className="relative w-32 h-32">
              <Image
                src={getAnimatedSpritePath(pokemon.name, pokemon.isShiny ? 'shiny' : 'normal')}
                alt={pokemon.name}
                fill
                className="pixelated"
                style={{ imageRendering: "pixelated" }}
                unoptimized
              />
            </div>

            {/* Pokemon Name and ID */}
            <div className="text-center">
              <div className="flex gap-2 justify-center">
                <h2 className="text-2xl font-bold">
                  #{pokemon.id.toString().padStart(3, "0")} {pokemon.name}
                </h2>
                <div
                  className="inline-block flex items-center px-3 py-1 mt-2 font-bold text-sm border-2"
                  style={{
                    backgroundColor: rarityColors[pokemon.rarity],
                    color: "#fff",
                    borderColor: "#000",
                  }}
                >
                  {pokemon.rarity}
                </div>
              </div>
              {/* Shiny Label */}
              {pokemon.isShiny && (
                <p
                  className="text-sm font-bold mt-1"
                  style={{ color: "#FFD700" }}
                >
                  ✨ SHINY
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-center text-sm">{pokemon.description}</p>

            {/* Types */}
            <div className="w-full">
              <p className="font-bold mb-2">Type:</p>
              <div className="flex gap-2 flex-wrap">
                {pokemon.type.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 text-sm font-bold border-2"
                    style={{
                      backgroundColor: "#c381b5",
                      color: "#fefcd0",
                      borderColor: "#000",
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="w-full">
              <p className="font-bold mb-2">Weakness:</p>
              <div className="flex gap-2 flex-wrap">
                {pokemon.weakness.map((weak) => (
                  <span
                    key={weak}
                    className="px-3 py-1 text-sm font-bold border-2"
                    style={{
                      backgroundColor: "#fff",
                      color: "#000",
                      borderColor: "#000",
                    }}
                  >
                    {weak}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons (for owned Pokemon) */}
            {showActions && !isRenaming && (
              <div className="flex gap-6 w-full pt-6">
                <div className="flex-1">
                  <Button
                    bg="#4169E1"
                    className="w-full"
                    textColor="#fff"
                    borderColor="#000"
                    shadow="#000"
                    onClick={() => setIsRenaming(true)}
                  >
                    RENAME
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    className="w-full"
                    bg="#DC143C"
                    textColor="#fff"
                    borderColor="#000"
                    shadow="#000"
                    onClick={() => setShowReleaseConfirm(true)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>RELEASE</span>
                      {pokemon.worth !== undefined && (
                        <div className="flex items-center gap-1">
                          <span>(</span>
                          <div className="relative w-4 h-4">
                            <Image
                              src="/sprites/pokecoin.png"
                              alt="Coins"
                              fill
                              className="pixelated object-contain"
                              style={{ imageRendering: "pixelated" }}
                            />
                          </div>
                          <span>{pokemon.worth})</span>
                        </div>
                      )}
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* Rename Input */}
            {showActions && isRenaming && (
              <div className="w-full flex flex-col gap-2">
                <Input
                  placeholder="Enter new nickname..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  bg="#fff"
                  textColor="#000"
                  borderColor="#000"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Button
                      bg="#4169E1"
                      textColor="#fff"
                      borderColor="#000"
                      shadow="#000"
                      onClick={() => {
                        if (newName.trim()) {
                          onRename?.(pokemon, newName.trim());
                          setIsRenaming(false);
                          setNewName("");
                          onClose();
                        }
                      }}
                    >
                      CONFIRM
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button
                      bg="#808080"
                      textColor="#fff"
                      borderColor="#000"
                      shadow="#000"
                      onClick={() => {
                        setIsRenaming(false);
                        setNewName("");
                      }}
                    >
                      CANCEL
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </Card>
      </div>

      {/* Release Confirmation Modal */}
      {showReleaseConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
          onClick={() => setShowReleaseConfirm(false)}
        >
          <div
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Card bg="#f0f0f0" textColor="#000" borderColor="#000">
              <div className="flex flex-col items-center gap-6 p-6">
                {/* Title */}
                <h2 className="text-2xl font-bold text-center">
                  Release Pokemon?
                </h2>

                {/* Message */}
                <div className="text-center space-y-2">
                  <p className="text-lg">
                    Are you sure you want to release
                  </p>
                  <p className="text-xl font-bold" style={{ color: "#c381b5" }}>
                    {pokemon.name}?
                  </p>
                  {pokemon.worth !== undefined && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">You will receive</span>
                      <div className="flex items-center gap-1">
                        <div className="relative w-5 h-5">
                          <Image
                            src="/sprites/pokecoin.png"
                            alt="Coins"
                            fill
                            className="pixelated object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <span className="text-lg font-bold">{pokemon.worth}</span>
                      </div>
                      <span className="text-lg">coins</span>
                    </div>
                  )}
                  <p className="text-sm" style={{ color: "#DC143C" }}>
                    This action cannot be undone!
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 w-full">
                  <div className="flex-1">
                    <Button
                      bg="#808080"
                      textColor="#fff"
                      borderColor="#000"
                      shadow="#000"
                      onClick={() => setShowReleaseConfirm(false)}
                      className="w-full"
                    >
                      CANCEL
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button
                      bg="#DC143C"
                      textColor="#fff"
                      borderColor="#000"
                      shadow="#000"
                      onClick={() => {
                        onRelease?.(pokemon);
                        setShowReleaseConfirm(false);
                        onClose();
                      }}
                      className="w-full"
                    >
                      RELEASE
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
