
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { concerts } from "../../../data/concerts";

export default function StaffManagementPage() {
  const router = useRouter();

  const [organizer, setOrganizer] = useState(null);
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eventIds, setEventIds] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem("encoreCurrentUser") || "null"
    );

    if (!currentUser || currentUser.role !== "organizer") {
      router.replace("/login");
      return;
    }

    setOrganizer(currentUser);

    const users = JSON.parse(
      localStorage.getItem("encoreUsers") || "[]"
    );

    setStaff(
      users.filter(
        (user) =>
          user.role === "checkin" &&
          user.organizerId === currentUser.id
      )
    );
  }, [router]);

  const saveStaff = (updatedStaff) => {
    const users = JSON.parse(
      localStorage.getItem("encoreUsers") || "[]"
    );

    const otherUsers = users.filter(
      (user) =>
        !(
          user.role === "checkin" &&
          user.organizerId === organizer.id
        )
    );

    localStorage.setItem(
      "encoreUsers",
      JSON.stringify([...otherUsers, ...updatedStaff])
    );

    setStaff(updatedStaff);
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setMessage("Semua data wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }

    if (eventIds.length === 0) {
      setMessage("Pilih minimal satu event.");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("encoreUsers") || "[]"
    );

    const normalizedEmail = email.trim().toLowerCase();

    if (
      users.some(
        (user) =>
          user.email?.toLowerCase() === normalizedEmail
      )
    ) {
      setMessage("Email sudah digunakan.");
      return;
    }

    const newStaff = {
      id: "staff-" + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "checkin",
      status: "active",
      organizerId: organizer.id,
      eventIds,
    };

    saveStaff([...staff, newStaff]);

    setName("");
    setEmail("");
    setPassword("");
    setEventIds([]);
    setMessage("Akun petugas berhasil dibuat.");
  };

  const toggleEvent = (id) => {
    setEventIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleStatus = (id) => {
    const updated = staff.map((user) =>
      user.id === id
        ? {
            ...user,
            status:
              user.status === "active"
                ? "inactive"
                : "active",
          }
        : user
    );

    saveStaff(updated);
  };

  if (!organizer) {
    return <p>Memuat Manajemen Petugas...</p>;
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#100b1c",
      color: "white",
      padding: "40px 6%",
    }}>
      <Link href="/organizer/dashboard">
        ← Kembali ke Dashboard
      </Link>

      <h1 style={{ marginTop: 25 }}>
        Manajemen Petugas
      </h1>

      <p style={{ color: "#aaa", marginTop: 8 }}>
        Kelola petugas check-in untuk event kamu.
      </p>

      <section style={{
        background: "#1d1733",
        padding: 25,
        borderRadius: 14,
        marginTop: 30,
      }}>
        <h2>Tambah Petugas Baru</h2>

        <form onSubmit={handleAddStaff}>
          <div style={{ marginTop: 20 }}>
            <label>Nama Petugas</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>

          <div style={{ marginTop: 15 }}>
            <label>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="petugas@email.com"
            />
          </div>

          <div style={{ marginTop: 15 }}>
            <label>Password</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <h3 style={{ marginTop: 25 }}>
            Pilih Event Petugas
          </h3>

          <div style={{ marginTop: 12 }}>
            {concerts.map((event) => (
              <label
                key={event.id}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 12,
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={eventIds.includes(String(event.id))}
                  onChange={() => toggleEvent(String(event.id))}
                />
                {event.title}
              </label>
            ))}
          </div>

          {message && (
            <p style={{ marginTop: 15, color: "#c4a3ff" }}>
              {message}
            </p>
          )}

          <button type="submit" style={buttonStyle}>
            + Tambahkan Petugas
          </button>
        </form>
      </section>

      <section style={{ marginTop: 35 }}>
        <h2>Daftar Petugas ({staff.length})</h2>

        {staff.length === 0 ? (
          <p style={{ color: "#aaa", marginTop: 15 }}>
            Belum ada petugas yang ditambahkan.
          </p>
        ) : (
          staff.map((user) => (
            <article
              key={user.id}
              style={{
                background: "#1d1733",
                padding: 20,
                borderRadius: 12,
                marginTop: 15,
              }}
            >
              <h3>{user.name}</h3>
              <p style={{ color: "#aaa" }}>{user.email}</p>
              <p style={{ marginTop: 8 }}>
                Event ditugaskan: {user.eventIds.length}
              </p>
              <p>
                Status: {user.status === "active" ? "Aktif" : "Nonaktif"}
              </p>

              <button
                style={buttonStyle}
                onClick={() => toggleStatus(user.id)}
              >
                {user.status === "active"
                  ? "Nonaktifkan"
                  : "Aktifkan"}
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 12,
  marginTop: 8,
  borderRadius: 8,
  border: "1px solid #493c60",
  background: "#100b1c",
  color: "white",
};

const buttonStyle = {
  marginTop: 20,
  padding: "12px 20px",
  borderRadius: 8,
  border: "none",
  background: "#8b5cf6",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};
