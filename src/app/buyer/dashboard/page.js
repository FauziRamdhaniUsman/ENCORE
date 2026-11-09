
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const recommendations = [
  {
    id: 1,
    title: "Music Festival 2026",
    artist: "Special Guest & Friends",
    date: "20 Desember 2026",
    location: "Jakarta",
    price: "Rp150.000",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
  },
  {
    id: 2,
    title: "Sound of Indonesia",
    artist: "Indonesian Music Festival",
    date: "10 Januari 2027",
    location: "Yogyakarta",
    price: "Rp100.000",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
  },
  {
    id: 3,
    title: "Acoustic Night",
    artist: "An Intimate Music Show",
    date: "15 Januari 2027",
    location: "Bandung",
    price: "Rp125.000",
    image:
      "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800",
  },
];

export default function BuyerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("encoreCurrentUser");

      if (!savedUser) {
        router.replace("/login");
        return;
      }

      const currentUser = JSON.parse(savedUser);

      if (currentUser.role !== "buyer") {
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      const userOrders = savedOrders.filter(
        (order) =>
          order.status === "paid" &&
          (String(order.userId) === String(currentUser.id) ||
            order.buyerEmail === currentUser.email)
      );

      setOrders(userOrders);
    } catch (error) {
      console.error("Gagal memuat dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("encoreCurrentUser");
    router.push("/login");
  }

  const totalTickets = orders.reduce(
    (total, order) => total + Number(order.quantity || 0),
    0
  );

  const checkedInTickets = orders.reduce(
    (total, order) =>
      total +
      (order.checkInStatus === "checked_in"
        ? Number(order.quantity || 0)
        : 0),
    0
  );

  const activeTickets = totalTickets - checkedInTickets;

  if (loading) {
    return (
      <>
        <div className="buyer-loading">
          Memuat dashboard ENCORE...
        </div>

        <style>{`
          .buyer-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #100b1c;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 16px;
          }
        `}</style>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="buyer-dashboard">
      <aside className="buyer-sidebar">
        <div className="buyer-logo">
          <span>EN</span>CORE
        </div>

        <p className="buyer-menu-label">MENU UTAMA</p>

        <nav className="buyer-nav">
          <Link href="/buyer/dashboard" className="buyer-nav-link active">
            <span>⌂</span> Dashboard
          </Link>

          <Link href="/buyer/tickets" className="buyer-nav-link">
            <span>▣</span> Tiket Saya
          </Link>

          <Link href="/concerts" className="buyer-nav-link">
            <span>♫</span> Jelajahi Konser
          </Link>
        </nav>

        <button className="buyer-logout" onClick={handleLogout}>
          ↪ Keluar
        </button>
      </aside>

      <main className="buyer-main">
        <header className="buyer-topbar">
          <div>
            <p className="buyer-breadcrumb">ENCORE / DASHBOARD</p>
            <h1>Dashboard</h1>
          </div>

          <div className="buyer-profile">
            <div className="buyer-avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>Buyer</span>
            </div>
          </div>
        </header>

        <section className="buyer-welcome">
          <div>
            <p className="buyer-eyebrow">WELCOME TO ENCORE</p>

            <h2>Halo, {user.name}! 👋</h2>

            <p className="buyer-welcome-description">
              Siap menikmati pengalaman musik yang tidak terlupakan?
              Temukan konser favoritmu di sini.
            </p>

            <Link href="/concerts" className="buyer-primary-button">
              Jelajahi Konser <span>→</span>
            </Link>
          </div>

          <div className="buyer-welcome-decoration">♫</div>
        </section>

        <section className="buyer-stats">
          <div className="buyer-stat-card">
            <div className="buyer-stat-icon purple">▣</div>

            <div>
              <p>Total Tiket</p>
              <h3>{totalTickets}</h3>
            </div>
          </div>

          <div className="buyer-stat-card">
            <div className="buyer-stat-icon pink">◷</div>

            <div>
              <p>Tiket Aktif</p>
              <h3>{activeTickets}</h3>
            </div>
          </div>

          <div className="buyer-stat-card">
            <div className="buyer-stat-icon blue">✓</div>

            <div>
              <p>Sudah Check-in</p>
              <h3>{checkedInTickets}</h3>
            </div>
          </div>
        </section>

        <section className="buyer-recommendations">
          <div className="buyer-section-heading">
            <div>
              <p className="buyer-eyebrow">
                DISCOVER YOUR NEXT EXPERIENCE
              </p>

              <h2>Rekomendasi Konser</h2>
            </div>

            <Link href="/concerts" className="buyer-see-all">
              Lihat Semua →
            </Link>
          </div>

          <div className="buyer-event-grid">
            {recommendations.map((event) => (
              <article className="buyer-event-card" key={event.id}>
                <img src={event.image} alt={event.title} />

                <div className="buyer-event-info">
                  <h3>{event.title}</h3>

                  <p className="buyer-event-artist">
                    {event.artist}
                  </p>

                  <div className="buyer-event-detail">
                    <span>▣ {event.date}</span>
                    <span>⌖ {event.location}</span>
                  </div>

                  <div className="buyer-event-bottom">
                    <strong>{event.price}</strong>
                    <Link href="/concerts">Detail →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="buyer-footer">
          © 2026 ENCORE. All rights reserved.
        </footer>
      </main>

      <style>{`
        .buyer-dashboard {
          min-height: 100vh;
          display: flex;
          background: #100b1c;
          color: #f7f3ff;
          font-family: Arial, sans-serif;
        }

        .buyer-dashboard *,
        .buyer-dashboard *::before,
        .buyer-dashboard *::after {
          box-sizing: border-box;
        }

        .buyer-sidebar {
          width: 245px;
          flex-shrink: 0;
          min-height: 100vh;
          padding: 30px 20px;
          background: #171025;
          border-right: 1px solid #302340;
          display: flex;
          flex-direction: column;
        }

        .buyer-logo {
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 5px 0 55px;
        }

        .buyer-logo span {
          color: #b77aff;
        }

        .buyer-menu-label,
        .buyer-breadcrumb,
        .buyer-eyebrow {
          color: #9e8eae;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.7px;
        }

        .buyer-menu-label {
          margin: 0 0 15px 10px;
        }

        .buyer-nav {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .buyer-nav-link {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 13px;
          border-radius: 9px;
          color: #b8acc7;
          text-decoration: none;
          font-size: 14px;
          transition: 0.2s;
        }

        .buyer-nav-link span {
          font-size: 19px;
        }

        .buyer-nav-link:hover,
        .buyer-nav-link.active {
          color: white;
          background: #38234f;
        }

        .buyer-nav-link.active {
          border-left: 3px solid #b77aff;
        }

        .buyer-logout {
          margin-top: auto;
          padding: 13px;
          border: 1px solid #49334e;
          border-radius: 9px;
          color: #e9b2c8;
          background: transparent;
          text-align: left;
          font-size: 14px;
          cursor: pointer;
        }

        .buyer-main {
          flex: 1;
          min-width: 0;
          padding: 35px 42px;
        }

        .buyer-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .buyer-topbar h1 {
          margin-top: 7px;
          font-size: 27px;
          color: white;
        }

        .buyer-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .buyer-avatar {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #6739a0;
          color: white;
          font-size: 18px;
          font-weight: bold;
        }

        .buyer-profile strong,
        .buyer-profile span {
          display: block;
          font-size: 13px;
        }

        .buyer-profile span {
          margin-top: 4px;
          color: #a99ab7;
        }

        .buyer-welcome {
          min-height: 205px;
          padding: 30px 35px;
          border: 1px solid #563878;
          border-radius: 15px;
          background: linear-gradient(110deg, #392052, #211431 75%);
          display: flex;
          justify-content: space-between;
          align-items: center;
          overflow: hidden;
        }

        .buyer-welcome h2 {
          margin: 12px 0;
          font-size: 27px;
        }

        .buyer-welcome-description {
          max-width: 510px;
          color: #c6b7d4;
          font-size: 14px;
          line-height: 1.7;
        }

        .buyer-primary-button {
          display: inline-flex;
          gap: 15px;
          align-items: center;
          margin-top: 20px;
          padding: 12px 18px;
          border-radius: 8px;
          background: #a66be8;
          color: white;
          text-decoration: none;
          font-size: 13px;
          font-weight: bold;
        }

        .buyer-welcome-decoration {
          padding: 0 25px;
          color: #a66be8;
          font-size: 120px;
          opacity: 0.5;
        }

        .buyer-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin: 25px 0 40px;
        }

        .buyer-stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 21px;
          border: 1px solid #302340;
          border-radius: 12px;
          background: #1a1226;
        }

        .buyer-stat-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          font-size: 21px;
        }

        .buyer-stat-icon.purple {
          background: #382452;
          color: #c99aff;
        }

        .buyer-stat-icon.pink {
          background: #48233f;
          color: #ff9dcc;
        }

        .buyer-stat-icon.blue {
          background: #20364a;
          color: #8dcfff;
        }

        .buyer-stat-card p {
          color: #a99ab7;
          font-size: 12px;
        }

        .buyer-stat-card h3 {
          margin-top: 7px;
          font-size: 25px;
        }

        .buyer-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 15px;
          margin-bottom: 20px;
        }

        .buyer-section-heading h2 {
          margin-top: 8px;
          font-size: 22px;
        }

        .buyer-see-all {
          color: #c394ff;
          font-size: 13px;
          text-decoration: none;
        }

        .buyer-event-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .buyer-event-card {
          overflow: hidden;
          border: 1px solid #302340;
          border-radius: 12px;
          background: #1a1226;
        }

        .buyer-event-card img {
          display: block;
          width: 100%;
          height: 165px;
          object-fit: cover;
        }

        .buyer-event-info {
          padding: 17px;
        }

        .buyer-event-info h3 {
          font-size: 16px;
        }

        .buyer-event-artist {
          margin-top: 6px;
          color: #a99ab7;
          font-size: 12px;
        }

        .buyer-event-detail {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 18px 0;
          color: #bdb0ca;
          font-size: 11px;
        }

        .buyer-event-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding-top: 13px;
          border-top: 1px solid #382a45;
        }

        .buyer-event-bottom strong {
          color: #d0a4ff;
          font-size: 13px;
        }

        .buyer-event-bottom a {
          color: white;
          font-size: 12px;
          text-decoration: none;
        }

        .buyer-footer {
          margin-top: 45px;
          padding: 20px 0;
          border-top: 1px solid #302340;
          color: #81738e;
          font-size: 11px;
        }

        @media (max-width: 1000px) {
          .buyer-main {
            padding: 28px 22px;
          }

          .buyer-event-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 750px) {
          .buyer-dashboard {
            flex-direction: column;
          }

          .buyer-sidebar {
            width: 100%;
            min-height: auto;
            padding: 18px;
            border-right: none;
            border-bottom: 1px solid #302340;
          }

          .buyer-logo {
            margin: 0 0 17px;
          }

          .buyer-menu-label {
            display: none;
          }

          .buyer-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 5px;
          }

          .buyer-nav-link {
            padding: 10px;
            font-size: 12px;
          }

          .buyer-logout {
            margin-top: 12px;
          }

          .buyer-welcome-decoration {
            display: none;
          }
        }

        @media (max-width: 520px) {
          .buyer-main {
            padding: 22px 15px;
          }

          .buyer-topbar {
            align-items: flex-start;
          }

          .buyer-topbar h1 {
            font-size: 22px;
          }

          .buyer-profile strong {
            max-width: 90px;
            overflow-wrap: anywhere;
          }

          .buyer-welcome {
            padding: 24px 20px;
          }

          .buyer-welcome h2 {
            font-size: 22px;
          }

          .buyer-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .buyer-event-grid {
            grid-template-columns: 1fr;
          }

          .buyer-section-heading h2 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
