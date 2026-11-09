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
    <div className="encore-site-shell">
      <Navbar />

      {children}

      <Footer />
    </div>
  );
}

function SiteShellFallback({ children }) {
  return (
    <div className="encore-shell-fallback">
      {children}
    </div>
  );
}

export default function SiteShell({ children }) {
  return (
    <Suspense
      fallback={
        <SiteShellFallback>
          {children}
        </SiteShellFallback>
      }
    >
      <SiteShellContent>
        {children}
      </SiteShellContent>
    </Suspense>
  );
}