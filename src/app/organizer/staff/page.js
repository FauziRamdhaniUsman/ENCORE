"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { concerts } from "../../../data/concerts";

const inputClass =
  "mt-2 block w-full rounded-lg border border-[#493c60] bg-[#100b1c] p-3 text-white outline-none focus:border-primary-light";

const buttonClass =
  "mt-5 cursor-pointer rounded-lg border-0 bg-primary px-5 py-3 font-bold text-white transition hover:bg-[#7c3aed]";

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

    const users = JSON.parse(localStorage.getItem("encoreUsers") || "[]");

    setStaff(
      users.filter(
        (user) =>
          user.role === "checkin" && user.organizerId === currentUser.id
      )
    );
  }, [router]);

  const saveStaff = (updatedStaff) => {
    const users = JSON.parse(localStorage.getItem("encoreUsers") || "[]");

    const otherUsers = users.filter(
      (user) =>
        !(user.role === "checkin" && user.organizerId === organizer.id)
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

    const users = JSON.parse(localStorage.getItem("encoreUsers") || "[]");

    const normalizedEmail = email.trim().toLowerCase();

    if (
      users.some((user) => user.email?.toLowerCase() === normalizedEmail)
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
            status: user.status === "active" ? "inactive" : "active",
          }
        : user
    );

    saveStaff(updated);
  };

  if (!organizer) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#100b1c] text-white">
        Memuat Manajemen Petugas...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#100b1c] px-[6%] py-10 text-white">
      <Link
        href="/organizer/dashboard"
        className="text-sm text-primary-light hover:text-white"
      >
        ← Kembali ke Dashboard
      </Link>

      <h1 className="mt-[25px] font-heading text-3xl font-bold">
        Manajemen Petugas
      </h1>

      <p className="mt-2 text-[#aaa]">
        Kelola petugas check-in untuk event kamu.
      </p>

      <section className="mt-[30px] rounded-[14px] bg-surface-light p-[25px]">
        <h2 className="font-heading text-xl font-bold">Tambah Petugas Baru</h2>

        <form onSubmit={handleAddStaff}>
          <div className="mt-5">
            <label className="text-sm font-medium">Nama Petugas</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>

          <div className="mt-[15px]">
            <label className="text-sm font-medium">Email</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="petugas@email.com"
            />
          </div>

          <div className="mt-[15px]">
            <label className="text-sm font-medium">Password</label>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>

          <h3 className="mt-[25px] font-heading text-base font-bold">
            Pilih Event Petugas
          </h3>

          <div className="mt-3">
            {concerts.map((event) => (
              <label
                key={event.id}
                className="mb-3 flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={eventIds.includes(String(event.id))}
                  onChange={() => toggleEvent(String(event.id))}
                  className="accent-primary"
                />
                {event.title}
              </label>
            ))}
          </div>

          {message && (
            <p className="mt-[15px] text-sm text-[#c4a3ff]">{message}</p>
          )}

          <button type="submit" className={buttonClass}>
            + Tambahkan Petugas
          </button>
        </form>
      </section>

      <section className="mt-[35px]">
        <h2 className="font-heading text-xl font-bold">
          Daftar Petugas ({staff.length})
        </h2>

        {staff.length === 0 ? (
          <p className="mt-[15px] text-[#aaa]">
            Belum ada petugas yang ditambahkan.
          </p>
        ) : (
          staff.map((user) => (
            <article
              key={user.id}
              className="mt-[15px] rounded-xl bg-surface-light p-5"
            >
              <h3 className="font-heading text-lg font-bold">{user.name}</h3>
              <p className="text-sm text-[#aaa]">{user.email}</p>
              <p className="mt-2 text-sm">
                Event ditugaskan: {user.eventIds.length}
              </p>
              <p className="text-sm">
                Status: {user.status === "active" ? "Aktif" : "Nonaktif"}
              </p>

              <button
                type="button"
                className={buttonClass}
                onClick={() => toggleStatus(user.id)}
              >
                {user.status === "active" ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}