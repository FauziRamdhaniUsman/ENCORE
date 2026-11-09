
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteShell from "../components/siteshell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
