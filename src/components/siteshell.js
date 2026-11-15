"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import Navbar from "./navbar";
import Footer from "./footer";

function SiteShellContent({ children }) {
  const pathname = usePathname();

  // Halaman Login dan Register tanpa Navbar dan Footer
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/register/");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col [&>main]:flex-1 [&_main_footer.footer]:hidden">
      <Navbar />

      {children}

      <Footer />
    </div>
  );
}

function SiteShellFallback({ children }) {
  return (
    <div className="min-h-screen bg-background text-text">{children}</div>
  );
}

export default function SiteShell({ children }) {
  return (
    <Suspense
      fallback={<SiteShellFallback>{children}</SiteShellFallback>}
    >
      <SiteShellContent>{children}</SiteShellContent>
    </Suspense>
  );
}