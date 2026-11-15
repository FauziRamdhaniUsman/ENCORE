import { Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import SiteShell from "../components/siteshell";
import Script from "next/script";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "ENCORE | Every Concert Starts with ENCORE",
  description:
    "Temukan konser dan festival musik favoritmu bersama ENCORE. Jelajahi pengalaman musik terbaik dan pesan tiket dengan mudah.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${geistMono.variable}`}
    >
      <body className={outfit.className}>
        <SiteShell>{children}</SiteShell>

        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}