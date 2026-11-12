"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { concerts, formatPrice } from "../../../data/concerts";
import { supabase } from "../../../lib/supabase";

// ======================================
// KELAS TAILWIND
// ======================================

const pageBg =
  "relative isolate min-h-screen w-full bg-[#090714] bg-[image:linear-gradient(180deg,rgba(9,7,20,0.48)_0%,rgba(9,7,20,0.70)_48%,rgba(9,7,20,0.88)_100%),url('/images/bg%20konser.jpg')] bg-cover bg-[position:center_top] bg-fixed bg-no-repeat text-white max-[700px]:bg-scroll";

const loadingBox = "flex min-h-screen items-center justify-center text-white";

const eyebrow =
  "text-xs leading-[1.6] font-bold tracking-[2px] text-primary-light";

const primaryBtn =
  "inline-flex cursor-pointer items-center justify-center gap-4 rounded-[9px] border-none bg-primary px-[22px] py-3.5 text-center font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7c3aed] hover:shadow-[0_8px_25px_#8b5cf640]";

const panel =
  "rounded-2xl border border-border bg-surface p-[30px] max-[700px]:p-[22px]";
const panelTitle = "my-[13px] font-heading text-[29px] font-bold";
const muted = "leading-[1.8] text-muted";
const demoNote = "mt-[18px] text-xs leading-[1.7] text-muted";

const descP = "mb-[15px] text-sm leading-[1.9] text-[#b8b1ca]";

const tabClass = (active) =>
  `cursor-pointer border-0 border-b-2 bg-transparent px-4 py-[13px] font-semibold hover:text-primary-light max-[480px]:px-[9px] max-[480px]:py-3 max-[480px]:text-xs ${
    active
      ? "border-primary text-primary-light"
      : "border-transparent text-muted"
  }`;

const ticketCardClass = (isVip, isSelected) => {
  if (isVip) {
    return `overflow-hidden rounded-[13px] border-2 transition-all duration-200 ${
      isSelected
        ? "border-[#e7bd75] bg-[linear-gradient(135deg,#573022,#30202b_65%,#151126)] shadow-[0_0_28px_#d6a45d28]"
        : "border-[#b58a50] bg-[linear-gradient(135deg,#49251e,#281923_65%,#151126)] hover:border-[#e7bd75] hover:bg-[linear-gradient(135deg,#573022,#30202b_65%,#151126)] hover:shadow-[0_0_28px_#d6a45d28]"
    }`;
  }

  return `overflow-hidden rounded-[13px] border transition-all duration-200 ${
    isSelected
      ? "border-[#a78bfa] bg-[#211735] shadow-[0_0_0_1px_#8b5cf62b]"
      : "border-border bg-[#090714] hover:border-primary"
  }`;
};

const mapLink =
  "inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-[10px] border px-[19px] py-[13px] text-[13px] font-bold transition duration-[250ms] hover:-translate-y-0.5 max-[700px]:w-full";

const summaryRow =
  "mb-5 flex justify-between gap-[15px] text-[13px] max-[480px]:flex-wrap";
const summaryValue = "text-right font-bold [overflow-wrap:anywhere]";
const qtyBtn =
  "size-8 cursor-pointer rounded-[7px] border border-[#49316d] bg-background text-[19px] text-white disabled:cursor-not-allowed disabled:opacity-40";

