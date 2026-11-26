"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const menus = [
  { label: "Tiket Event", href: "/buyer/tickets", icon: "▣" },
  { label: "Transaksi", href: "/buyer/orders", icon: "▤" },
  { label: "Profil", href: "/buyer/profile", icon: "♙" },
];

const card =
  "box-border rounded-[20px] border border-[#30223f] bg-[#151020]";

const actionBtn =
  "mt-2 flex min-h-[43px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 text-sm font-semibold transition";

const tabBase =
  "inline-flex shrink-0 items-center gap-[9px] rounded-full border px-[17px] py-3 text-[13px] transition";

const tabIdle =
  "border-[#392b4b] bg-[#171020] text-[#c9bdd8] hover:border-[#9b63f5] hover:bg-[#352044]";

const tabActive =
  "border-[#9b63f5] bg-[#7040c5] text-white";

const summaryCard =
  "mt-3 flex flex-col gap-2.5 rounded-[15px] bg-[#20172e] p-[17px]";

export default function BuyerAccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const loadAccount = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile || profile.role !== "buyer") {
        router.replace("/login");
        return;
      }

      setUser({
        ...profile,
        name: profile.full_name || profile.name || "Buyer ENCORE",
        email: profile.email || authUser.email,
        avatar: profile.avatar_url || profile.avatar || "",
      });

      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("id, payment_status")
        .eq("buyer_id", authUser.id);

      if (!error && ordersData) {
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Gagal memuat akun:", error);
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    loadAccount();

    window.addEventListener("encore-profile-updated", loadAccount);

    return () => {
      window.removeEventListener("encore-profile-updated", loadAccount);
    };
  }, [loadAccount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("encoreCurrentUser");
    localStorage.removeItem("encoreRememberEmail");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#090611] text-white">
        Memuat akun ENCORE...
      </div>
    );
  }

  const initial = (user.name || "B").charAt(0).toUpperCase();

  const successfulOrders = orders.filter((order) =>
    ["paid", "success", "settlement"].includes(
      String(order.payment_status || "").toLowerCase()
    )
  ).length;

  return (
    <main className="box-border min-h-screen bg-[#090611] px-[5%] py-[65px] text-white max-[600px]:px-[15px] max-[600px]:py-[25px]">
      <div className="mx-auto grid max-w-[1450px] grid-cols-[348px_minmax(0,1fr)] items-start gap-7 max-[950px]:grid-cols-1">
        {/* SIDEBAR PROFIL */}
        <aside className="flex flex-col gap-[22px]">
          <section className={`${card} px-5 py-[30px] text-center`}>
            <div className="mx-auto mb-4 grid size-[78px] place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#a66aff,#6334a0)] text-[28px] font-extrabold text-white">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Foto profil"
                  className="size-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <h2 className="mb-1 text-[21px] font-bold text-white [overflow-wrap:anywhere]">
              {user.name || "Buyer ENCORE"}
            </h2>

            <p className="mb-6 text-[13px] text-[#b5a9c5] [overflow-wrap:anywhere]">
              {user.email}
            </p>

            <Link
              href="/buyer/profile"
              className={`${actionBtn} bg-[#302044] text-[#d5b5ff] hover:bg-[#422b5b]`}
            >
              ✎ Edit Profil
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`${actionBtn} bg-[#3b1c2a] text-[#ff9caf] hover:bg-[#512536]`}
            >
              ↪ Keluar
            </button>
          </section>

          {/* RINGKASAN AKUN */}
          <section className={`${card} p-[22px]`}>
            <h3 className="mb-[17px] text-[17px] font-bold">
              Ringkasan Akun
            </h3>

            <div className={summaryCard}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#b9abc9]">
                  Total Pesanan
                </span>
                <span className="text-[#a98aff]">▦</span>
              </div>

              <strong className="text-[23px] text-white">
                {orders.length}
              </strong>
            </div>

            <div className={summaryCard}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#b9abc9]">
                  Transaksi Berhasil
                </span>
                <span className="text-[#a98aff]">▣</span>
              </div>

              <strong className="text-[23px] text-white">
                {successfulOrders}
              </strong>
            </div>
          </section>
        </aside>

        {/* KONTEN UTAMA */}
        <section className="min-w-0">
          {/* NAVIGASI TAB */}
          <nav className="mb-[22px] flex flex-wrap gap-[9px] max-[600px]:flex-nowrap max-[600px]:overflow-x-auto">
            {menus.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`${tabBase} ${
                  pathname === item.href ? tabActive : tabIdle
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* KARTU KONTEN */}
          <div className={`${card} min-h-[520px] p-[30px] max-[600px]:px-4 max-[600px]:py-[22px]`}>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}