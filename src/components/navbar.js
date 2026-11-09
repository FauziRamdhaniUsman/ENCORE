
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "Home", href: "/" },
  { name: "Concerts", href: "/concerts" },
  { name: "Experience", href: "/experience" },
  { name: "News", href: "/news" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(href + "/")
    );
  };

  return (
    <nav className="navbar">
      {/* LOGO ENCORE */}
      <Link href="/" className="logo">
        EN<span>CORE</span>
      </Link>

      {/* MENU NAVIGASI */}
      <div className="nav-links">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={isActive(menu.href) ? "nav-active" : ""}
            aria-current={
              isActive(menu.href) ? "page" : undefined
            }
          >
            {menu.name}
          </Link>
        ))}
      </div>

      {/* LOGIN DAN REGISTER */}
      <div className="nav-actions">
        <Link href="/login" className="login-btn">
          Masuk
        </Link>

        <Link href="/register" className="register-btn">
          Daftar
        </Link>
      </div>
    </nav>
  );
}
