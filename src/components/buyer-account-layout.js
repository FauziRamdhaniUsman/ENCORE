
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menus = [
  { label: "Tiket Event", href: "/buyer/tickets", icon: "▣" },
  { label: "Transaksi", href: "/buyer/orders", icon: "▤" },
  { label: "Profil", href: "/buyer/profile", icon: "♙" },
];

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
    return <div className="account-loading">Memuat akun ENCORE...</div>;
  }

  const initial = (user.name || "B").charAt(0).toUpperCase();

  return (
    <main className="buyer-account-page">
      <div className="buyer-account-container">
        <aside className="buyer-account-sidebar">
          <section className="buyer-user-card">
            <div className="buyer-user-avatar">{initial}</div>
            <h2>{user.name || "Buyer ENCORE"}</h2>
            <p>{user.email}</p>

            <Link
              href="/buyer/profile"
              className="buyer-edit-profile-button"
            >
              ✎ Edit Profil
            </Link>

            <button
              className="buyer-logout-button"
              onClick={handleLogout}
            >
              ↪ Keluar
            </button>
          </section>

          <section className="buyer-account-summary">
            <h3>Ringkasan Akun</h3>

            <div className="buyer-summary-card">
              <span>Total Pesanan</span>
              <strong>{orders.length}</strong>
            </div>

            <div className="buyer-summary-card">
              <span>Transaksi Berhasil</span>
              <strong>
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

        <section className="buyer-account-content">
          <nav className="buyer-account-tabs">
            {menus.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={
                  pathname === item.href
                    ? "buyer-account-tab active"
                    : "buyer-account-tab"
                }
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>

          <div className="buyer-account-panel">{children}</div>
        </section>
      </div>
    </main>
  );
}
