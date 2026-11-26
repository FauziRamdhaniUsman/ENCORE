"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "../../../lib/format";
import { formatEventDate } from "../../../lib/events";
import { supabase } from "../../../lib/supabase";

const pageBg =
  "relative isolate min-h-screen w-full bg-[#090714] bg-[image:linear-gradient(180deg,rgba(9,7,20,0.48)_0%,rgba(9,7,20,0.70)_48%,rgba(9,7,20,0.88)_100%),url('/images/bg%20konser.jpg')] bg-cover bg-[position:center_top] bg-fixed bg-no-repeat text-white antialiased max-[700px]:bg-scroll";

const loadingBox = "flex min-h-screen items-center justify-center text-white";

const primaryBtn =
  "inline-flex cursor-pointer items-center justify-center gap-3 rounded-[10px] border-none bg-primary px-[24px] py-3.5 text-center text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7c3aed] hover:shadow-[0_8px_25px_#8b5cf640] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-primary disabled:hover:shadow-none";

const panel =
  "rounded-2xl border border-border bg-surface p-[30px] max-[700px]:p-[22px]";
const panelTitle = "mb-2 font-heading text-[27px] font-bold max-[700px]:text-[24px]";
const muted = "text-[15px] leading-[1.8] text-[#c4bbd6]";
const demoNote = "mt-[18px] text-[13px] leading-[1.7] text-[#a79ebb]";

const descP = "mb-[15px] text-[15px] leading-[1.9] text-[#cfc6e0]";

const tabClass = (active) =>
  `cursor-pointer border-0 border-b-2 bg-transparent px-4 py-[13px] text-[15px] font-bold hover:text-primary-light max-[480px]:px-[9px] max-[480px]:py-3 max-[480px]:text-[13px] ${
    active
      ? "border-primary text-primary-light"
      : "border-transparent text-[#b9aed0]"
  }`;

const ticketCardClass = (isVip, isSelected, soldOut) => {
  const dim = soldOut ? " opacity-60" : "";

  if (isVip) {
    return `overflow-hidden rounded-[13px] border-2 transition-all duration-200${dim} ${
      isSelected
        ? "border-[#e7bd75] bg-[linear-gradient(135deg,#573022,#30202b_65%,#151126)] shadow-[0_0_28px_#d6a45d28]"
        : "border-[#b58a50] bg-[linear-gradient(135deg,#49251e,#281923_65%,#151126)] hover:border-[#e7bd75] hover:bg-[linear-gradient(135deg,#573022,#30202b_65%,#151126)] hover:shadow-[0_0_28px_#d6a45d28]"
    }`;
  }

  return `overflow-hidden rounded-[13px] border transition-all duration-200${dim} ${
    isSelected
      ? "border-[#a78bfa] bg-[#211735] shadow-[0_0_0_1px_#8b5cf62b]"
      : "border-border bg-[#090714] hover:border-primary"
  }`;
};

const mapLink =
  "inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-[10px] border px-[19px] py-[13px] text-sm font-bold transition duration-[250ms] hover:-translate-y-0.5 max-[700px]:w-full";

const summaryRow =
  "mb-5 flex justify-between gap-[15px] text-sm max-[480px]:flex-wrap";
const summaryValue = "text-right font-bold [overflow-wrap:anywhere]";
const qtyBtn =
  "size-9 cursor-pointer rounded-[8px] border border-[#49316d] bg-background text-[19px] text-white disabled:cursor-not-allowed disabled:opacity-40";

