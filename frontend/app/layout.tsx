import type { Metadata } from "next";
import "./globals.css";
import "pixel-retroui/dist/index.css";
import "pixel-retroui/dist/fonts.css";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import { WalletProvider } from "@/providers/WalletProvider";

export const metadata: Metadata = {
  title: "GachaDex - Pokemon Gacha Game",
  description: "Catch, collect, and trade pixelated Pokemon on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-minecraft">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
