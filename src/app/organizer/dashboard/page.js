"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const thClass =
  "border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]";
const tdClass =
  "border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]";

export default function OrganizerDashboard() {
  const router = useRouter();

  const [organizerName, setOrganizerName] = useState("Organizer");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalTickets: 0,
    totalRevenue: 0,
    checkedInTickets: 0,
    pendingCheckIn: 0,
  });
  const [eventReports, setEventReports] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1. Verifikasi sesi login dan role organizer
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

        if (profile.status !== "active") {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        setOrganizerName(profile.organization || profile.name || "Organizer");

        // 2. Ambil semua event milik organizer ini
        const { data: myEvents } = await supabase
          .from("events")
          .select("id, title")
          .eq("organizer_id", user.id);

        if (!myEvents || myEvents.length === 0) {
          setLoading(false);
          return;
        }

        const eventIds = myEvents.map((ev) => ev.id);
        const eventTitleMap = Object.fromEntries(
          myEvents.map((ev) => [ev.id, ev.title])
        );

        // 3. Ambil seluruh tiket & order yang terhubung dengan event milik organizer
        const { data: ticketsData } = await supabase
          .from("tickets")
          .select(
            `
            id,
            event_id,
            order_id,
            checked_in,
            orders (
              id,
              buyer_name,
              buyer_email,
              total,
              payment_status,
              created_at
            )
          `
          )
          .in("event_id", eventIds);

        // Filter hanya tiket dari order yang sudah lunas (paid)
        const paidTickets = (ticketsData || []).filter(
          (t) => t.orders && t.orders.payment_status === "paid"
        );

        // Kelompokkan order unik untuk menghitung total pesanan & total pendapatan
        const uniqueOrdersMap = new Map();
        const reportMap = {};

        myEvents.forEach((ev) => {
          reportMap[ev.id] = {
            id: ev.id,
            name: ev.title,
            orderIds: new Set(),
            tickets: 0,
            revenue: 0,
            checkedIn: 0,
          };
        });

        paidTickets.forEach((ticket) => {
          const order = ticket.orders;
          const evId = ticket.event_id;

          if (!uniqueOrdersMap.has(order.id)) {
            uniqueOrdersMap.set(order.id, {
              ...order,
              concertTitle: eventTitleMap[evId] || "Event",
              ticketCount: 0,
              checkedInCount: 0,
            });
          }

          const orderEntry = uniqueOrdersMap.get(order.id);
          orderEntry.ticketCount += 1;
          if (ticket.checked_in) orderEntry.checkedInCount += 1;

          if (reportMap[evId]) {
            reportMap[evId].tickets += 1;
            if (ticket.checked_in) reportMap[evId].checkedIn += 1;

            if (!reportMap[evId].orderIds.has(order.id)) {
              reportMap[evId].orderIds.add(order.id);
              reportMap[evId].revenue += Number(order.total || 0);
            }
          }
        });

        const ordersList = Array.from(uniqueOrdersMap.values()).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        const totalTickets = paidTickets.length;
        const checkedInTickets = paidTickets.filter((t) => t.checked_in).length;
        const totalRevenue = ordersList.reduce(
          (sum, ord) => sum + Number(ord.total || 0),
          0
        );

        setStats({
          totalOrders: ordersList.length,
          totalTickets,
          totalRevenue,
          checkedInTickets,
          pendingCheckIn: Math.max(0, totalTickets - checkedInTickets),
        });

        setEventReports(
          Object.values(reportMap).map((item) => ({
            id: item.id,
            name: item.name,
            orders: item.orderIds.size,
            tickets: item.tickets,
            revenue: item.revenue,
            checkedIn: item.checkedIn,
          }))
        );

        setRecentOrders(ordersList);
      } catch (error) {
        console.error("Gagal memuat dashboard organizer:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#10091b] text-white">
        Memuat Dashboard ENCORE...
      </div>
    );
  }

  return (
    <main className="box-border min-h-screen bg-[#10091b] p-10 text-white max-[700px]:p-[22px]">
      <header className="mb-[35px] flex items-center justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start">
        <div>
          <p className="text-xs font-bold tracking-[2px] text-[#bd83ff]">
            ENCORE ORGANIZER
          </p>
          <h1 className="my-2.5 font-heading text-[32px] font-bold">
            Dashboard
          </h1>
          <p className="text-[#b9a9d0]">Selamat datang, {organizerName}!</p>
        </div>

        <div className="flex flex-wrap gap-3 max-[700px]:w-full">
          <Link
            href="/organizer/events"
            className="inline-block rounded-[10px] border border-[#49316d] bg-[#281b39] px-5 py-[13px] text-[13px] font-bold text-white transition hover:border-[#a766e8]"
          >
            Manajemen Event
          </Link>

          <Link
            href="/organizer/staff"
            className="inline-block rounded-[10px] border border-[#49316d] bg-[#281b39] px-5 py-[13px] text-[13px] font-bold text-white transition hover:border-[#a766e8]"
          >
            Manajemen Petugas
          </Link>

          <Link
            href="/organizer/checkin"
            className="inline-block rounded-[10px] bg-[#a766e8] px-5 py-[13px] text-[13px] font-bold text-white transition hover:brightness-110"
          >
            Scan Tiket →
          </Link>
        </div>
      </header>

      <section className="mb-[35px] grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[700px]:grid-cols-1">
        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">Total Pesanan</span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {stats.totalOrders}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">
            Total Tiket Terjual
          </span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {stats.totalTickets}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">Total Pendapatan</span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {formatPrice(stats.totalRevenue)}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">
            Tiket Sudah Check-in
          </span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {stats.checkedInTickets}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">Belum Check-in</span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {stats.pendingCheckIn}
          </h2>
        </div>
      </section>

      <section className="mb-[25px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
        <div className="mb-5">
          <h2 className="mt-0 font-heading text-xl font-bold">
            Laporan Penjualan per Event
          </h2>
          <p className="mb-[25px] text-[#b9a9d0]">
            Ringkasan performa penjualan event milikmu.
          </p>
        </div>

        {eventReports.length === 0 ? (
          <div className="rounded-[10px] bg-[#160e21] p-[35px] text-center text-[#b9a9d0]">
            Belum ada data penjualan event milikmu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Nama Event</th>
                  <th className={thClass}>Pesanan</th>
                  <th className={thClass}>Tiket Terjual</th>
                  <th className={thClass}>Pendapatan</th>
                  <th className={thClass}>Sudah Check-in</th>
                  <th className={thClass}>Belum Check-in</th>
                </tr>
              </thead>

              <tbody>
                {eventReports.map((event) => (
                  <tr key={event.id}>
                    <td className={tdClass}>{event.name}</td>
                    <td className={tdClass}>{event.orders}</td>
                    <td className={tdClass}>{event.tickets}</td>
                    <td className={tdClass}>{formatPrice(event.revenue)}</td>
                    <td className={tdClass}>
                      <span className="rounded-[20px] bg-[#183d30] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#65e5a4]">
                        {event.checkedIn}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span className="rounded-[20px] bg-[#49351d] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#ffc76a]">
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

      <section className="mb-[25px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
        <h2 className="mt-0 font-heading text-xl font-bold">
          Riwayat Penjualan
        </h2>
        <p className="mb-[25px] text-[#b9a9d0]">
          Daftar transaksi tiket event milikmu yang berhasil dibayar.
        </p>

        {recentOrders.length === 0 ? (
          <div className="rounded-[10px] bg-[#160e21] p-[35px] text-center text-[#b9a9d0]">
            Belum ada transaksi yang berhasil.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Pemesan</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Konser</th>
                  <th className={thClass}>Jumlah Tiket</th>
                  <th className={thClass}>Total Pembayaran</th>
                  <th className={thClass}>Status Check-in</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className={tdClass}>{order.buyer_name || "-"}</td>
                    <td className={tdClass}>{order.buyer_email || "-"}</td>
                    <td className={tdClass}>{order.concertTitle}</td>
                    <td className={tdClass}>{order.ticketCount}</td>
                    <td className={tdClass}>
                      {formatPrice(Number(order.total || 0))}
                    </td>
                    <td className={tdClass}>
                      {order.checkedInCount === order.ticketCount &&
                      order.ticketCount > 0 ? (
                        <span className="rounded-[20px] bg-[#183d30] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#65e5a4]">
                          Sudah Check-in ({order.checkedInCount}/
                          {order.ticketCount})
                        </span>
                      ) : (
                        <span className="rounded-[20px] bg-[#49351d] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#ffc76a]">
                          Belum Check-in ({order.checkedInCount}/
                          {order.ticketCount})
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
    </main>
  );
}