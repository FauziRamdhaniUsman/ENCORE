"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menus = [
  { name: "Home", href: "/" },
  { name: "Concerts", href: "/concerts" },
  { name: "Experience", href: "/experience" },
  { name: "News", href: "/news" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const buyerMenus = [
  { icon: "♙", label: "Profil Saya", href: "/buyer/profile" },
  { icon: "▣", label: "Tiket Saya", href: "/buyer/tickets" },
  { icon: "▤", label: "Transaksi", href: "/buyer/orders" },
];

/* ---------- kelas Tailwind yang dipakai berulang ---------- */
const btnBase =
  "inline-flex cursor-pointer items-center justify-center rounded-[9px] border border-border px-5 py-2.5 whitespace-nowrap text-white transition duration-200 max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-[13px]";
const loginBtn = `${btnBase} bg-transparent hover:border-primary hover:text-primary-light`;
const registerBtn = `${btnBase} border-primary bg-primary hover:bg-[#7c3aed] hover:text-white`;

const avatarBase =
  "grid shrink-0 size-[42px] place-items-center rounded-full bg-[linear-gradient(135deg,#9b5cf6,#6739a0)] font-extrabold text-white";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );
      setCurrentUser(savedUser);
    } catch {
      setCurrentUser(null);
    }

    setReady(true);
  }, [pathname]);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const getDashboard = () => {
    if (currentUser?.role === "admin") return "/admin/dashboard";
    if (currentUser?.role === "organizer") return "/organizer/dashboard";
    return "/buyer/dashboard";
  };

  const handleLogout = () => {
    localStorage.removeItem("encoreCurrentUser");
    localStorage.removeItem("encoreRememberEmail");

    setCurrentUser(null);
    setMenuOpen(false);

    router.push("/login");
    router.refresh();
  };

  const isBuyer = currentUser?.role === "buyer";
  const avatarLetter = (currentUser?.name || "B").charAt(0).toUpperCase();

  return (
    <nav className="relative z-20 flex min-h-[82px] items-center justify-between gap-[25px] border-b border-[#ffffff12] bg-background px-[7%] text-text max-[1100px]:flex-wrap max-[1100px]:py-[18px] max-[700px]:gap-[15px] max-[700px]:px-[5%] max-[700px]:py-5">
      {/* LOGO */}
      <Link
        href="/"
        className="font-heading text-[27px] font-extrabold tracking-[-1px] whitespace-nowrap text-[#f8fafc] max-[700px]:text-[24px]"
      >
        EN<span className="text-primary-light">CORE</span>
      </Link>

      {/* MENU */}
      <div className="flex items-center gap-[30px] text-sm text-[#c4bfd3] max-[1100px]:order-3 max-[1100px]:w-full max-[1100px]:flex-wrap max-[1100px]:justify-center max-[1100px]:gap-5 max-[700px]:flex-nowrap max-[700px]:justify-start max-[700px]:overflow-x-auto max-[700px]:pb-1.5 max-[700px]:text-[13px]">
        {menus.map((menu) => {
          const active = isActive(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap transition-colors duration-200 hover:text-primary-light ${
                active ? "font-bold text-primary-light" : ""
              }`}
            >
              {menu.name}
            </Link>
          );
        })}
      </div>

      {/* AKSI */}
      <div className="flex items-center gap-3 max-[700px]:gap-[7px]">
        {!ready ? null : !currentUser ? (
          <>
            <Link href="/login" className={loginBtn}>
              Masuk
            </Link>
            <Link href="/register" className={registerBtn}>
              Daftar
            </Link>
          </>
        ) : isBuyer ? (
          <div className="relative z-[120]">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2.5 rounded-[30px] border border-[#40304f] bg-[#1b1228] px-3 py-[7px] text-white"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label="Menu akun"
            >
              <span className={avatarBase}>{avatarLetter}</span>

              <span className="max-w-[110px] truncate max-[650px]:hidden">
                {currentUser.name || "Buyer"}
              </span>

              <span
                className={`transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              >
                ⌄
              </span>
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Tutup menu"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-[90] size-full cursor-default border-0 bg-transparent"
                />

                <div className="absolute top-[calc(100%+13px)] right-0 z-[100] w-[340px] rounded-2xl border border-[#49335e] bg-[#191126] p-[15px] text-white shadow-[0_15px_45px_rgba(0,0,0,0.5)] max-[650px]:w-[min(340px,calc(100vw-25px))]">
                  {/* PROFIL */}
                  <div className="flex items-center gap-[13px] px-[7px] pt-3 pb-[17px]">
                    <div className={avatarBase}>{avatarLetter}</div>

                    <div className="flex min-w-0 flex-col gap-[5px]">
                      <strong className="text-base font-bold text-white">
                        {currentUser.name || "Buyer"}
                      </strong>
                      <span className="text-xs [overflow-wrap:anywhere] text-[#b8a9ca]">
                        {currentUser.email}
                      </span>
                      <small className="text-xs text-[#bd91ff]">
                        ENCORE Member
                      </small>
                    </div>
                  </div>

                  <div className="my-2 h-px w-full bg-[#3a2b49]" />

                  {/* MENU */}
                  <div className="flex w-full flex-col items-stretch gap-[3px]">
                    {buyerMenus.map((item) => (
                      <Link
                        href={item.href}
                        key={item.label}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-[43px] w-full items-center justify-start gap-3 rounded-lg px-[9px] py-2.5 text-sm leading-[1.4] whitespace-nowrap text-[#eee5fa] hover:bg-[#332044] hover:text-[#c69bff]"
                      >
                        <span className="grid w-[22px] shrink-0 place-items-center text-[17px]">
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className="ml-auto shrink-0 text-xl text-[#a98acb]">
                          ›
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="my-2 h-px w-full bg-[#3a2b49]" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2.5 py-3 text-left text-sm text-[#ff9cae] hover:bg-[#40202e]"
                  >
                    <span>↪</span>
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <Link href={getDashboard()} className={loginBtn}>
              Dashboard
            </Link>

            <button type="button" onClick={handleLogout} className={registerBtn}>
              Keluar
            </button>
          </>
        )}
      </div>
    </nav>
  );
}