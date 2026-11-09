
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { concerts, formatPrice } from "../../../data/concerts";

export default function MyTicketsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
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

      const userTickets = savedOrders.filter(
        (order) =>
          order.status === "paid" &&
          (String(order.userId) === String(currentUser.id) ||
            order.buyerEmail === currentUser.email)
      );

      setTickets(userTickets);
    } catch (error) {
      console.error("Gagal memuat tiket:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("encoreCurrentUser");
    router.push("/login");
  }

  function getConcert(order) {
    return concerts.find(
      (concert) =>
        String(concert.id) === String(order.concertId)
    );
  }

  function getTicketCode(order) {
    return order.ticketCode || `ENCORE-${order.id || "TICKET"}`;
  }

  function getTicketStatus(order) {
    return order.checkInStatus === "checked_in"
      ? "Sudah Check-in"
      : "Belum Check-in";
  }

  if (loading) {
    return (
      <>
        <div className="tickets-loading">
          Memuat tiket ENCORE...
        </div>

        <style>{`
          .tickets-loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #100b1c;
            color: white;
            font-family: Arial, sans-serif;
          }
        `}</style>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="tickets-page">
      <aside className="tickets-sidebar">
        <Link href="/buyer/dashboard" className="tickets-logo">
          <span>EN</span>CORE
        </Link>

        <p className="tickets-menu-label">MENU UTAMA</p>

        <nav className="tickets-nav">
          <Link href="/buyer/dashboard" className="tickets-nav-link">
            <span>⌂</span> Dashboard
          </Link>

          <Link
            href="/buyer/tickets"
            className="tickets-nav-link active"
          >
            <span>▣</span> Tiket Saya
          </Link>

          <Link href="/concerts" className="tickets-nav-link">
            <span>♫</span> Jelajahi Konser
          </Link>
        </nav>

        <button className="tickets-logout" onClick={handleLogout}>
          ↪ Keluar
        </button>
      </aside>

      <main className="tickets-main">
        <header className="tickets-header">
          <div>
            <p className="tickets-breadcrumb">ENCORE / TIKET SAYA</p>
            <h1>Tiket Saya</h1>
            <p className="tickets-subtitle">
              Semua tiket konser yang sudah berhasil kamu beli.
            </p>
          </div>

          <div className="tickets-user">
            <div className="tickets-avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>Buyer</span>
            </div>
          </div>
        </header>

        <section className="tickets-summary">
          <div>
            <span>Total Pesanan</span>
            <strong>{tickets.length}</strong>
          </div>

          <div>
            <span>Total Tiket</span>
            <strong>
              {tickets.reduce(
                (total, order) =>
                  total + Number(order.quantity || 0),
                0
              )}
            </strong>
          </div>
        </section>

        <section className="tickets-content">
          <div className="tickets-section-heading">
            <div>
              <p className="tickets-eyebrow">
                YOUR CONCERT EXPERIENCE
              </p>
              <h2>Daftar Tiket</h2>
            </div>

            <Link href="/concerts" className="tickets-explore">
              Cari Konser →
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="tickets-empty">
              <div className="tickets-empty-icon">♫</div>

              <h3>Belum Ada Tiket</h3>

              <p>
                Kamu belum memiliki tiket konser. Yuk, temukan
                konser favoritmu dan mulai pengalaman musikmu
                bersama ENCORE!
              </p>

              <Link
                href="/concerts"
                className="tickets-primary-button"
              >
                Jelajahi Konser
              </Link>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map((order, index) => {
                const concert = getConcert(order);
                const ticketCode = getTicketCode(order);
                const checkedIn =
                  order.checkInStatus === "checked_in";

                // Gunakan ID pesanan dan indeks agar key unik.
                const uniqueKey = `${order.id || ticketCode}-${index}`;

                const totalAmount = Number(
                  order.total ||
                    order.totalPrice ||
                    order.totalAmount ||
                    0
                );

                return (
                  <article
                    className="ticket-card"
                    key={uniqueKey}
                  >
                    <div className="ticket-card-main">
                      <div className="ticket-concert-image">
                        {concert?.image ? (
                          <img
                            src={concert.image}
                            alt={concert.title || "Konser ENCORE"}
                          />
                        ) : (
                          <div className="ticket-image-placeholder">
                            ♫
                          </div>
                        )}
                      </div>

                      <div className="ticket-information">
                        <div className="ticket-status-row">
                          <span className="ticket-paid">
                            Pembayaran Berhasil
                          </span>

                          <span
                            className={
                              checkedIn
                                ? "ticket-checkin checked"
                                : "ticket-checkin"
                            }
                          >
                            {getTicketStatus(order)}
                          </span>
                        </div>

                        <h3>
                          {concert?.title ||
                            order.concertTitle ||
                            order.eventName ||
                            "Konser ENCORE"}
                        </h3>

                        <p className="ticket-artist">
                          {concert?.artist ||
                            order.artist ||
                            "Live Music Event"}
                        </p>

                        <div className="ticket-details">
                          <div>
                            <span>Tanggal</span>
                            <strong>
                              {concert?.date ||
                                order.concertDate ||
                                "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Lokasi</span>
                            <strong>
                              {concert?.location ||
                                concert?.venue ||
                                order.location ||
                                "-"}
                            </strong>
                          </div>

                          <div>
                            <span>Jumlah Tiket</span>
                            <strong>
                              {order.quantity || 1} tiket
                            </strong>
                          </div>

                          <div>
                            <span>Total Pembayaran</span>
                            <strong>
                              {typeof formatPrice === "function"
                                ? formatPrice(totalAmount)
                                : `Rp${totalAmount.toLocaleString("id-ID")}`}
                            </strong>
                          </div>
                        </div>

                        <div className="ticket-code">
                          <span>KODE E-TIKET</span>
                          <strong>{ticketCode}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="ticket-qr-section">
                      <div className="ticket-qr">
                        <QRCodeCanvas
                          value={ticketCode}
                          size={145}
                          level="H"
                          includeMargin
                        />
                      </div>

                      <p>Scan QR Code saat check-in</p>

                      <span className="ticket-qr-note">
                        Simpan tiket ini dan tunjukkan kepada petugas.
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="tickets-footer">
          © 2026 ENCORE. All rights reserved.
        </footer>
      </main>

      <style>{`
        .tickets-page {
          min-height: 100vh;
          display: flex;
          background: #100b1c;
          color: #f7f3ff;
          font-family: Arial, sans-serif;
        }

        .tickets-page *,
        .tickets-page *::before,
        .tickets-page *::after {
          box-sizing: border-box;
        }

        .tickets-sidebar {
          width: 245px;
          min-height: 100vh;
          flex-shrink: 0;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          background: #171025;
          border-right: 1px solid #302340;
        }

        .tickets-logo {
          margin: 5px 0 55px;
          color: white;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 2px;
          text-decoration: none;
        }

        .tickets-logo span {
          color: #b77aff;
        }

        .tickets-menu-label,
        .tickets-breadcrumb,
        .tickets-eyebrow {
          color: #9e8eae;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.7px;
        }

        .tickets-menu-label {
          margin: 0 0 15px 10px;
        }

        .tickets-nav {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .tickets-nav-link {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 13px;
          border-radius: 9px;
          color: #b8acc7;
          font-size: 14px;
          text-decoration: none;
        }

        .tickets-nav-link span {
          font-size: 19px;
        }

        .tickets-nav-link:hover,
        .tickets-nav-link.active {
          color: white;
          background: #38234f;
        }

        .tickets-nav-link.active {
          border-left: 3px solid #b77aff;
        }

        .tickets-logout {
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

        .tickets-main {
          flex: 1;
          min-width: 0;
          padding: 35px 42px;
        }

        .tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .tickets-header h1 {
          margin-top: 8px;
          font-size: 27px;
        }

        .tickets-subtitle {
          margin-top: 9px;
          color: #a99ab7;
          font-size: 13px;
        }

        .tickets-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tickets-avatar {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #6739a0;
          font-size: 18px;
          font-weight: bold;
        }

        .tickets-user strong,
        .tickets-user span {
          display: block;
          font-size: 13px;
        }

        .tickets-user span {
          margin-top: 4px;
          color: #a99ab7;
        }

        .tickets-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 38px;
        }

        .tickets-summary div {
          padding: 20px;
          border: 1px solid #302340;
          border-radius: 12px;
          background: #1a1226;
        }

        .tickets-summary span,
        .tickets-summary strong {
          display: block;
        }

        .tickets-summary span {
          color: #a99ab7;
          font-size: 12px;
        }

        .tickets-summary strong {
          margin-top: 9px;
          color: #d0a4ff;
          font-size: 26px;
        }

        .tickets-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 15px;
          margin-bottom: 20px;
        }

        .tickets-section-heading h2 {
          margin-top: 8px;
          font-size: 22px;
        }

        .tickets-explore {
          color: #c394ff;
          font-size: 13px;
          text-decoration: none;
        }

        .tickets-empty {
          padding: 65px 25px;
          border: 1px dashed #49365b;
          border-radius: 14px;
          background: #1a1226;
          text-align: center;
        }

        .tickets-empty-icon {
          margin-bottom: 15px;
          color: #b77aff;
          font-size: 48px;
        }

        .tickets-empty h3 {
          font-size: 20px;
        }

        .tickets-empty p {
          max-width: 480px;
          margin: 12px auto 22px;
          color: #a99ab7;
          font-size: 13px;
          line-height: 1.7;
        }

        .tickets-primary-button {
          display: inline-block;
          padding: 12px 19px;
          border-radius: 8px;
          background: #a66be8;
          color: white;
          font-size: 13px;
          font-weight: bold;
          text-decoration: none;
        }

        .tickets-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ticket-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          overflow: hidden;
          border: 1px solid #3b2b4c;
          border-radius: 13px;
          background: #1a1226;
        }

        .ticket-card-main {
          display: flex;
          gap: 20px;
          padding: 22px;
        }

        .ticket-concert-image {
          width: 150px;
          height: 185px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 9px;
          background: #302340;
        }

        .ticket-concert-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ticket-image-placeholder {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          color: #b77aff;
          font-size: 55px;
        }

        .ticket-information {
          flex: 1;
          min-width: 0;
        }

        .ticket-status-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 13px;
        }

        .ticket-paid,
        .ticket-checkin {
          padding: 6px 9px;
          border-radius: 20px;
          background: #203d32;
          color: #8fe0b3;
          font-size: 10px;
          font-weight: bold;
        }

        .ticket-checkin {
          background: #48351d;
          color: #ffd28b;
        }

        .ticket-checkin.checked {
          background: #203d32;
          color: #8fe0b3;
        }

        .ticket-information h3 {
          font-size: 19px;
        }

        .ticket-artist {
          margin-top: 6px;
          color: #a99ab7;
          font-size: 12px;
        }

        .ticket-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .ticket-details span,
        .ticket-details strong {
          display: block;
        }

        .ticket-details span {
          margin-bottom: 6px;
          color: #91839e;
          font-size: 10px;
        }

        .ticket-details strong {
          color: #eee5f7;
          font-size: 12px;
        }

        .ticket-code {
          padding-top: 13px;
          border-top: 1px dashed #49365b;
        }

        .ticket-code span,
        .ticket-code strong {
          display: block;
        }

        .ticket-code span {
          margin-bottom: 6px;
          color: #91839e;
          font-size: 9px;
          letter-spacing: 1.4px;
        }

        .ticket-code strong {
          color: #d0a4ff;
          font-size: 13px;
          letter-spacing: 1px;
          overflow-wrap: anywhere;
        }

        .ticket-qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border-left: 1px dashed #49365b;
          text-align: center;
        }

        .ticket-qr {
          padding: 9px;
          border-radius: 9px;
          background: white;
        }

        .ticket-qr-section p {
          margin-top: 13px;
          font-size: 11px;
          font-weight: bold;
        }

        .ticket-qr-note {
          max-width: 165px;
          margin-top: 6px;
          color: #a99ab7;
          font-size: 10px;
          line-height: 1.5;
        }

        .tickets-footer {
          margin-top: 45px;
          padding: 20px 0;
          border-top: 1px solid #302340;
          color: #81738e;
          font-size: 11px;
        }

        @media (max-width: 950px) {
          .tickets-main {
            padding: 28px 22px;
          }

          .ticket-card {
            grid-template-columns: minmax(0, 1fr) 185px;
          }

          .ticket-card-main {
            padding: 16px;
            gap: 14px;
          }

          .ticket-concert-image {
            width: 115px;
            height: 160px;
          }
        }

        @media (max-width: 750px) {
          .tickets-page {
            flex-direction: column;
          }

          .tickets-sidebar {
            width: 100%;
            min-height: auto;
            padding: 18px;
            border-right: none;
            border-bottom: 1px solid #302340;
          }

          .tickets-logo {
            margin: 0 0 17px;
          }

          .tickets-menu-label {
            display: none;
          }

          .tickets-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 5px;
          }

          .tickets-nav-link {
            padding: 10px;
            font-size: 12px;
          }

          .tickets-logout {
            margin-top: 12px;
          }
        }

        @media (max-width: 560px) {
          .tickets-main {
            padding: 22px 15px;
          }

          .tickets-header {
            align-items: flex-start;
          }

          .tickets-header h1 {
            font-size: 22px;
          }

          .tickets-user strong {
            max-width: 90px;
            overflow-wrap: anywhere;
          }

          .tickets-summary {
            gap: 10px;
          }

          .ticket-card {
            grid-template-columns: 1fr;
          }

          .ticket-card-main {
            flex-direction: column;
          }

          .ticket-concert-image {
            width: 100%;
            height: 175px;
          }

          .ticket-qr-section {
            border-top: 1px dashed #49365b;
            border-left: none;
          }

          .ticket-details {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