function Icon({ name, className = "size-5" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "mic") {
    return (
      <svg {...common}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg {...common}>
        <path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7Z" />
        <path d="M9 4v13M15 7v13" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconBox({ name, size = "size-11" }) {
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-xl border border-[#a78bfa45] bg-[#8b5cf625] text-primary-light`}
    >
      <Icon name={name} />
    </span>
  );
}

function ConcertDetailContent({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState("description");
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [concert, setConcert] = useState(null);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchConcertDetail = async () => {
      try {
        const { data: ev, error } = await supabase
          .from("events")
          .select(
            `
            *,
            ticket_types (
              id,
              name,
              description,
              price,
              quota,
              color,
              is_vip,
              benefits
            )
          `
          )
          .eq("id", id)
          .maybeSingle();

        if (cancelled) return;

        if (error || !ev) {
          if (error) console.error("Gagal membaca detail konser:", error);
          setConcert(null);
          return;
        }

        const { text: formattedDate } = formatEventDate(ev.event_date);

        const mappedTickets = Array.isArray(ev.ticket_types)
          ? [...ev.ticket_types]
              .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
              .map((t) => ({
                id: t.id,
                name: t.name,
                description: t.description || "General admission",
                price: Number(t.price || 0),
                quota:
                  t.quota === null || t.quota === undefined
                    ? null
                    : Number(t.quota),
                color: t.color || "#8B5CF6",
                isVip: Boolean(t.is_vip),
                benefits: Array.isArray(t.benefits)
                  ? t.benefits
                  : typeof t.benefits === "string"
                    ? t.benefits
                        .split(/\r?\n|,/)
                        .map((item) => item.trim())
                        .filter(Boolean)
                    : [],
              }))
          : [];

        setConcert({
          id: ev.id,
          title: ev.title,
          subtitle: ev.subtitle || ev.artist || "",
          artist: ev.artist || "ENCORE Artist",
          date: formattedDate,
          location: ev.location || ev.city || ev.venue || "Indonesia",
          venue: ev.venue || "",
          description: ev.description || "",
          image: ev.image_url || "/images/default-concert.jpg",

          // Denah dari kolom seating_plan_url
          seatingPlan: ev.seating_plan_url || "",

          // Syarat dan ketentuan dari organizer
          notes: ev.terms_and_conditions
            ? ev.terms_and_conditions
                .split(/\r?\n/)
                .map((item) => item.trim())
                .filter(Boolean)
            : Array.isArray(ev.notes)
              ? ev.notes
              : [],

          price: mappedTickets[0]?.price || 0,
          tickets: mappedTickets,
        });
      } catch (error) {
        console.error("Gagal membaca detail konser:", error);
        if (!cancelled) setConcert(null);
      } finally {
        if (!cancelled) setEventsLoaded(true);
      }
    };

    fetchConcertDetail();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!eventsLoaded) {
    return (
      <main className={pageBg}>
        <div className={loadingBox}>Memuat detail konser...</div>
      </main>
    );
  }

  if (!concert) {
    return (
      <main className="min-h-[70vh] bg-background px-[7%] py-[100px] text-center text-white">
        <h1 className="font-heading text-[32px] font-bold">
          Konser Tidak Ditemukan
        </h1>
        <p className="mt-[18px] mb-[25px] text-muted">
          Konser yang kamu cari belum tersedia.
        </p>
        <Link href="/concerts" className={primaryBtn}>
          Kembali ke Concerts
        </Link>
      </main>
    );
  }

  const tickets =
    concert.tickets && concert.tickets.length > 0
      ? concert.tickets
      : [
          {
            name: "Regular",
            description: "General admission",
            price: concert.price,
            color: "#8B5CF6",
          },
        ];

  const hasQuota = (ticket) =>
    ticket.quota !== null && ticket.quota !== undefined;
  const isSoldOut = (ticket) => hasQuota(ticket) && ticket.quota <= 0;

  const activeTicket = tickets[selectedTicket] ?? tickets[0];
  const activeSoldOut = isSoldOut(activeTicket);
  const maxQuantity = hasQuota(activeTicket)
    ? Math.max(1, Math.min(4, activeTicket.quota))
    : 4;
  const subtotal = activeTicket.price * quantity;

  const venueName = concert.venue?.trim() || "";

  const hasSpecificVenue =
    venueName.length > 0 &&
    venueName.toLowerCase() !== concert.location?.trim().toLowerCase();

  const venueQuery = hasSpecificVenue
    ? `${venueName}, ${concert.location}, Indonesia`
    : "";

  const googleMapsEmbed = venueQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        venueQuery
      )}&output=embed`
    : "";

  const googleMapsLink = venueQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        venueQuery
      )}`
    : "";

  const googleMapsDirections = venueQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        venueQuery
      )}`
    : "";

  const handleContinueBooking = () => {
    if (activeSoldOut) return;

    const query = new URLSearchParams({
      concertId: String(concert.id),
      ticketIndex: String(selectedTicket),
      quantity: String(quantity),
    });

    if (activeTicket.id) {
      query.set("ticketTypeId", String(activeTicket.id));
    }

    router.push(`/buyer/checkout?${query.toString()}`);
  };

  return (
    <main className={pageBg}>
      {/* BREADCRUMB */}

      <div className="flex flex-wrap items-center gap-3 px-[7%] py-7 text-sm text-[#b9aed0] max-[700px]:px-[5%] max-[700px]:py-[22px] max-[700px]:text-[13px]">
        <Link href="/" className="hover:text-primary-light">
          Home
        </Link>
        <span>/</span>
        <Link href="/concerts" className="hover:text-primary-light">
          Concerts
        </Link>
        <span>/</span>
        <span className="text-white">{concert.title}</span>
      </div>

      {/* BANNER */}

      <section className="relative isolate mx-[7%] mb-[45px] overflow-hidden rounded-[20px] border border-border max-[700px]:mx-[5%] max-[700px]:mb-[30px]">
        <img
          src={concert.image || "/images/default-concert.jpg"}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 size-full scale-125 object-cover opacity-60 blur-2xl"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#090714f0_0%,#090714b8_55%,#090714d9_100%)]" />

        <div className="grid grid-cols-[260px_minmax(0,1fr)] items-center gap-[45px] p-[45px] max-[900px]:grid-cols-[200px_minmax(0,1fr)] max-[900px]:gap-[30px] max-[900px]:p-[30px] max-[700px]:grid-cols-1 max-[700px]:gap-[22px] max-[700px]:p-[22px]">
          <div className="mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-[14px] border border-[#ffffff22] bg-[#211735] shadow-[0_22px_50px_rgba(0,0,0,0.5)] max-[700px]:max-w-[190px]">
            <img
              src={concert.image || "/images/default-concert.jpg"}
              alt={`Poster ${concert.title}`}
              className="size-full object-cover"
            />
          </div>

          <div className="min-w-0 max-[700px]:text-center">
            <h1 className="font-heading text-[clamp(32px,4.4vw,54px)] leading-[1.12] font-extrabold tracking-[-1px] [overflow-wrap:anywhere]">
              {concert.title}
            </h1>

            <p className="mt-3 text-lg font-medium text-[#e4daf2] max-[700px]:text-base">
              {concert.subtitle || concert.artist}
            </p>

            <div className="mt-6 flex flex-col gap-3 text-[15px] font-semibold text-[#f1eaff] max-[700px]:items-center">
              <div className="flex items-center gap-3">
                <span className="text-primary-light">
                  <Icon name="calendar" />
                </span>
                <span>{concert.date}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-primary-light">
                  <Icon name="pin" />
                </span>
                <span className="[overflow-wrap:anywhere]">
                  {concert.venue || concert.location}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 max-[700px]:justify-center">
              <a href="#select-tickets" className={primaryBtn}>
                Pilih Tiket
              </a>

              <div className="text-left">
                <small className="block text-xs text-[#b9aed0]">
                  Mulai dari
                </small>
                <strong className="text-xl font-bold text-[#d7c4ff]">
                  {formatPrice(tickets[0]?.price ?? concert.price)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYOUT */}

      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)] items-start gap-7 px-[7%] pb-[90px] max-[900px]:grid-cols-1 max-[900px]:pb-[120px] max-[700px]:px-[5%]">
        <div className="flex min-w-0 flex-col gap-[25px]">
          {/* DESKRIPSI / SYARAT */}

          <section className={panel}>
            <div className="mb-[25px] flex gap-3 border-b border-border max-[480px]:gap-1">
              <button
                type="button"
                className={tabClass(activeTab === "description")}
                onClick={() => setActiveTab("description")}
              >
                Deskripsi
              </button>

              <button
                type="button"
                className={tabClass(activeTab === "terms")}
                onClick={() => setActiveTab("terms")}
              >
                Syarat & Ketentuan
              </button>
            </div>

            {activeTab === "description" ? (
              <div>
                <h3 className="mb-[18px] font-heading text-[22px] font-bold">
                  Tentang Konser
                </h3>

                <p className={descP}>
                  {concert.description ||
                    "Temukan pengalaman konser yang berkesan bersama ENCORE."}
                </p>

                <p className={descP}>
                  Pilih kategori tiket, lihat denah, dan siapkan dirimu untuk
                  momen yang tak terlupakan.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="mb-[18px] font-heading text-[22px] font-bold">
                  Syarat & Ketentuan
                </h3>

                {concert.notes && concert.notes.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {concert.notes.map((note, index) => (
                      <li key={index} className={descP}>
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="list-disc pl-5">
                    <li className={descP}>
                      E-ticket yang sudah dibeli tidak dapat dikembalikan
                      (non-refundable).
                    </li>
                    <li className={descP}>
                      Satu kode QR e-ticket hanya berlaku untuk satu kali
                      check-in.
                    </li>
                    <li className={descP}>
                      Penonton wajib membawa identitas resmi yang sesuai dengan
                      data pemesanan.
                    </li>
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* SEATING PLAN */}

          {concert.seatingPlan && (
            <section className={panel}>
              <h2 className={panelTitle}>Denah Tempat Duduk</h2>

              <p className={muted}>
                Lihat posisi panggung dan kategori tiket sebelum menentukan
                tempat dudukmu.
              </p>

              <div className="mt-[25px] w-full overflow-hidden rounded-2xl border border-[#49316d] bg-[#100b20] p-3.5 max-[700px]:p-[7px]">
                {!imageError ? (
                  <img
                    src={concert.seatingPlan}
                    alt={`Seating plan ${concert.title}`}
                    onError={() => setImageError(true)}
                    className="block h-auto w-full rounded-[10px] object-contain"
                  />
                ) : (
                  <div className="flex min-h-[310px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#594578] bg-[#191329] p-[30px] text-center max-[700px]:min-h-[220px] max-[700px]:p-5">
                    <span className="text-primary-light">
                      <Icon name="map" className="size-14" />
                    </span>

                    <h3 className="font-heading text-[23px] font-bold text-white">
                      Seating Plan
                    </h3>

                    <p className="text-sm leading-[1.7] text-[#b9aed0]">
                      Gambar denah akan ditampilkan di sini.
                    </p>
                  </div>
                )}
              </div>

              <p className={demoNote}>
                * Denah merupakan ilustrasi area kategori tiket. Tata letak
                aktual mengikuti penyelenggara.
              </p>
            </section>
          )}

          {/* PILIH TIKET */}

          <section className={`${panel} scroll-mt-[25px]`} id="select-tickets">
            <h2 className={panelTitle}>Pilih Kategori Tiket</h2>

            <p className={muted}>
              Pilih kategori tiket sesuai pengalaman konser yang kamu inginkan.
            </p>

            <div className="mt-7 flex flex-col gap-[13px]">
              {tickets.map((ticket, index) => {
                const isSelected = selectedTicket === index;
                const vip = Boolean(ticket.isVip);
                const soldOut = isSoldOut(ticket);
                const lowStock =
                  hasQuota(ticket) && ticket.quota > 0 && ticket.quota <= 20;

                return (
                  <div
                    key={ticket.id || `${ticket.name}-${index}`}
                    className={ticketCardClass(vip, isSelected, soldOut)}
                  >
                    <button
                      type="button"
                      disabled={soldOut}
                      className="flex w-full cursor-pointer items-center gap-[15px] border-none bg-transparent p-5 text-left text-white disabled:cursor-not-allowed max-[700px]:flex-wrap max-[700px]:p-[17px]"
                      onClick={() => {
                        setSelectedTicket(index);
                        setQuantity(1);
                      }}
                      aria-pressed={isSelected}
                    >
                      <span
                        className="h-[45px] w-[15px] min-w-[15px] rounded-[4px]"
                        style={{
                          backgroundColor: ticket.color || "#8B5CF6",
                        }}
                      />

                      <span className="flex min-w-0 flex-1 flex-col items-start gap-[7px] max-[700px]:min-w-[180px]">
                        {ticket.isVip && (
                          <span className="inline-flex items-center rounded-md border border-[#d5a35d70] bg-[#d5a35d24] px-[11px] py-1.5 text-[11px] font-extrabold tracking-[1px] text-[#f2ce89]">
                            ★ VIP EXCLUSIVE
                          </span>
                        )}

                        <strong
                          className={`font-heading font-bold ${
                            vip
                              ? "text-[21px] text-[#ffe2a6]"
                              : "text-[18px]"
                          }`}
                        >
                          {ticket.name}
                        </strong>

                        <small className="text-[13px] text-[#b9aed0]">
                          {ticket.description}
                        </small>

                        {soldOut && (
                          <span className="rounded-md bg-[#f43f5e22] px-2.5 py-1 text-xs font-bold text-[#fda4af]">
                            Sold out
                          </span>
                        )}

                        {lowStock && (
                          <span className="rounded-md bg-[#fbbf2422] px-2.5 py-1 text-xs font-bold text-[#fcd34d]">
                            Tersisa {ticket.quota} tiket
                          </span>
                        )}
                      </span>

                      <span className="flex shrink-0 items-center gap-[15px] max-[700px]:w-full max-[700px]:justify-between max-[700px]:pl-[30px]">
                        <strong
                          className={`font-bold whitespace-nowrap ${
                            vip
                              ? "text-[18px] text-[#f2ce89]"
                              : "text-[16px] text-[#c4b5fd]"
                          }`}
                        >
                          {formatPrice(ticket.price)}
                        </strong>

                        <span
                          className={`grid size-6 place-items-center rounded-full border-2 ${
                            isSelected
                              ? vip
                                ? "border-[#f2ce89]"
                                : "border-primary-light"
                              : "border-[#5b4a78]"
                          }`}
                        >
                          {isSelected && (
                            <span
                              className={`size-2.5 rounded-full ${
                                vip ? "bg-[#f2ce89]" : "bg-primary-light"
                              }`}
                            />
                          )}
                        </span>
                      </span>
                    </button>

                    {ticket.benefits && ticket.benefits.length > 0 && (
                      <div className="mx-5 mb-5 rounded-b-[9px] border-t border-[#d5a35d50] bg-[#09071435] p-5 max-[700px]:mx-[15px] max-[700px]:mb-[15px] max-[700px]:px-2.5 max-[700px]:py-[17px]">
                        <div className="mb-[17px] flex items-center gap-2.5">
                          <span className="text-[21px] text-[#f2ce89]">✦</span>
                          <h4 className="font-heading text-base font-bold text-[#f2ce89]">
                            VIP Package Benefits
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-x-5 gap-y-3 max-[700px]:grid-cols-1">
                          {ticket.benefits.map((benefit, benefitIndex) => (
                            <div
                              className="flex items-start gap-[9px]"
                              key={benefitIndex}
                            >
                              <span className="text-sm font-bold text-[#f2ce89]">
                                ✓
                              </span>
                              <p className="text-[13px] leading-[1.6] text-[#ecdccb]">
                                {benefit}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className={demoNote}>
              * Harga tiket belum termasuk pajak dan biaya tambahan.
            </p>
          </section>

          {/* LOKASI */}

          <section
            className={`${panel} scroll-mt-[100px]`}
            id="concert-location"
          >
            <h2 className={panelTitle}>Lokasi Konser</h2>

            <p className={muted}>
              Temukan lokasi konsermu dan rencanakan perjalanan dengan mudah.
            </p>

            <div className="mt-[25px] overflow-hidden rounded-[17px] border border-[#49316d] bg-[#100b20]">
              <div className="flex items-center gap-4 border-b border-border bg-[linear-gradient(120deg,#1d1431,#120d22)] px-[25px] py-[23px] max-[700px]:gap-3 max-[700px]:px-[17px] max-[700px]:py-5">
                <IconBox name="pin" size="size-[52px]" />

                <div className="min-w-0">
                  <h3 className="font-heading text-xl leading-[1.4] font-bold text-[#f8fafc] [overflow-wrap:anywhere] max-[700px]:text-[18px]">
                    {hasSpecificVenue ? venueName : "Lokasi Belum Diumumkan"}
                  </h3>

                  <p className="mt-1.5 text-sm text-[#b9aed0]">
                    {concert.location}, Indonesia
                  </p>
                </div>
              </div>

              {hasSpecificVenue ? (
                <>
                  <div className="relative h-[340px] w-full overflow-hidden bg-[#18132a] max-[700px]:h-[280px]">
                    <iframe
                      title={`Google Maps ${venueName}`}
                      src={googleMapsEmbed}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      className="block size-full border-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-[13px] px-[25px] pt-[23px] pb-[15px] max-[700px]:flex-col max-[700px]:px-[17px] max-[700px]:pt-[17px] max-[700px]:pb-3">
                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${mapLink} border-primary bg-primary text-white hover:border-[#7c3aed] hover:bg-[#7c3aed] hover:shadow-[0_8px_20px_#8b5cf630]`}
                    >
                      <Icon name="map" className="size-[18px]" />
                      Lihat di Google Maps
                    </a>

                    <a
                      href={googleMapsDirections}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${mapLink} border-[#49316d] bg-[#211735] text-[#d8c4ff] hover:border-[#a78bfa] hover:bg-[#302047] hover:text-white`}
                    >
                      Petunjuk Arah
                    </a>
                  </div>

                  <p className="px-[25px] pb-[23px] text-xs leading-[1.8] text-[#a79ebb] max-[700px]:px-[17px] max-[700px]:pb-5">
                    * Lokasi dicari berdasarkan nama venue. Periksa kembali
                    pintu masuk dan titik kedatangan sesuai informasi
                    penyelenggara.
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center bg-[#100b20] bg-[radial-gradient(ellipse_at_center,#8b5cf61a,transparent_70%)] px-[25px] py-12 text-center max-[700px]:px-[17px] max-[700px]:py-10">
                  <div className="mb-5 grid size-[76px] place-items-center rounded-[18px] border border-[#49316d] bg-[#8b5cf620] text-primary-light">
                    <Icon name="map" className="size-9" />
                  </div>

                  <h3 className="font-heading text-[22px] font-bold text-[#f8fafc]">
                    Detail Lokasi Segera Hadir
                  </h3>

                  <p className="mt-[13px] max-w-[440px] text-sm leading-[1.8] text-[#c4bbd6]">
                    Informasi venue spesifik untuk
                    {` ${concert.title} `}
                    belum tersedia pada data acara.
                  </p>

                  <p className="mt-[13px] max-w-[440px] text-sm leading-[1.8] text-[#c4bbd6]">
                    Lokasi yang tercantum saat ini:
                    <strong className="font-bold text-[#e9d5ff]">
                      {" "}
                      {concert.location}, Indonesia
                    </strong>
                  </p>

                  <span className="mt-[22px] max-w-[430px] text-[13px] leading-[1.7] text-primary-light">
                    Pantau informasi dari penyelenggara untuk mengetahui alamat
                    venue.
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RINGKASAN PEMESANAN */}

        <aside className="sticky top-[25px] rounded-2xl border border-[#49316d] bg-surface-light p-7 max-[900px]:static max-[700px]:p-[22px]">
          <h3 className="mb-[27px] font-heading text-[24px] font-bold">
            Ringkasan Pemesanan
          </h3>

          <div className={summaryRow}>
            <span className="text-[#b9aed0]">Konser</span>
            <strong className={summaryValue}>{concert.title}</strong>
          </div>

          <div className={summaryRow}>
            <span className="text-[#b9aed0]">Kategori</span>
            <strong className={summaryValue}>{activeTicket.name}</strong>
          </div>

          <div className={summaryRow}>
            <span className="text-[#b9aed0]">Harga per Tiket</span>

            <strong className={summaryValue}>
              {formatPrice(activeTicket.price)}
            </strong>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#49316d] py-5 text-sm">
            <span>Jumlah Tiket</span>

            <div className="flex items-center gap-[17px]">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                aria-label="Kurangi jumlah"
                className={qtyBtn}
              >
                −
              </button>

              <strong className="font-bold">{quantity}</strong>

              <button
                type="button"
                disabled={quantity >= maxQuantity}
                onClick={() =>
                  setQuantity((prev) => Math.min(maxQuantity, prev + 1))
                }
                aria-label="Tambah jumlah"
                className={qtyBtn}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-[15px] border-t border-[#49316d] py-[22px]">
            <span className="text-sm text-[#b9aed0]">Subtotal</span>
            <strong className="text-[24px] font-bold text-[#c4b5fd] max-[480px]:text-[21px]">
              {formatPrice(subtotal)}
            </strong>
          </div>

          <p className="-mt-[5px] mb-5 text-xs leading-[1.6] text-[#a79ebb]">
            Belum termasuk pajak dan biaya layanan.
          </p>

          <button
            type="button"
            disabled={activeSoldOut}
            className={`${primaryBtn} w-full`}
            onClick={handleContinueBooking}
          >
            {activeSoldOut ? "Tiket Habis" : "Lanjutkan Pemesanan"}
          </button>

          <p className="mt-[15px] flex items-center justify-center gap-1.5 text-center text-xs text-[#a79ebb]">
            <Icon name="lock" className="size-3.5" />
            Pemesanan resmi ENCORE
          </p>
        </aside>
      </div>

      {/* BAR HARGA (HP / TABLET) */}

      <div className="fixed inset-x-0 bottom-0 z-40 hidden items-center justify-between gap-4 border-t border-[#49316d] bg-[#110c20f2] px-[5%] py-3 backdrop-blur-md max-[900px]:flex">
        <div className="min-w-0">
          <small className="block truncate text-xs text-[#b9aed0]">
            {activeTicket.name} × {quantity}
          </small>
          <strong className="text-[19px] font-bold text-[#d7c4ff]">
            {formatPrice(subtotal)}
          </strong>
        </div>

        <button
          type="button"
          disabled={activeSoldOut}
          onClick={handleContinueBooking}
          className={`${primaryBtn} shrink-0 px-5 py-3 text-sm`}
        >
          {activeSoldOut ? "Tiket Habis" : "Lanjutkan"}
        </button>
      </div>
    </main>
  );
}

export default function ConcertDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <main className={pageBg}>
          <div className={loadingBox}>Memuat detail konser...</div>
        </main>
      }
    >
      <ConcertDetailContent params={params} />
    </Suspense>
  );
}