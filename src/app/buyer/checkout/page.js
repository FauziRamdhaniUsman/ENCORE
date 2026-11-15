"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { concerts, formatPrice } from "../../../data/concerts";
import { supabase } from "../../../lib/supabase";

const pageWrapperClass =
  "min-h-screen bg-[linear-gradient(180deg,rgba(9,7,20,0.82),rgba(9,7,20,0.97)),url('/images/bg%20konser.jpg')] bg-cover bg-fixed bg-top px-[6%] py-[45px] text-white max-[800px]:bg-scroll max-[800px]:px-[5%] max-[800px]:py-[30px]";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const concertId = searchParams.get("concertId");
  const ticketTypeId = searchParams.get("ticketTypeId");
  const ticketIndex = Number(searchParams.get("ticketIndex") || 0);
  const quantity = Math.min(
    4,
    Math.max(1, Number(searchParams.get("quantity") || 1))
  );

  const [user, setUser] = useState(null);
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sameAsAccount, setSameAsAccount] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const initCheckout = async () => {
      try {
        // 1. Cek sesi login Buyer di Supabase Auth
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          const returnUrl = window.location.pathname + window.location.search;
          router.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (!profile || profile.role !== "buyer") {
          router.replace("/login");
          return;
        }

        setUser(profile);
        setName(profile.name || "");
        setEmail(profile.email || authUser.email || "");
        setPhone(profile.phone || "");

        // 2. Ambil detail konser (bawaan atau dari tabel 'events' Supabase)
        if (!concertId) {
          setLoading(false);
          return;
        }

        const staticConcert = concerts.find(
          (item) => String(item.id) === String(concertId)
        );

        if (staticConcert) {
          setConcert(staticConcert);
          setLoading(false);
          return;
        }

        const { data: ev, error: evError } = await supabase
          .from("events")
          .select(
            `
            *,
            ticket_types (
              id,
              name,
              description,
              price,
              quota
            )
          `
          )
          .eq("id", concertId)
          .maybeSingle();

        if (!evError && ev) {
          const parsedDate = ev.event_date ? new Date(ev.event_date) : null;
          const formattedDate =
            parsedDate && !Number.isNaN(parsedDate.getTime())
              ? parsedDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ev.event_date || "-";

          const mappedTickets = Array.isArray(ev.ticket_types)
            ? ev.ticket_types
                .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
                .map((t) => ({
                  id: t.id,
                  name: t.name,
                  description: t.description || "General admission",
                  price: Number(t.price || 0),
                  quota: Number(t.quota || 0),
                }))
            : [];

          setConcert({
            id: ev.id,
            isSupabase: true,
            title: ev.title,
            image: ev.image_url || "/images/default-concert.jpg",
            date: formattedDate,
            location: ev.location || ev.venue || "Indonesia",
            venue: ev.venue || "",
            price: mappedTickets[0]?.price || 0,
            tickets: mappedTickets,
          });
        }
      } catch (err) {
        console.error("Gagal memuat checkout:", err);
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [concertId, router]);

  const tickets = concert?.tickets?.length
    ? concert.tickets
    : concert
      ? [
          {
            name: "Regular",
            description: "General admission",
            price: concert.price,
          },
        ]
      : [];

  const selectedTicket =
    (ticketTypeId && tickets.find((t) => String(t.id) === String(ticketTypeId))) ||
    tickets[ticketIndex] ||
    tickets[0];

  const subtotal = selectedTicket ? selectedTicket.price * quantity : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const handleSameAsAccount = (checked) => {
    setSameAsAccount(checked);

    if (checked && user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }

    if (!checked) {
      setName("");
      setEmail("");
      setPhone("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Nama, email, dan nomor HP wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    if (!/^[0-9+\-\s]{9,16}$/.test(phone.trim())) {
      setError("Nomor HP tidak valid.");
      return;
    }

    if (!concert || !selectedTicket) {
      setError("Data konser atau tiket tidak ditemukan.");
      return;
    }

    const order = {
      id: `ENC-${Date.now()}`,
      userId: user?.id || null,

      buyerName: name.trim(),
      buyerEmail: email.trim(),
      buyerPhone: phone.trim(),

      concertId: concert.id,
      isSupabaseEvent: Boolean(concert.isSupabase),
      concertTitle: concert.title,
      concertImage: concert.image,
      concertDate: concert.date,
      concertLocation: concert.location,

      ticketTypeId: selectedTicket.id || null,
      ticketName: selectedTicket.name,
      ticketPrice: selectedTicket.price,

      ticketQuantity: quantity,
      quantity: quantity,

      personsPerPackage: selectedTicket.persons || 1,
      totalPersons: (selectedTicket.persons || 1) * quantity,

      subtotal,
      serviceFee,
      total,

      status: "waiting_payment",
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("encorePendingOrder", JSON.stringify(order));
      router.push("/buyer/payment");
    } catch {
      setError("Pesanan gagal disimpan. Silakan coba kembali.");
    }
  };

  if (loading) {
    return (
      <main className={pageWrapperClass}>
        <p className="py-[100px] text-center text-[#c4b5fd]">
          Memuat checkout...
        </p>
      </main>
    );
  }

  if (!concert || !selectedTicket) {
    return (
      <main className={pageWrapperClass}>
        <div className="mx-auto my-[100px] max-w-[500px] rounded-[15px] border border-[#49316d] bg-[#110c20] p-[30px] text-center">
          <h2 className="font-heading text-xl font-bold">
            Pesanan tidak ditemukan
          </h2>
          <p className="my-[15px] text-sm text-[#aaa1bd]">
            Silakan pilih konser terlebih dahulu.
          </p>
          <Link href="/concerts" className="text-sm text-[#c4b5fd] underline">
            Kembali ke daftar konser
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageWrapperClass}>
      <div className="mx-auto max-w-[1180px]">
        <Link
          href={`/concerts/${concert.id}`}
          className="text-[13px] text-[#c4b5fd] hover:text-white"
        >
          ← Kembali ke detail konser
        </Link>

        <header className="my-7">
          <span className="text-[11px] font-extrabold tracking-[2px] text-primary-light">
            ENCORE TICKETING
          </span>
          <h1 className="my-[9px] font-heading text-[clamp(28px,4vw,38px)] font-bold">
            Data Pemesan
          </h1>
          <p className="text-sm leading-[1.7] text-[#aaa1bd]">
            Pastikan data pemesan sudah benar untuk kelancaran proses pemesanan
            tiket.
          </p>
        </header>

        <form
          className="grid grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)] items-start gap-6 max-[800px]:grid-cols-1"
          onSubmit={handleSubmit}
        >
          <section className="rounded-[17px] border border-[#49316d] bg-[#110c20f5] p-[27px] shadow-[0_12px_35px_#00000035] max-[800px]:p-[21px]">
            <div className="mb-6">
              <div className="flex items-center gap-[13px]">
                <span className="grid size-[35px] place-items-center rounded-[9px] bg-[#8b5cf625] font-extrabold text-[#c4b5fd]">
                  01
                </span>
                <h2 className="font-heading text-xl font-bold">
                  Informasi Pemesan
                </h2>
              </div>
              <p className="mt-[9px] ml-12 text-xs leading-[1.7] text-[#aaa1bd]">
                Lengkapi informasi kontak kamu.
              </p>
            </div>

            <label className="mb-[19px] flex cursor-pointer items-center gap-[11px] text-[13px] text-[#e8e0f5]">
              <input
                type="checkbox"
                checked={sameAsAccount}
                onChange={(e) => handleSameAsAccount(e.target.checked)}
                className="peer pointer-events-none absolute opacity-0"
              />
              <span className="grid size-[22px] place-items-center rounded-full border border-[#625278] text-xs text-transparent transition peer-checked:border-primary-light peer-checked:bg-primary peer-checked:text-white">
                ✓
              </span>
              <span>Sama dengan data akun</span>
            </label>

            <div className="flex gap-2.5 rounded-[9px] bg-[#8b5cf619] px-[15px] py-[13px] text-[11px] leading-[1.6] text-[#c8b8e4]">
              <span className="text-primary-light">ⓘ</span>
              <span>
                Data ini digunakan untuk konfirmasi pesanan dan pengiriman
                e-ticket.
              </span>
            </div>

            <div className="mt-[25px] flex flex-col gap-5">
              <div className="flex flex-col gap-[9px]">
                <label
                  htmlFor="buyer-name"
                  className="text-[13px] font-semibold text-[#eee9f8]"
                >
                  Nama Lengkap
                </label>
                <input
                  id="buyer-name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-[54px] w-full rounded-[10px] border border-[#493d61] bg-[#0c0918] px-[17px] text-[13px] text-white outline-none placeholder:text-[#827990] focus:border-primary-light focus:shadow-[0_0_0_3px_#8b5cf620]"
                />
              </div>

              <div className="flex flex-col gap-[9px]">
                <label
                  htmlFor="buyer-phone"
                  className="text-[13px] font-semibold text-[#eee9f8]"
                >
                  Nomor HP
                </label>
                <div className="flex items-center overflow-hidden rounded-[10px] border border-[#493d61] bg-[#0c0918] focus-within:border-primary-light">
                  <span className="border-r border-[#493d61] px-3.5 text-[13px] whitespace-nowrap text-[#d8c4ff]">
                    🇮🇩 +62
                  </span>
                  <input
                    id="buyer-phone"
                    type="tel"
                    placeholder="Masukkan nomor HP"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-[54px] w-full border-0 bg-transparent px-[17px] text-[13px] text-white outline-none placeholder:text-[#827990]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[9px]">
                <label
                  htmlFor="buyer-email"
                  className="text-[13px] font-semibold text-[#eee9f8]"
                >
                  Email
                </label>
                <input
                  id="buyer-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-[54px] w-full rounded-[10px] border border-[#493d61] bg-[#0c0918] px-[17px] text-[13px] text-white outline-none placeholder:text-[#827990] focus:border-primary-light focus:shadow-[0_0_0_3px_#8b5cf620]"
                />
                <small className="text-[11px] text-[#9990aa]">
                  E-ticket dan informasi pesanan akan dikirim ke email ini.
                </small>
              </div>
            </div>

            {error && (
              <p className="mt-[18px] text-xs text-[#fca5a5]" role="alert">
                {error}
              </p>
            )}
          </section>

          <aside className="rounded-[17px] border border-[#49316d] bg-[#110c20f5] p-[27px] shadow-[0_12px_35px_#00000035] max-[800px]:p-[21px]">
            <div className="flex items-center gap-3.5">
              <img
                src={concert.image || "/images/default-concert.jpg"}
                alt={concert.title}
                className="h-[75px] w-[65px] shrink-0 rounded-[9px] object-cover"
              />

              <div className="flex flex-1 items-start justify-between gap-2.5">
                <h3 className="font-heading text-sm leading-normal font-bold">
                  {concert.title}
                </h3>
                <button
                  type="button"
                  onClick={() => router.push(`/concerts/${concert.id}`)}
                  className="shrink-0 cursor-pointer border-0 bg-transparent text-xs font-bold text-primary-light hover:underline"
                >
                  Detail
                </button>
              </div>
            </div>

            <div className="my-5 h-px bg-[#392e4d]" />

            <div>
              <strong className="text-sm text-[#f5f1fc]">
                {selectedTicket.name}
              </strong>
            </div>

            <div className="mt-[15px] flex items-center gap-[9px] text-[13px] text-[#f5f1fc]">
              {quantity} {selectedTicket.persons ? "Paket" : "Tiket"}
              <span className="text-[#827990]">•</span>
              {selectedTicket.persons
                ? `Peserta ${selectedTicket.persons * quantity}`
                : `Pax ${quantity}`}
            </div>

            <div className="my-5 h-px bg-[#392e4d]" />

            <div className="flex flex-col gap-[7px]">
              <span className="text-xs text-[#aaa1bd]">Tanggal Konser</span>
              <strong className="text-sm text-[#f5f1fc]">{concert.date}</strong>
            </div>

            <div className="my-5 h-px bg-[#392e4d]" />

            <div className="my-[22px] flex flex-col gap-[19px]">
              <div className="flex items-start gap-[13px]">
                <span className="w-[23px] shrink-0 text-lg text-primary-light">
                  🚫
                </span>
                <p className="text-[13px] leading-[1.6] text-[#eee9f8]">
                  Refund not allowed
                </p>
              </div>
              <div className="flex items-start gap-[13px]">
                <span className="w-[23px] shrink-0 text-lg text-primary-light">
                  ⚡
                </span>
                <p className="text-[13px] leading-[1.6] text-[#eee9f8]">
                  Instant Confirmation
                </p>
              </div>
              <div className="flex items-start gap-[13px]">
                <span className="w-[23px] shrink-0 text-lg text-primary-light">
                  💺
                </span>
                <p className="text-[13px] leading-[1.6] text-[#eee9f8]">
                  Seat assigned automatically
                  <small className="mt-1 block text-[11px] leading-[1.6] text-[#aaa1bd]">
                    Informasi tempat duduk mengikuti ketentuan penyelenggara.
                  </small>
                </p>
              </div>
              <div className="flex items-start gap-[13px]">
                <span className="w-[23px] shrink-0 text-lg text-primary-light">
                  ⌛
                </span>
                <p className="text-[13px] leading-[1.6] text-[#eee9f8]">
                  Valid on <strong>{concert.date}</strong>
                </p>
              </div>
            </div>

            <div className="mx-[-27px] mt-5 rounded-b-[15px] border-t-8 border-[#241b35] bg-[#100b20] px-[27px] py-[18px] max-[800px]:mx-[-21px] max-[800px]:px-[21px]">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2.5 [&::-webkit-details-marker]:hidden">
                  <span className="text-xs text-[#c5bad8]">Total Payment</span>
                  <strong className="text-right text-[17px] text-[#c4b5fd]">
                    {formatPrice(total)}
                  </strong>
                  <span className="text-[21px] text-[#c4b5fd] transition-transform duration-200 group-open:rotate-180">
                    ⌄
                  </span>
                </summary>

                <div className="flex flex-col gap-[13px] pt-5">
                  <div className="flex justify-between gap-2.5 text-xs">
                    <span className="text-[#aaa1bd]">Harga Tiket</span>
                    <strong className="text-white">
                      {formatPrice(selectedTicket.price)}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-2.5 text-xs">
                    <span className="text-[#aaa1bd]">Jumlah</span>
                    <strong className="text-white">{quantity}</strong>
                  </div>
                  <div className="flex justify-between gap-2.5 text-xs">
                    <span className="text-[#aaa1bd]">Subtotal</span>
                    <strong className="text-white">
                      {formatPrice(subtotal)}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-2.5 text-xs">
                    <span className="text-[#aaa1bd]">Biaya Layanan</span>
                    <strong className="text-white">
                      {formatPrice(serviceFee)}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-2.5 border-t border-[#493d61] pt-[13px] text-xs">
                    <span className="text-[#aaa1bd]">Total</span>
                    <strong className="text-[#c4b5fd]">
                      {formatPrice(total)}
                    </strong>
                  </div>
                </div>
              </details>
            </div>

            <button
              type="submit"
              className="mt-5 min-h-[50px] w-full cursor-pointer rounded-[10px] border-0 bg-[linear-gradient(100deg,#7c3aed,#a855f7)] text-[13px] font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              Lanjutkan ke Pembayaran →
            </button>

            <p className="mt-3.5 text-center text-[11px] text-[#9990aa]">
              🔒 Transaksi resmi ENCORE
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className={pageWrapperClass}>
          <p className="py-[100px] text-center text-[#c4b5fd]">
            Memuat checkout...
          </p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}