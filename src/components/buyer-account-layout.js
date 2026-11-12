"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
 
const menus = [
  { label: "Tiket Event", href: "/buyer/tickets", icon: "▣" },
  { label: "Transaksi", href: "/buyer/orders", icon: "▤" },
  { label: "Profil", href: "/buyer/profile", icon: "♙" },
];
 
/* ---------- kelas Tailwind yang dipakai berulang ---------- */
const card = "box-border rounded-[18px] border border-[#30223f] bg-[#151020]";
 
const actionBtn =
  "mt-[9px] flex min-h-[43px] w-full cursor-pointer items-center justify-center rounded-[10px] border-0 text-sm font-semibold";
 
const tabBase =
  "inline-flex items-center gap-[9px] rounded-[30px] border px-[17px] py-3 text-[13px] max-[600px]:shrink-0";
const tabIdle =
  "border-[#392b4b] bg-[#171020] text-[#c9bdd8] hover:border-[#9b63f5] hover:bg-[#7040c5] hover:text-white";
const tabActive = "border-[#9b63f5] bg-[#7040c5] text-white";
 
const summaryCard = "mt-3 flex flex-col gap-2.5 rounded-[13px] bg-[#20172e] p-[17px]";
 
export default function BuyerAccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
 
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
 
  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );
 
      if (!savedUser || savedUser.role !== "buyer") {
        router.replace("/login");
        return;
      }
 
      setUser(savedUser);
 
      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );
 
      setOrders(
        savedOrders.filter(
          (order) =>
            order.userId === savedUser.id ||
            order.buyerEmail === savedUser.email
        )
      );
    } catch {
      router.replace("/login");
    }
  }, [router]);
 
  const handleLogout = () => {
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
 
  return (
    <main className="box-border min-h-screen bg-[#090611] px-[5%] py-[55px] text-white max-[600px]:px-[15px] max-[600px]:py-[25px]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[300px_minmax(0,1fr)] gap-7 max-[900px]:grid-cols-1">
        {/* SIDEBAR */}
        <aside className="flex flex-col gap-[22px]">
          <section className={`${card} px-5 py-7 text-center`}>
            <div className="mx-auto mb-[17px] grid size-[78px] place-items-center rounded-full bg-[linear-gradient(135deg,#a66aff,#6334a0)] text-[30px] font-extrabold text-white">
              {initial}
            </div>
 
            <h2 className="mb-[7px] font-heading text-[19px]">
              {user.name || "Buyer ENCORE"}
            </h2>
            <p className="mb-5 text-[13px] text-[#b5a9c5] [overflow-wrap:anywhere]">
              {user.email}
            </p>
 
            <Link
              href="/buyer/profile"
              className={`${actionBtn} bg-[#302044] text-[#d5b5ff]`}
            >
              ✎ Edit Profil
            </Link>
 
            <button
              type="button"
              onClick={handleLogout}
              className={`${actionBtn} bg-[#3b1c2a] text-[#ff9caf]`}
            >
              ↪ Keluar
            </button>
          </section>
 
          <section className={`${card} p-[22px]`}>
            <h3 className="mb-[17px] font-heading text-[17px]">
              Ringkasan Akun
            </h3>
 
            <div className={summaryCard}>
              <span className="text-[13px] text-[#b9abc9]">Total Pesanan</span>
              <strong className="text-[23px]">{orders.length}</strong>
            </div>
 
            <div className={summaryCard}>
              <span className="text-[13px] text-[#b9abc9]">
                Transaksi Berhasil
              </span>
              <strong className="text-[23px]">
                {
                  orders.filter((order) =>
                    ["paid", "success", "settlement"].includes(
                      String(
                        order.status || order.paymentStatus || ""
                      ).toLowerCase()
                    )
                  ).length
                }
              </strong>
            </div>
          </section>
        </aside>
 
        {/* KONTEN */}
        <section className="min-w-0">
          <nav className="mb-[22px] flex flex-wrap gap-[9px] max-[600px]:flex-nowrap max-[600px]:overflow-x-auto">
            {menus.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`${tabBase} ${
                  pathname === item.href ? tabActive : tabIdle
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
 
          <div
            className={`${card} min-h-[520px] p-8 max-[600px]:px-4 max-[600px]:py-[22px]`}
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
