
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
  const [events, setEvents] = useState([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingEventId, setDeletingEventId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAdminData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: adminProfile, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (
          profileError ||
          !adminProfile ||
          adminProfile.role !== "admin"
        ) {
          router.replace("/login");
          return;
        }

        if (!mounted) return;

        setAdminName(adminProfile.name || "Admin");

        const [profilesRes, eventsRes, ordersRes, ticketsRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("*")
              .order("created_at", { ascending: false }),

            supabase
              .from("events")
              .select(
                "id, title, artist, event_date, location, venue, status, organizer_id, created_at"
              )
              .order("created_at", { ascending: false }),

            supabase
              .from("orders")
              .select("*"),

            supabase
              .from("tickets")
              .select("event_id"),
          ]);

        if (!mounted) return;

        // DATA PENGGUNA
        if (profilesRes.error) {
          console.error("Gagal mengambil pengguna:", profilesRes.error);
        } else {
          setUsers(profilesRes.data || []);
        }

        // DATA EVENT DAN NAMA ORGANIZER
        if (eventsRes.error) {
          console.error("Gagal mengambil event:", eventsRes.error);
          setEvents([]);
        } else {
          const profiles = profilesRes.data || [];
          const tickets = ticketsRes.data || [];

          const eventList = (eventsRes.data || []).map((event) => {
            const organizer = profiles.find(
              (profile) => profile.id === event.organizer_id
            );

            const ticketCount = tickets.filter(
              (ticket) => ticket.event_id === event.id
            ).length;

            return {
              ...event,
              organizerName: organizer?.name || "Organizer tidak ditemukan",
              ticketCount,
            };
          });

          setEvents(eventList);
          setEventsCount(eventList.length);
        }

        if (ticketsRes.error) {
          console.error("Gagal mengambil tiket:", ticketsRes.error);
        }

        // DATA TRANSAKSI BERHASIL
        if (ordersRes.data) {
          setOrders(
            ordersRes.data.filter(
              (order) =>
                (order.payment_status ||
                  order.payment_ststus) === "paid"
            )
          );
        } else if (ordersRes.error) {
          console.error("Gagal mengambil transaksi:", ordersRes.error);
        }

      } catch (error) {
        console.error("Gagal membaca data admin:", error);
      } finally {
        if (mounted) {
          setLoading(false);
          setEventsLoading(false);
        }
      }
    };

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, [router]);

  // SETUJUI ATAU TOLAK ORGANIZER
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
        user.id === userId
          ? { ...user, status: newStatus }
          : user
      )
    );

    setMessage(
      newStatus === "active"
        ? "Organizer berhasil disetujui."
        : "Pendaftaran Organizer ditolak."
    );
  };

  // HAPUS EVENT OLEH ADMIN
  const handleDeleteEvent = async (event) => {
    if (event.ticketCount > 0) {
      alert(
        "Event tidak dapat dihapus karena sudah memiliki tiket yang tercatat."
      );
      return;
    }

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus event "${event.title}"?\n\nEvent yang dihapus tidak dapat dikembalikan.`
    );

    if (!confirmed) return;

    setDeletingEventId(event.id);

    try {
      const { data, error } = await supabase.rpc(
        "admin_remove_event",
        {
          p_event_id: event.id,
        }
      );

      if (error) {
        alert(
          "Gagal menghapus event:\n" + error.message
        );
        return;
      }

      setEvents((prev) =>
        prev.filter((item) => item.id !== event.id)
      );

      setEventsCount((prev) => Math.max(0, prev - 1));

      alert(data?.message || "Event berhasil dihapus.");

    } catch (error) {
      console.error("Gagal menghapus event:", error);
      alert("Terjadi kesalahan saat menghapus event.");
    } finally {
      setDeletingEventId(null);
    }
  };

  // TOTAL PENDAPATAN
  const totalRevenue = orders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0
  );

  // ORGANIZER MENUNGGU PERSETUJUAN
  const pendingOrganizers = users.filter(
    (user) =>
      user.role === "organizer" &&
      user.status === "pending"
  );

  // FORMAT RUPIAH
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  // LOGOUT
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

      {/* HEADER */}
      <header className="mb-[35px] flex items-center justify-between gap-5 max-[750px]:items-start">
        <div>
          <span className="text-xs font-bold tracking-[2px] text-[#bd83ff]">
            ENCORE ADMINISTRATION
          </span>

          <h1 className="my-3 font-heading text-[32px] font-bold">
            Admin Dashboard
          </h1>

          <p className="text-[#b9a9d0]">
            Selamat datang, {adminName}!
          </p>
        </div>

        <button
          type="button"
          className="cursor-pointer rounded-[9px] border border-[#7544a6] bg-[#38203f] px-[22px] py-3 text-white transition hover:bg-[#492a52]"
          onClick={handleLogout}
        >
          Keluar
        </button>
      </header>

      {/* STATISTIK */}
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
          <span className="block text-[13px] text-[#b9a9d0]">
            Total Konser
          </span>

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

      {/* PERSETUJUAN ORGANIZER */}
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

      {/* MANAJEMEN EVENT */}
      <section className="mb-[25px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">

        <h2 className="mt-0 font-heading text-xl font-bold">
          Manajemen Event
        </h2>

        <p className="mt-1 mb-5 text-[13px] text-[#b9a9d0]">
          Lihat dan kelola seluruh event yang dibuat oleh Organizer.
        </p>

        <div className="mb-5 rounded-lg border border-[#7544a6] bg-[#241531] p-4 text-[13px] text-[#d8c3ed]">
          Admin hanya dapat menghapus event yang belum memiliki tiket
          tercatat. Event yang sudah memiliki tiket tidak dapat dihapus
          agar data pembelian tetap aman.
        </div>

        {eventsLoading ? (
          <p className="py-6 text-center text-sm text-[#b9a9d0]">
            Memuat daftar event...
          </p>
        ) : events.length === 0 ? (
          <div className="rounded-[10px] bg-[#160e21] p-[30px] text-center text-sm text-[#b9a9d0]">
            Belum ada event yang terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Nama Event</th>
                  <th className={thClass}>Organizer</th>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Jumlah Tiket</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className={tdClass}>
                      <div className="font-semibold">
                        {event.title}
                      </div>
                      <div className="mt-1 text-xs text-[#b9a9d0]">
                        {event.artist || event.venue || "-"}
                      </div>
                    </td>

                    <td className={tdClass}>
                      {event.organizerName}
                    </td>

                    <td className={tdClass}>
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString("id-ID")
                        : "-"}
                    </td>

                    <td className={tdClass}>
                      {event.ticketCount} tiket
                    </td>

                    <td className={tdClass}>
                      <span
                        className={`inline-block rounded-[20px] px-2.5 py-1.5 text-[11px] ${
                          event.status === "active"
                            ? "bg-[#183d30] text-[#65e5a4]"
                            : "bg-[#48232b] text-[#ff9a9a]"
                        }`}
                      >
                        {event.status === "active" ? "Aktif" : "Dibatalkan"}
                      </span>
                    </td>

                    <td className={tdClass}>
                      {event.ticketCount > 0 ? (
                        <button
                          type="button"
                          disabled
                          title="Event sudah memiliki tiket dan tidak dapat dihapus."
                          className="cursor-not-allowed rounded-[7px] bg-[#49351d] px-3 py-2 text-[11px] text-[#ffc76a] opacity-80"
                        >
                          Tidak dapat dihapus
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={deletingEventId === event.id}
                          onClick={() => handleDeleteEvent(event)}
                          className="cursor-pointer rounded-[7px] border-0 bg-[#923c4b] px-3 py-2 text-[11px] font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingEventId === event.id
                            ? "Menghapus..."
                            : "Hapus Event"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DAFTAR PENGGUNA */}
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
