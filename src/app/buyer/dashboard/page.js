"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "../../../data/concerts";
import { supabase } from "../../../lib/supabase";

export default function BuyerDashboardPage() {
  const router = useRouter();

  const [buyer, setBuyer] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const loadBuyerTickets = async () => {
      try {
        // 1. Cek sesi login Buyer
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login?redirect=/buyer/dashboard");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "buyer") {
          router.replace("/login");
          return;
        }

        setBuyer(profile);

        // 2. Ambil seluruh pesanan lunas milik buyer ini
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("buyer_id", user.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false });

        if (ordersError || !ordersData || ordersData.length === 0) {
          setTickets([]);
          return;
        }

        const orderIds = ordersData.map((o) => o.id);
        const ordersMap = Object.fromEntries(
          ordersData.map((o) => [o.id, o])
        );

        // 3. Ambil seluruh e-ticket milik buyer beserta detail event & kategori tiket
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select(
            `
            *,
            events (
              id,
              title,
              artist,
              event_date,
              location,
              venue,
              image_url
            ),
            ticket_types (
              name,
              price
            )
          `
          )
          .in("order_id", orderIds)
          .order("created_at", { ascending: false });

        if (ticketsError) {
          console.error("Gagal memuat tiket:", ticketsError);
          setTickets([]);
          return;
        }

        const enriched = (ticketsData || []).map((t) => ({
          ...t,
          orderInfo: ordersMap[t.order_id] || null,
        }));

        setTickets(enriched);
      } catch (err) {
        console.error("Error memuat dashboard buyer:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBuyerTickets();
  }, [router]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("encoreCurrentUser");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090714] text-white">
        Memuat E-Ticket kamu...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090714] px-[6%] py-10 text-white max-[650px]:px-[5%] max-[650px]:py-7">
      <div className="mx-auto max-w-[1150px]">
        {/* HEADER */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-[#2b2040] pb-6">
          <div>
            <span className="text-[11px] font-extrabold tracking-[2px] text-[#b77aff]">
              ENCORE MY TICKETS
            </span>
            <h1 className="mt-2 font-heading text-3xl font-bold max-[650px]:text-2xl">
              Tiket Saya
            </h1>
            <p className="mt-1 text-sm text-[#a99ab7]">
              Halo, {buyer?.name || "Buyer"}! Semua e-ticket konsermu tersimpan
              di sini.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/concerts"
              className="rounded-[10px] bg-[#8b5cf6] px-5 py-3 text-[13px] font-bold text-white transition hover:bg-[#7c3aed]"
            >
              + Jelajahi Konser
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-[10px] border border-[#49316d] bg-[#1a1226] px-5 py-3 text-[13px] font-semibold text-[#d4aaff] transition hover:bg-[#2a1d3d]"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* DAFTAR E-TICKET */}
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-[#39274b] bg-[#150f24] p-12 text-center">
            <p className="text-4xl">🎟️</p>
            <h2 className="mt-4 font-heading text-xl font-bold">
              Belum Ada E-Ticket
            </h2>
            <p className="mx-auto mt-2 max-w-[420px] text-sm text-[#a99ab7]">
              Kamu belum memiliki tiket konser aktif. Temukan konser favoritmu
              dan pesan tiketnya sekarang!
            </p>
            <Link
              href="/concerts"
              className="mt-6 inline-block rounded-[10px] bg-[#8b5cf6] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#7c3aed]"
            >
              Cari Konser Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 max-[850px]:grid-cols-1">
            {tickets.map((ticket) => {
              const ev = ticket.events || {};
              const tType = ticket.ticket_types || {};
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                ticket.ticket_code
              )}`;

              return (
                <article
                  key={ticket.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#49316d] bg-[#150f24] shadow-[0_10px_30px_#00000035]"
                >
                  <div>
                    {/* TOP BANNER */}
                    <div className="relative h-[160px] bg-[#1f1633]">
                      <img
                        src={ev.image_url || "/images/default-concert.jpg"}
                        alt={ev.title || "Konser"}
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(0deg,#150f24_5%,transparent_80%)]" />

                      <span
                        className={`absolute top-3.5 right-3.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                          ticket.checked_in
                            ? "bg-[#183d30] text-[#65e5a4]"
                            : "bg-[#31214a] text-[#d4aaff]"
                        }`}
                      >
                        {ticket.checked_in
                          ? "✓ Sudah Check-in"
                          : "● Aktif / Siap Digunakan"}
                      </span>
                    </div>

                    {/* DETAIL TIKET */}
                    <div className="p-6">
                      <span className="text-[11px] font-bold tracking-[1.5px] text-[#b77aff]">
                        {tType.name || "REGULAR PASS"}
                      </span>

                      <h2 className="mt-1.5 font-heading text-xl font-bold text-white">
                        {ev.title || "Konser ENCORE"}
                      </h2>

                      <div className="mt-4 flex flex-col gap-2 border-y border-[#322447] py-4 text-xs text-[#c9bed8]">
                        <p>📅 {formatDate(ev.event_date)}</p>
                        <p>
                          📍 {ev.venue || ev.location || "Venue Konser"}
                        </p>
                        <p>👤 Pemegang: {ticket.holder_name || buyer?.name}</p>
                        <p>
                          💳 Harga:{" "}
                          {formatPrice(Number(tType.price || 0))}
                        </p>
                      </div>

                      {/* KODE & QR */}
                      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-dashed border-[#62447c] bg-[#0e091a] p-4">
                        <div className="min-w-0">
                          <span className="block text-[10px] font-bold tracking-[1.5px] text-[#a99ab7]">
                            KODE E-TICKET
                          </span>
                          <strong className="mt-1 block text-base tracking-[1px] [overflow-wrap:anywhere] text-[#d4aaff]">
                            {ticket.ticket_code}
                          </strong>
                          <button
                            type="button"
                            onClick={() => setSelectedTicket(ticket)}
                            className="mt-2.5 cursor-pointer rounded-md border border-[#5d3d8a] bg-[#241738] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#8b5cf6]"
                          >
                            Perbesar QR Code
                          </button>
                        </div>

                        <img
                          src={qrUrl}
                          alt={`QR ${ticket.ticket_code}`}
                          className="size-[92px] shrink-0 rounded-lg bg-white p-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL PERBESAR QR CODE */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-[380px] rounded-2xl border border-[#5d3d8a] bg-[#160f26] p-7 text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] font-extrabold tracking-[2px] text-[#b77aff]">
              ENCORE E-TICKET PASS
            </span>
            <h3 className="mt-2 font-heading text-lg font-bold">
              {selectedTicket.events?.title || "Konser ENCORE"}
            </h3>
            <p className="mt-1 text-xs text-[#a99ab7]">
              {selectedTicket.ticket_types?.name || "Regular"} •{" "}
              {selectedTicket.holder_name}
            </p>

            <div className="mx-auto my-6 inline-block rounded-2xl bg-white p-3.5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                  selectedTicket.ticket_code
                )}`}
                alt={selectedTicket.ticket_code}
                className="size-[220px]"
              />
            </div>

            <strong className="block text-lg tracking-[1px] text-[#d4aaff]">
              {selectedTicket.ticket_code}
            </strong>
            <p className="mt-1.5 text-[11px] text-[#a99ab7]">
              Tunjukkan QR Code ini kepada petugas check-in di pintu masuk.
            </p>

            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="mt-5 w-full cursor-pointer rounded-lg bg-[#8b5cf6] py-3 text-xs font-bold text-white transition hover:bg-[#7c3aed]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}