"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";

const inputClass =
  "mt-2 block w-full rounded-lg border border-[#493c60] bg-[#100b1c] p-3 text-white outline-none focus:border-primary-light";

const buttonClass =
  "mt-5 cursor-pointer rounded-lg border-0 bg-primary px-5 py-3 font-bold text-white transition hover:bg-[#7c3aed] disabled:opacity-60";

export default function StaffManagementPage() {
  const router = useRouter();

  const [organizer, setOrganizer] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eventIds, setEventIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStaffAndEvents = async (organizerId) => {
    // 1. Ambil daftar event milik organizer dari Supabase
    const { data: eventsData } = await supabase
      .from("events")
      .select("id, title")
      .eq("organizer_id", organizerId)
      .order("created_at", { ascending: false });

    const eventsList = eventsData || [];
    setMyEvents(eventsList);

    // 2. Ambil daftar petugas check-in milik organizer
    const { data: staffProfiles, error: staffError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "checkin")
      .eq("organizer_id", organizerId)
      .order("created_at", { ascending: false });

    if (staffError) {
      console.error("Gagal memuat data petugas:", staffError);
      return;
    }

    const profilesList = staffProfiles || [];

    // 3. Ambil penugasan event dari tabel 'event_staff'
    if (profilesList.length > 0) {
      const staffIds = profilesList.map((s) => s.id);
      const { data: assignments } = await supabase
        .from("event_staff")
        .select("staff_id, event_id")
        .in("staff_id", staffIds);

      const enrichedStaff = profilesList.map((person) => {
        const assignedIds = (assignments || [])
          .filter((a) => a.staff_id === person.id)
          .map((a) => a.event_id);

        return {
          ...person,
          eventIds: assignedIds,
        };
      });

      setStaff(enrichedStaff);
    } else {
      setStaff([]);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "organizer") {
          router.replace("/login");
          return;
        }

        setOrganizer(profile);
        await fetchStaffAndEvents(user.id);
      } catch (err) {
        console.error("Error init staff page:", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  const handleAddStaff = async (e) => {
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

    setSubmitting(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Gunakan client sementara tanpa persistSession agar sesi login Organizer tidak tertimpa
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      // 1. Buat akun autentikasi petugas di Supabase Auth
      const { data: signUpData, error: signUpError } =
        await tempSupabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already registered")) {
          setMessage("Email sudah digunakan.");
        } else {
          setMessage(signUpError.message);
        }
        return;
      }

      const newUserId = signUpData?.user?.id;
      if (!newUserId) {
        setMessage("Gagal membuat akun petugas.");
        return;
      }

      // 2. Simpan profil petugas ke tabel 'profiles'
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: newUserId,
          name: name.trim(),
          email: normalizedEmail,
          role: "checkin",
          status: "active",
          organizer_id: organizer.id,
        },
      ]);

      if (profileError) {
        setMessage("Gagal menyimpan profil petugas: " + profileError.message);
        return;
      }

      // 3. Simpan relasi event yang ditugaskan ke tabel 'event_staff'
      const staffAssignments = eventIds.map((evId) => ({
        staff_id: newUserId,
        event_id: evId,
      }));

      const { error: assignError } = await supabase
        .from("event_staff")
        .insert(staffAssignments);

      if (assignError) {
        setMessage(
          "Akun dibuat, namun gagal menyimpan tugas event: " +
            assignError.message
        );
        return;
      }

      await fetchStaffAndEvents(organizer.id);

      setName("");
      setEmail("");
      setPassword("");
      setEventIds([]);
      setMessage("Akun petugas berhasil dibuat.");
    } catch (err) {
      console.error("Add staff error:", err);
      setMessage("Terjadi kesalahan saat membuat akun petugas.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEvent = (id) => {
    setEventIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleStatus = async (staffUser) => {
    const nextStatus = staffUser.status === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("profiles")
      .update({ status: nextStatus })
      .eq("id", staffUser.id);

    if (error) {
      setMessage("Gagal mengubah status petugas: " + error.message);
      return;
    }

    setStaff((prev) =>
      prev.map((user) =>
        user.id === staffUser.id ? { ...user, status: nextStatus } : user
      )
    );
  };

  if (loading) {
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
            {myEvents.length === 0 ? (
              <p className="text-sm text-[#aaa]">
                Kamu belum memiliki event. Buat event terlebih dahulu di menu
                Manajemen Event.
              </p>
            ) : (
              myEvents.map((event) => (
                <label
                  key={event.id}
                  className="mb-3 flex cursor-pointer items-center gap-2.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={eventIds.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="accent-primary"
                  />
                  {event.title}
                </label>
              ))
            )}
          </div>

          {message && (
            <p className="mt-[15px] text-sm text-[#c4a3ff]">{message}</p>
          )}

          <button type="submit" disabled={submitting} className={buttonClass}>
            {submitting ? "Menyimpan..." : "+ Tambahkan Petugas"}
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
                onClick={() => toggleStatus(user)}
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