function ConcertDetailContent({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState("description");
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [concert, setConcert] = useState(null);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  // ======================================
  // AMBIL EVENT BAWAAN ATAU DARI SUPABASE
  // ======================================

  useEffect(() => {
    const fetchConcertDetail = async () => {
      try {
        // 1. Cek terlebih dahulu di katalog bawaan
        const staticConcert = concerts.find(
          (item) => String(item.id) === String(id)
        );

        if (staticConcert) {
          setConcert(staticConcert);
          setEventsLoaded(true);
          return;
        }

        // 2. Ambil dari tabel 'events' dan 'ticket_types' di Supabase
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

        if (error || !ev) {
          setConcert(null);
          return;
        }

        const parsedDate = ev.event_date ? new Date(ev.event_date) : null;
        const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());

        const formattedDate = isValidDate
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
                color: t.color || "#8B5CF6",
                isVip: Boolean(t.is_vip),
                benefits: Array.isArray(t.benefits) ? t.benefits : [],
              }))
          : [];

        setConcert({
          id: ev.id,
          isSupabase: true,
          title: ev.title,
          subtitle: ev.subtitle || ev.artist || "",
          artist: ev.artist || "ENCORE Artist",
          date: formattedDate,
          location: ev.location || ev.venue || "Indonesia",
          venue: ev.venue || "",
          description: ev.description || "",
          image: ev.image_url || "/images/default-concert.jpg",
          seatingPlan: ev.seating_plan || "",
          notes: Array.isArray(ev.notes) ? ev.notes : [],
          price: mappedTickets[0]?.price || 0,
          tickets: mappedTickets,
        });
      } catch (error) {
        console.error("Gagal membaca detail konser:", error);
        setConcert(null);
      } finally {
        setEventsLoaded(true);
      }
    };

    fetchConcertDetail();
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

  const activeTicket = tickets[selectedTicket] ?? tickets[0];
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

  const isVipCard = (ticket) => Boolean(ticket.isVip);

  const handleContinueBooking = () => {
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

      <div className="flex flex-wrap items-center gap-3 px-[7%] py-7 text-[13px] text-muted max-[700px]:px-[5%] max-[700px]:py-[22px]">
        <Link href="/" className="hover:text-primary-light">
          Home
        </Link>
        <span>/</span>
        <Link href="/concerts" className="hover:text-primary-light">
          Concerts
        </Link>
        <span>/</span>
        <span>{concert.title}</span>
      </div>

      {/* BANNER */}

      <section className="relative mx-[7%] mb-[45px] h-[440px] overflow-hidden rounded-[20px] border border-border max-[700px]:mx-[5%] max-[700px]:mb-[30px] max-[700px]:h-[330px] max-[480px]:h-[280px]">
        <img
          src={concert.image || "/images/default-concert.jpg"}
          alt={`Poster ${concert.title}`}
          className="size-full object-cover"
        />

        <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(0deg,#090714_0%,#090714bb_35%,transparent_85%)] p-[45px] max-[700px]:p-[25px]">
          <span className={eyebrow}>EVERY CONCERT STARTS WITH ENCORE</span>

          <h1 className="mt-[15px] mb-2.5 font-heading text-[clamp(34px,5vw,58px)] leading-[1.15] font-bold max-[480px]:text-[32px]">
            {concert.title}
          </h1>
          <p className="text-[17px] text-[#ded4ee]">
            {concert.subtitle || concert.artist}
          </p>
        </div>
      </section>

      {/* LAYOUT */}

      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)] items-start gap-7 px-[7%] pb-[90px] max-[900px]:grid-cols-1 max-[700px]:px-[5%] max-[700px]:pb-[60px]">
        <div className="flex min-w-0 flex-col gap-[25px]">
          {/* INFO EVENT */}

          <section className={panel}>
            <span className={eyebrow}>LIVE MUSIC EXPERIENCE</span>

            <h2 className={panelTitle}>{concert.title}</h2>

            <p className={muted}>{concert.subtitle || concert.artist}</p>

            <div className="mt-7 grid grid-cols-3 gap-5 border-t border-border pt-6 max-[700px]:grid-cols-1">
              <div className="flex items-start gap-3">
                <span className="text-[22px]">📅</span>
                <div>
                  <small className="block text-xs text-muted">
                    Tanggal Konser
                  </small>
                  <strong className="mt-[7px] block text-[13px] font-bold [overflow-wrap:anywhere]">
                    {concert.date}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[22px]">📍</span>
                <div>
                  <small className="block text-xs text-muted">Lokasi</small>
                  <strong className="mt-[7px] block text-[13px] font-bold [overflow-wrap:anywhere]">
                    {concert.venue || concert.location}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[22px]">🎤</span>
                <div>
                  <small className="block text-xs text-muted">Artist</small>
                  <strong className="mt-[7px] block text-[13px] font-bold [overflow-wrap:anywhere]">
                    {concert.artist}
                  </strong>
                </div>
              </div>
            </div>
          </section>

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
                  Temukan pengalaman konser yang berkesan bersama ENCORE.
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
              <span className={eyebrow}>VENUE SEATING PLAN</span>

              <h2 className={panelTitle}>
                {concert.id === 6
                  ? "Informasi Harga Tiket"
                  : "Denah Tempat Duduk"}
              </h2>

              <p className={muted}>
                {concert.id === 6
                  ? "Lihat daftar harga tiket Regular dan VIP untuk Day 1 dan Day 2."
                  : "Lihat posisi panggung dan kategori tiket sebelum menentukan tempat dudukmu."}
              </p>

              <div className="mt-[25px] w-full overflow-hidden rounded-2xl border border-[#49316d] bg-[#100b20] p-3.5 max-[700px]:p-[7px]">
                {!imageError ? (
                  <img
                    src={concert.seatingPlan}
                    alt={
                      concert.id === 6
                        ? `Informasi harga tiket ${concert.title}`
                        : `Seating plan ${concert.title}`
                    }
                    onError={() => setImageError(true)}
                    className="block h-auto w-full rounded-[10px] object-contain"
                  />
                ) : (
                  <div className="flex min-h-[310px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#594578] bg-[#191329] p-[30px] text-center max-[700px]:min-h-[220px] max-[700px]:p-5">
                    <span className="text-[55px] leading-none text-primary-light">
                      ▧
                    </span>

                    <h3 className="font-heading text-[23px] font-bold text-white">
                      {concert.id === 6 ? "Informasi Tiket" : "Seating Plan"}
                    </h3>

                    <p className="text-[13px] leading-[1.7] text-muted">
                      Gambar informasi tiket akan ditampilkan di sini.
                    </p>

                    <small className="text-[13px] leading-[1.7] text-muted">
                      public/images/
                    </small>
                  </div>
                )}
              </div>

              <p className={demoNote}>
                {concert.id === 6
                  ? "* Harga mengikuti informasi pada poster penyelenggara dan belum termasuk pajak serta admin fee."
                  : "* Denah merupakan ilustrasi area kategori tiket. Tata letak aktual mengikuti penyelenggara."}
              </p>
            </section>
          )}

          {/* PILIH TIKET */}

          <section className={panel} id="select-tickets">
            <span className={eyebrow}>CHOOSE YOUR EXPERIENCE</span>

            <h2 className={panelTitle}>Pilih Kategori Tiket</h2>

            <p className={muted}>
              Pilih kategori tiket sesuai pengalaman konser yang kamu inginkan.
            </p>

            <div className="mt-7 flex flex-col gap-[13px]">
              {tickets.map((ticket, index) => {
                const isSelected = selectedTicket === index;
                const vip = isVipCard(ticket);

                return (
                  <div
                    key={ticket.id || `${ticket.name}-${index}`}
                    className={ticketCardClass(vip, isSelected)}
                  >
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-[15px] border-none bg-transparent p-5 text-left text-white max-[700px]:flex-wrap max-[700px]:p-[17px]"
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
                          <span className="inline-flex items-center rounded-md border border-[#d5a35d70] bg-[#d5a35d24] px-[11px] py-1.5 text-[10px] font-extrabold tracking-[1.2px] text-[#f2ce89]">
                            ★ VIP EXCLUSIVE
                          </span>
                        )}

                        <strong
                          className={`font-heading font-bold ${
                            vip
                              ? "text-[21px] text-[#ffe2a6]"
                              : "text-[17px]"
                          }`}
                        >
                          {ticket.name}
                        </strong>

                        <small className="text-xs text-muted">
                          {ticket.description}
                        </small>
                      </span>

                      <span className="flex shrink-0 items-center gap-[15px] max-[700px]:w-full max-[700px]:justify-between max-[700px]:pl-[30px]">
                        <strong
                          className={`font-bold whitespace-nowrap ${
                            vip
                              ? "text-[17px] text-[#f2ce89]"
                              : "text-[15px] text-[#c4b5fd]"
                          }`}
                        >
                          {formatPrice(ticket.price)}
                        </strong>

                        <span
                          className={`text-2xl ${
                            vip ? "text-[#f2ce89]" : "text-primary-light"
                          }`}
                        >
                          {isSelected ? "●" : "○"}
                        </span>
                      </span>
                    </button>

                    {ticket.benefits && ticket.benefits.length > 0 && (
                      <div className="mx-5 mb-5 rounded-b-[9px] border-t border-[#d5a35d50] bg-[#09071435] p-5 max-[700px]:mx-[15px] max-[700px]:mb-[15px] max-[700px]:px-2.5 max-[700px]:py-[17px]">
                        <div className="mb-[17px] flex items-center gap-2.5">
                          <span className="text-[21px] text-[#f2ce89]">✦</span>
                          <h4 className="font-heading text-[15px] font-bold text-[#f2ce89]">
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
                              <p className="text-xs leading-[1.6] text-[#e6d6c5]">
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
            <span className={eyebrow}>FIND YOUR VENUE</span>

            <h2 className={panelTitle}>Lokasi Konser</h2>

            <p className={muted}>
              Temukan lokasi konsermu dan rencanakan perjalanan dengan mudah.
            </p>

            <div className="mt-[25px] overflow-hidden rounded-[17px] border border-[#49316d] bg-[#100b20]">
              <div className="flex items-center gap-4 border-b border-border bg-[linear-gradient(120deg,#1d1431,#120d22)] px-[25px] py-[23px] max-[700px]:gap-3 max-[700px]:px-[17px] max-[700px]:py-5">
                <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[13px] bg-[#8b5cf625] text-[25px] max-[700px]:size-11 max-[700px]:text-[22px]">
                  📍
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold tracking-[1.5px] text-primary-light">
                    CONCERT VENUE
                  </span>

                  <h3 className="mt-1.5 font-heading text-xl leading-[1.4] font-bold text-[#f8fafc] [overflow-wrap:anywhere] max-[700px]:text-[17px]">
                    {hasSpecificVenue ? venueName : "Lokasi Belum Diumumkan"}
                  </h3>

                  <p className="mt-1.5 text-[13px] text-muted">
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
                      🗺️ Lihat di Google Maps
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

                  <p className="px-[25px] pb-[23px] text-[11px] leading-[1.8] text-[#9990aa] max-[700px]:px-[17px] max-[700px]:pb-5">
                    * Lokasi dicari berdasarkan nama venue. Periksa kembali
                    pintu masuk dan titik kedatangan sesuai informasi
                    penyelenggara.
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center bg-[#100b20] bg-[radial-gradient(ellipse_at_center,#8b5cf61a,transparent_70%)] px-[25px] py-12 text-center max-[700px]:px-[17px] max-[700px]:py-10">
                  <div className="mb-5 flex size-[76px] items-center justify-center rounded-[18px] border border-[#49316d] bg-[#8b5cf620] text-4xl">
                    🗺️
                  </div>

                  <h3 className="font-heading text-[22px] font-bold text-[#f8fafc]">
                    Detail Lokasi Segera Hadir
                  </h3>

                  <p className="mt-[13px] max-w-[440px] text-[13px] leading-[1.8] text-[#b5aac8]">
                    Informasi venue spesifik untuk
                    {` ${concert.title} `}
                    belum tersedia pada data acara.
                  </p>

                  <p className="mt-[13px] max-w-[440px] text-[13px] leading-[1.8] text-[#b5aac8]">
                    Lokasi yang tercantum saat ini:
                    <strong className="font-bold text-[#e9d5ff]">
                      {" "}
                      {concert.location}, Indonesia
                    </strong>
                  </p>

                  <span className="mt-[22px] max-w-[430px] text-xs leading-[1.7] text-primary-light">
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
          <span className={eyebrow}>YOUR TICKET</span>

          <h3 className="mt-3 mb-[27px] font-heading text-[23px] font-bold">
            Ringkasan Pemesanan
          </h3>

          <div className={summaryRow}>
            <span className="text-muted">Konser</span>
            <strong className={summaryValue}>{concert.title}</strong>
          </div>

          <div className={summaryRow}>
            <span className="text-muted">Kategori</span>
            <strong className={summaryValue}>{activeTicket.name}</strong>
          </div>

          <div className={summaryRow}>
            <span className="text-muted">
              {activeTicket.persons ? "Harga per Paket" : "Harga per Tiket"}
            </span>

            <strong className={summaryValue}>
              {formatPrice(activeTicket.price)}
            </strong>
          </div>

          {activeTicket.persons && (
            <div className={summaryRow}>
              <span className="text-muted">Peserta per Paket</span>
              <strong className={summaryValue}>
                {activeTicket.persons} orang
              </strong>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-[#49316d] py-5 text-[13px]">
            <span>
              {activeTicket.persons ? "Jumlah Paket" : "Jumlah Tiket"}
            </span>

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
                disabled={quantity >= 4}
                onClick={() => setQuantity((prev) => Math.min(4, prev + 1))}
                aria-label="Tambah jumlah"
                className={qtyBtn}
              >
                +
              </button>
            </div>
          </div>

          {activeTicket.persons && (
            <div className={summaryRow}>
              <span className="text-muted">Total Peserta</span>
              <strong className={summaryValue}>
                {activeTicket.persons * quantity} orang
              </strong>
            </div>
          )}

          <div className="flex items-center justify-between gap-[15px] border-t border-[#49316d] py-[22px]">
            <span className="text-[13px] text-muted">Subtotal</span>
            <strong className="text-[23px] font-bold text-[#c4b5fd] max-[480px]:text-xl">
              {formatPrice(subtotal)}
            </strong>
          </div>

          <p className="-mt-[5px] mb-5 text-[11px] leading-[1.6] text-muted">
            Belum termasuk pajak dan biaya layanan.
          </p>

          <button
            type="button"
            className={`${primaryBtn} w-full`}
            onClick={handleContinueBooking}
          >
            Lanjutkan Pemesanan
          </button>

          <p className="mt-[15px] text-center text-[11px] text-muted">
            🔒 Pemesanan resmi ENCORE
          </p>
        </aside>
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