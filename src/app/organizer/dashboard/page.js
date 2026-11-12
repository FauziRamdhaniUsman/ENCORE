"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrganizerDashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [organizerName, setOrganizerName] = useState("Organizer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      if (!user || user.role !== "organizer") {
        router.replace("/login");
        return;
      }

      const currentOrganizerId = String(user.id);
      const currentOrganizerEmail = String(user.email || "").toLowerCase();
      const currentOrganizerName = String(
        user.organization || user.name || ""
      ).toLowerCase();

      setOrganizerName(user.organization || user.name || "Organizer");

      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      const savedEvents = JSON.parse(
        localStorage.getItem("encoreCustomConcerts") || "[]"
      );

      const myEventIds = Array.isArray(savedEvents)
        ? savedEvents
            .filter((event) => {
              const eventOrganizerId =
                event.organizerId ?? event.createdBy ?? event.userId;

              return (
                eventOrganizerId != null &&
                String(eventOrganizerId) === currentOrganizerId
              );
            })
            .map((event) => String(event.id))
        : [];

      const myEventNames = Array.isArray(savedEvents)
        ? savedEvents
            .filter((event) => {
              const eventOrganizerId =
                event.organizerId ?? event.createdBy ?? event.userId;

              return (
                eventOrganizerId != null &&
                String(eventOrganizerId) === currentOrganizerId
              );
            })
            .map((event) =>
              String(event.title || event.name || "").toLowerCase()
            )
        : [];

      const myOrders = Array.isArray(savedOrders)
        ? savedOrders.filter((order) => {
            if (order.status !== "paid") {
              return false;
            }

            const orderOrganizerId =
              order.organizerId ?? order.createdBy ?? order.userIdOrganizer;

            const orderOrganizerEmail = String(
              order.organizerEmail || ""
            ).toLowerCase();

            const organizerValue =
              typeof order.organizer === "string"
                ? order.organizer
                : order.organizer?.name ||
                  order.organizer?.organization ||
                  "";

            const orderOrganizerName = String(organizerValue).toLowerCase();

            const orderEventId = String(
              order.concertId ?? order.eventId ?? ""
            );

            const orderEventName = String(
              order.concertTitle || order.eventName || ""
            ).toLowerCase();

            if (orderOrganizerId != null) {
              return String(orderOrganizerId) === currentOrganizerId;
            }

            if (orderOrganizerEmail) {
              return orderOrganizerEmail === currentOrganizerEmail;
            }

            if (orderEventId && myEventIds.includes(orderEventId)) {
              return true;
            }

            if (orderEventName && myEventNames.includes(orderEventName)) {
              return true;
            }

            if (orderOrganizerName && currentOrganizerName) {
              return orderOrganizerName === currentOrganizerName;
            }

            return false;
          })
        : [];

      setOrders(myOrders);
    } catch (error) {
      console.error("Gagal membaca transaksi:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const getQuantity = (order) =>
    Number(
      order.ticketQuantity ?? order.quantity ?? order.totalPersons ?? 1
    );

  const totalTickets = orders.reduce(
    (total, order) => total + getQuantity(order),
    0
  );

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );

  const checkedInTickets = orders.reduce(
    (total, order) =>
      total +
      (order.checkInStatus === "checked_in" ? getQuantity(order) : 0),
    0
  );

  const pendingCheckIn = Math.max(0, totalTickets - checkedInTickets);

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  const eventReports = Object.values(
    orders.reduce((groups, order) => {
      const eventName =
        order.concertTitle || order.eventName || "Event Tanpa Nama";

      if (!groups[eventName]) {
        groups[eventName] = {
          name: eventName,
          orders: 0,
          tickets: 0,
          revenue: 0,
          checkedIn: 0,
        };
      }

      const quantity = getQuantity(order);

      groups[eventName].orders += 1;
      groups[eventName].tickets += quantity;
      groups[eventName].revenue += Number(order.total || 0);

      if (order.checkInStatus === "checked_in") {
        groups[eventName].checkedIn += quantity;
      }

      return groups;
    }, {})
  );

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
            className="inline-block rounded-[10px] border border-[#49316d] bg-[#281b39] px-5 py-[13px] text-[13px] font-bold text-white"
          >
            Manajemen Event
          </Link>

          <Link
            href="/organizer/staff"
            className="inline-block rounded-[10px] border border-[#49316d] bg-[#281b39] px-5 py-[13px] text-[13px] font-bold text-white"
          >
            Manajemen Petugas
          </Link>

          <Link
            href="/organizer/checkin"
            className="inline-block rounded-[10px] bg-[#a766e8] px-5 py-[13px] text-[13px] font-bold text-white"
          >
            Scan Tiket →
          </Link>
        </div>
      </header>

      <section className="mb-[35px] grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[700px]:grid-cols-1">
        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">Total Pesanan</span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {orders.length}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">
            Total Tiket Terjual
          </span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {totalTickets}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">Total Pendapatan</span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {formatPrice(totalRevenue)}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">
            Tiket Sudah Check-in
          </span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {checkedInTickets}
          </h2>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
          <span className="text-[13px] text-[#b9a9d0]">Belum Check-in</span>
          <h2 className="mt-[15px] mb-0 font-heading text-[27px] text-[#c58aff]">
            {pendingCheckIn}
          </h2>
        </div>
      </section>

      <section className="mb-[25px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
        <div className="mb-5">
          <div>
            <h2 className="mt-0 font-heading text-xl font-bold">
              Laporan Penjualan per Event
            </h2>
            <p className="mb-[25px] text-[#b9a9d0]">
              Ringkasan performa penjualan event milikmu.
            </p>
          </div>
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
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Nama Event
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Pesanan
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Tiket Terjual
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Pendapatan
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Sudah Check-in
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Belum Check-in
                  </th>
                </tr>
              </thead>

              <tbody>
                {eventReports.map((event, index) => (
                  <tr key={`${event.name}-${index}`}>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {event.name}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {event.orders}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {event.tickets}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {formatPrice(event.revenue)}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      <span className="rounded-[20px] bg-[#183d30] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#65e5a4]">
                        {event.checkedIn}
                      </span>
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
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

        {orders.length === 0 ? (
          <div className="rounded-[10px] bg-[#160e21] p-[35px] text-center text-[#b9a9d0]">
            Belum ada transaksi yang berhasil.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Pemesan
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Email
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Konser
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Jumlah Tiket
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Total Pembayaran
                  </th>
                  <th className="border-b border-[#39274b] p-4 text-left text-xs whitespace-nowrap text-[#bd83ff]">
                    Status Check-in
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={`${
                      order.id || order.ticketCode || "order"
                    }-${index}`}
                  >
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {order.buyerName || "-"}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {order.buyerEmail || "-"}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {order.concertTitle || order.eventName || "-"}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {getQuantity(order)}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {formatPrice(Number(order.total || 0))}
                    </td>
                    <td className="border-b border-[#39274b] p-4 text-[13px] text-[#eee5fa]">
                      {order.checkInStatus === "checked_in" ? (
                        <span className="rounded-[20px] bg-[#183d30] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#65e5a4]">
                          Sudah Check-in
                        </span>
                      ) : (
                        <span className="rounded-[20px] bg-[#49351d] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#ffc76a]">
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
    </main>
  );
}