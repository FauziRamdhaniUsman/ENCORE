
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerts } from "../../../data/concerts";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      if (!currentUser || currentUser.role !== "admin") {
        window.location.href = "/login";
        return;
      }

      setAdminName(currentUser.name || "Admin");

      const savedUsers = JSON.parse(
        localStorage.getItem("encoreUsers") || "[]"
      );

      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      setUsers(Array.isArray(savedUsers) ? savedUsers : []);
      setOrders(
        Array.isArray(savedOrders)
          ? savedOrders.filter((order) => order.status === "paid")
          : []
      );
    } catch (error) {
      console.error("Gagal membaca data admin:", error);
    }
  }, []);

  const updateOrganizer = (userId, newStatus) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? { ...user, status: newStatus }
        : user
    );

    localStorage.setItem(
      "encoreUsers",
      JSON.stringify(updatedUsers)
    );

    setUsers(updatedUsers);

    setMessage(
      newStatus === "active"
        ? "Organizer berhasil disetujui."
        : "Pendaftaran Organizer ditolak."
    );
  };

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );

  const totalTickets = orders.reduce(
    (total, order) =>
      total + Number(order.ticketQuantity || 0),
    0
  );

  const pendingOrganizers = users.filter(
    (user) =>
      user.role === "organizer" && user.status === "pending"
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleLogout = () => {
    localStorage.removeItem("encoreCurrentUser");
    window.location.href = "/login";
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="eyebrow">ENCORE ADMINISTRATION</span>
          <h1>Admin Dashboard</h1>
          <p>Selamat datang, {adminName}!</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Keluar
        </button>
      </header>

      <section className="admin-stats">
        <div className="stat-card">
          <span>Total Pengguna</span>
          <strong>{users.length}</strong>
        </div>

        <div className="stat-card">
          <span>Total Event</span>
          <strong>{concerts.length}</strong>
        </div>

        <div className="stat-card">
          <span>Total Transaksi</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="stat-card">
          <span>Total Tiket Terjual</span>
          <strong>{totalTickets}</strong>
        </div>

        <div className="stat-card revenue-card">
          <span>Total Pendapatan</span>
          <strong>{formatPrice(totalRevenue)}</strong>
        </div>
      </section>

      <section className="admin-content">
        <div className="section-title">
          <div>
            <h2>Persetujuan Organizer</h2>
            <p>
              Periksa dan kelola pendaftaran penyelenggara konser.
            </p>
          </div>

          <span className="pending-count">
            {pendingOrganizers.length} Menunggu
          </span>
        </div>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {pendingOrganizers.length === 0 ? (
          <div className="empty">
            Tidak ada pendaftaran Organizer yang menunggu persetujuan.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Organisasi</th>
                  <th>Email</th>
                  <th>Tanggal Daftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {pendingOrganizers.map((user, index) => (
                  <tr key={`${user.id}-${index}`}>
                    <td>{user.name}</td>
                    <td>{user.organization || "-"}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="approve-button"
                          onClick={() =>
                            updateOrganizer(user.id, "active")
                          }
                        >
                          Setujui
                        </button>

                        <button
                          className="reject-button"
                          onClick={() =>
                            updateOrganizer(user.id, "rejected")
                          }
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-content">
        <h2>Daftar Pengguna</h2>
        <p>Pantau akun yang terdaftar di ENCORE.</p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={`${user.id}-${index}`}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={
                        user.status === "active"
                          ? "active-status"
                          : user.status === "pending"
                          ? "pending-status"
                          : "rejected-status"
                      }
                    >
                      {user.status === "active"
                        ? "Aktif"
                        : user.status === "pending"
                        ? "Menunggu"
                        : "Ditolak"}
                    </span>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan="4">Belum ada pengguna terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-height: 100vh;
          padding: 40px;
          background: #10091b;
          color: white;
          font-family: Arial, sans-serif;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 35px;
        }

        .eyebrow {
          color: #bd83ff;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .admin-header h1 {
          font-size: 32px;
          margin: 12px 0;
        }

        .admin-header p {
          color: #b9a9d0;
        }

        .logout-button {
          background: #38203f;
          border: 1px solid #7544a6;
          color: white;
          padding: 12px 22px;
          border-radius: 9px;
          cursor: pointer;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }

        .stat-card,
        .admin-content {
          background: #1c1229;
          border: 1px solid #39274b;
          border-radius: 15px;
          padding: 24px;
        }

        .stat-card span {
          display: block;
          color: #b9a9d0;
          font-size: 13px;
        }

        .stat-card strong {
          display: block;
          margin-top: 14px;
          color: #c58aff;
          font-size: 26px;
        }

        .revenue-card {
          grid-column: span 2;
        }

        .admin-content {
          margin-bottom: 25px;
        }

        .admin-content h2 {
          margin-top: 0;
        }

        .admin-content > p,
        .section-title p {
          color: #b9a9d0;
          font-size: 13px;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .pending-count {
          padding: 8px 13px;
          background: #49351d;
          color: #ffc76a;
          border-radius: 20px;
          font-size: 12px;
          white-space: nowrap;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #39274b;
          font-size: 13px;
        }

        th {
          color: #bd83ff;
        }

        td {
          color: #eee5fa;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .approve-button,
        .reject-button {
          padding: 8px 12px;
          border: none;
          border-radius: 7px;
          color: white;
          font-size: 11px;
          cursor: pointer;
        }

        .approve-button {
          background: #18794e;
        }

        .reject-button {
          background: #923c4b;
        }

        .active-status,
        .pending-status,
        .rejected-status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
        }

        .active-status {
          color: #65e5a4;
          background: #183d30;
        }

        .pending-status {
          color: #ffc76a;
          background: #49351d;
        }

        .rejected-status {
          color: #ff9a9a;
          background: #48232b;
        }

        .empty {
          padding: 30px;
          text-align: center;
          color: #b9a9d0;
          background: #160e21;
          border-radius: 10px;
        }

        .success-message {
          padding: 13px;
          margin-bottom: 18px;
          border-radius: 8px;
          background: #183d30;
          color: #65e5a4;
        }

        @media (max-width: 750px) {
          .admin-page {
            padding: 22px;
          }

          .admin-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .revenue-card {
            grid-column: span 2;
          }

          .admin-header {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .admin-stats {
            grid-template-columns: 1fr;
          }

          .revenue-card {
            grid-column: span 1;
          }
        }
      `}</style>
    </main>
  );
}
