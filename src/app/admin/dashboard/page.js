"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const thClass =
  "border-b border-[#39274b] p-[15px] text-left text-[13px] font-bold text-[#bd83ff]";
const tdClass =
  "border-b border-[#39274b] p-[15px] text-left text-[13px] text-[#eee5fa]";

export default function AdminDashboard() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // 1. Cek sesi login dari Supabase Auth
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        // 2. Pastikan role adalah admin di tabel 'profiles'
        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!adminProfile || adminProfile.role !== "admin") {
          router.replace("/login");
          return;
        }

        setAdminName(adminProfile.name || "Admin");

        // 3. Ambil seluruh data pengguna, event, dan order secara paralel
        const [profilesRes, eventsRes, ordersRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("*"),
        ]);

        if (profilesRes.data) setUsers(profilesRes.data);
        if (typeof eventsRes.count === "number") setEventsCount(eventsRes.count);
        if (ordersRes.data) {
          setOrders(
            ordersRes.data.filter(
              (o) => (o.payment_status || o.payment_ststus) === "paid"
            )
          );
        }
      } catch (error) {
        console.error("Gagal membaca data admin:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [router]);

  const updateOrganizer = async (userId, newStatus) => {
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", userId);

    if (error) {
      alert("Gagal memperbarui status: " + error.message);
      return;
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );

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

  const pendingOrganizers = users.filter(
    (user) => user.role === "organizer" && user.status === "pending"
  );

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("encoreCurrentUser");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#10091b] text-white">
        Memuat dashboard admin...
      </main>
    );
  }

  return (
    <main className="box-border min-h-screen bg-[#10091b] p-10 text-white max-[750px]:p-[22px]">
      <header className="mb-[35px] flex items-center justify-between gap-5 max-[750px]:items-start">
        <div>
          <span className="text-xs font-bold tracking-[2px] text-[#bd83ff]">
            ENCORE ADMINISTRATION
          </span>
          <h1 className="my-3 font-heading text-[32px] font-bold">
            Admin Dashboard
          </h1>
          <p className="text-[#b9a9d0]">Selamat datang, {adminName}!</p>
        </div>

        <button
          type="button"
          className="cursor-pointer rounded-[9px] border border-[#7544a6] bg-[#38203f] px-[22px] py-3 text-white transition hover:bg-[#492a52]"
          onClick={handleLogout}
        >
          Keluar
        </button>
      </header>

      <section className="mb-[30px] grid grid-cols-4 gap-[18px] max-[750px]:grid-cols-2 max-[480px]:grid-cols-1">
        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">
            Total Pengguna
          </span>
          <strong className="mt-3.5 block text-[26px] text-[#c58aff]">
            {users.length}
          </strong>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">Total Event</span>
          <strong className="mt-3.5 block text-[26px] text-[#c58aff]">
            {eventsCount}
          </strong>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">
            Total Transaksi
          </span>
          <strong className="mt-3.5 block text-[26px] text-[#c58aff]">
            {orders.length}
          </strong>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">
            Total Pendapatan
          </span>
          <strong className="mt-3.5 block text-[26px] text-[#c58aff]">
            {formatPrice(totalRevenue)}
          </strong>
        </div>
      </section>

      <section className="mb-[25px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
        <div className="mb-5 flex items-center justify-between gap-[15px]">
          <div>
            <h2 className="mt-0 font-heading text-xl font-bold">
              Persetujuan Organizer
            </h2>
            <p className="mt-1 text-[13px] text-[#b9a9d0]">
              Periksa dan kelola pendaftaran penyelenggara konser.
            </p>
          </div>

          <span className="rounded-[20px] bg-[#49351d] px-[13px] py-2 text-xs whitespace-nowrap text-[#ffc76a]">
            {pendingOrganizers.length} Menunggu
          </span>
        </div>

        {message && (
          <div className="mb-[18px] rounded-lg bg-[#183d30] p-[13px] text-sm text-[#65e5a4]">
            {message}
          </div>
        )}

        {pendingOrganizers.length === 0 ? (
          <div className="rounded-[10px] bg-[#160e21] p-[30px] text-center text-sm text-[#b9a9d0]">
            Tidak ada pendaftaran Organizer yang menunggu persetujuan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Nama</th>
                  <th className={thClass}>Organisasi</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Tanggal Daftar</th>
                  <th className={thClass}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {pendingOrganizers.map((user) => (
                  <tr key={user.id}>
                    <td className={tdClass}>{user.name}</td>
                    <td className={tdClass}>{user.organization || "-"}</td>
                    <td className={tdClass}>{user.email}</td>
                    <td className={tdClass}>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className={tdClass}>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="cursor-pointer rounded-[7px] border-0 bg-[#18794e] px-3 py-2 text-[11px] font-medium text-white transition hover:brightness-110"
                          onClick={() => updateOrganizer(user.id, "active")}
                        >
                          Setujui
                        </button>

                        <button
                          type="button"
                          className="cursor-pointer rounded-[7px] border-0 bg-[#923c4b] px-3 py-2 text-[11px] font-medium text-white transition hover:brightness-110"
                          onClick={() => updateOrganizer(user.id, "rejected")}
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

      <section className="mb-[25px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
        <h2 className="mt-0 font-heading text-xl font-bold">
          Daftar Pengguna
        </h2>
        <p className="mt-1 mb-4 text-[13px] text-[#b9a9d0]">
          Pantau akun yang terdaftar di ENCORE.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Nama</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>Role</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={tdClass}>{user.name}</td>
                  <td className={tdClass}>{user.email}</td>
                  <td className={tdClass}>{user.role}</td>
                  <td className={tdClass}>
                    <span
                      className={`inline-block rounded-[20px] px-2.5 py-1.5 text-[11px] ${
                        user.status === "active"
                          ? "bg-[#183d30] text-[#65e5a4]"
                          : user.status === "pending"
                            ? "bg-[#49351d] text-[#ffc76a]"
                            : "bg-[#48232b] text-[#ff9a9a]"
                      }`}
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
                  <td colSpan="4" className={tdClass}>
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}