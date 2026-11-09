
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrganizerDashboard() {
  const [orders, setOrders] = useState([]);
  const [organizerName, setOrganizerName] = useState("Organizer");

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      if (user) {
        setOrganizerName(
          user.organization || user.name || "Organizer"
        );
      }

      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      setOrders(
        Array.isArray(savedOrders)
          ? savedOrders.filter(
              (order) => order.status === "paid"
            )
          : []
      );
    } catch (error) {
      console.error("Gagal membaca transaksi:", error);
      setOrders([]);
    }
  }, []);

  const totalTickets = orders.reduce(
    (total, order) =>
      total + Number(order.ticketQuantity || 0),
    0
  );

  const totalRevenue = orders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  const checkedInTickets = orders.reduce(
    (total, order) =>
      total +
      (order.checkInStatus === "checked_in"
        ? Number(order.ticketQuantity || 0)
        : 0),
    0
  );

  const pendingCheckIn = totalTickets - checkedInTickets;

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  // Mengelompokkan transaksi berdasarkan nama konser
  const eventReports = Object.values(
    orders.reduce((groups, order) => {
      const eventName = order.concertTitle || "Event Tanpa Nama";

      if (!groups[eventName]) {
        groups[eventName] = {
          name: eventName,
          orders: 0,
          tickets: 0,
          revenue: 0,
          checkedIn: 0,
        };
      }

      const quantity = Number(order.ticketQuantity || 0);

      groups[eventName].orders += 1;
      groups[eventName].tickets += quantity;
      groups[eventName].revenue += Number(order.total || 0);

      if (order.checkInStatus === "checked_in") {
        groups[eventName].checkedIn += quantity;
      }

      return groups;
    }, {})
  );

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <p className="eyebrow">ENCORE ORGANIZER</p>
          <h1>Dashboard</h1>
          <p>Selamat datang, {organizerName}!</p>
        </div>

        <div className="header-actions">
          <Link href="/organizer/events" className="event-button">
            Manajemen Event
          </Link>

          <Link href="/organizer/checkin" className="checkin">
            Scan Tiket →
          </Link>
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total Pesanan</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="stat-card">
          <span>Total Tiket Terjual</span>
          <h2>{totalTickets}</h2>
        </div>

        <div className="stat-card">
          <span>Total Pendapatan</span>
          <h2>{formatPrice(totalRevenue)}</h2>
        </div>

        <div className="stat-card">
          <span>Tiket Sudah Check-in</span>
          <h2>{checkedInTickets}</h2>
        </div>

        <div className="stat-card">
          <span>Belum Check-in</span>
          <h2>{pendingCheckIn}</h2>
        </div>
      </section>

      <section className="content">
        <div className="section-heading">
          <div>
            <h2>Laporan Penjualan per Event</h2>
            <p>Ringkasan performa penjualan setiap konser.</p>
          </div>
        </div>

        {eventReports.length === 0 ? (
          <div className="empty">
            Belum ada data penjualan event.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama Event</th>
                  <th>Pesanan</th>
                  <th>Tiket Terjual</th>
                  <th>Pendapatan</th>
                  <th>Sudah Check-in</th>
                  <th>Belum Check-in</th>
                </tr>
              </thead>

              <tbody>
                {eventReports.map((event, index) => (
                  <tr key={`${event.name}-${index}`}>
                    <td>{event.name}</td>
                    <td>{event.orders}</td>
                    <td>{event.tickets}</td>
                    <td>{formatPrice(event.revenue)}</td>
                    <td>
                      <span className="checked-status">
                        {event.checkedIn}
                      </span>
                    </td>
                    <td>
                      <span className="pending-status">
                        {event.tickets - event.checkedIn}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="content">
        <h2>Riwayat Penjualan</h2>
        <p>Daftar transaksi tiket yang berhasil dibayar.</p>

        {orders.length === 0 ? (
          <div className="empty">
            Belum ada transaksi yang berhasil.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Pemesan</th>
                  <th>Email</th>
                  <th>Konser</th>
                  <th>Jumlah Tiket</th>
                  <th>Total Pembayaran</th>
                  <th>Status Check-in</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={`${order.id || order.ticketCode || "order"}-${index}`}
                  >
                    <td>{order.buyerName || "-"}</td>
                    <td>{order.buyerEmail || "-"}</td>
                    <td>{order.concertTitle || "-"}</td>
                    <td>
                      {Number(order.ticketQuantity || 0)}
                    </td>
                    <td>
                      {formatPrice(Number(order.total || 0))}
                    </td>
                    <td>
                      {order.checkInStatus === "checked_in" ? (
                        <span className="checked-status">
                          Sudah Check-in
                        </span>
                      ) : (
                        <span className="pending-status">
                          Belum Check-in
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          padding: 40px;
          background: #10091b;
          color: #fff;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 35px;
        }

        .eyebrow {
          color: #bd83ff;
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: bold;
        }

        .header h1 {
          font-size: 32px;
          margin: 10px 0;
        }

        .header p {
          color: #b9a9d0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .checkin,
        .event-button {
          display: inline-block;
          color: white;
          text-decoration: none;
          padding: 13px 20px;
          border-radius: 10px;
          font-weight: bold;
          font-size: 13px;
        }

        .checkin {
          background: #a766e8;
        }

        .event-button {
          background: #281b39;
          border: 1px solid #49316d;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 35px;
        }

        .stat-card,
        .content {
          background: #1c1229;
          border: 1px solid #39274b;
          border-radius: 15px;
          padding: 25px;
        }

        .stat-card span {
          color: #b9a9d0;
          font-size: 13px;
        }

        .stat-card h2 {
          color: #c58aff;
          font-size: 27px;
          margin: 15px 0 0;
        }

        .content {
          margin-bottom: 25px;
        }

        .content h2 {
          margin-top: 0;
        }

        .content > p,
        .section-heading p {
          color: #b9a9d0;
          margin-bottom: 25px;
        }

        .section-heading {
          margin-bottom: 20px;
        }

        .empty {
          padding: 35px;
          text-align: center;
          color: #b9a9d0;
          background: #160e21;
          border-radius: 10px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        th,
        td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid #39274b;
        }

        th {
          color: #bd83ff;
          font-size: 12px;
          white-space: nowrap;
        }

        td {
          color: #eee5fa;
          font-size: 13px;
        }

        .checked-status {
          color: #65e5a4;
          background: #183d30;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          white-space: nowrap;
        }

        .pending-status {
          color: #ffc76a;
          background: #49351d;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .dashboard {
            padding: 22px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
