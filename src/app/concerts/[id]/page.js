
"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { concerts, formatPrice } from "../../../data/concerts";

function ConcertDetailContent({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState("description");
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [allConcerts, setAllConcerts] = useState(concerts);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  // ======================================
  // AMBIL EVENT BAWAAN DAN EVENT ORGANIZER
  // ======================================

  useEffect(() => {
    try {
      const savedEvents = JSON.parse(
        localStorage.getItem("encoreCustomConcerts") || "[]"
      );

      const combinedEvents = [
        ...concerts,
        ...savedEvents.filter(
          (event) =>
            !concerts.some(
              (item) => String(item.id) === String(event.id)
            )
        ),
      ];

      setAllConcerts(combinedEvents);
    } catch (error) {
      console.error("Gagal membaca event Organizer:", error);
      setAllConcerts(concerts);
    } finally {
      setEventsLoaded(true);
    }
  }, []);

  const concert = allConcerts.find(
    (item) => String(item.id) === String(id)
  );

  if (!eventsLoaded) {
    return (
      <main className="ticket-detail-page">
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff"
        }}>
          Memuat detail konser...
        </div>
      </main>
    );
  }

  if (!concert) {
    return (
      <main className="ticket-not-found">
        <h1>Konser Tidak Ditemukan</h1>
        <p>Konser yang kamu cari belum tersedia.</p>
        <Link href="/concerts" className="primary-btn">
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

  const activeTicket =
    tickets[selectedTicket] ?? tickets[0];

  const subtotal = activeTicket.price * quantity;

  const venueName = concert.venue?.trim() || "";

  const hasSpecificVenue =
    venueName.length > 0 &&
    venueName.toLowerCase() !==
      concert.location?.trim().toLowerCase();

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

  return (
    <main className="ticket-detail-page">

      <div className="ticket-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/concerts">Concerts</Link>
        <span>/</span>
        <span>{concert.title}</span>
      </div>

      <section className="ticket-banner">
        <img
          src={concert.image || "/images/default-concert.jpg"}
          alt={`Poster ${concert.title}`}
        />

        <div className="ticket-banner-overlay">
          <span className="eyebrow">
            EVERY CONCERT STARTS WITH ENCORE
          </span>

          <h1>{concert.title}</h1>
          <p>{concert.subtitle || concert.artist}</p>
        </div>
      </section>

      <div className="ticket-layout">

        <div className="ticket-main-content">

          <section className="ticket-panel">
            <span className="eyebrow">
              LIVE MUSIC EXPERIENCE
            </span>

            <h2>{concert.title}</h2>

            <p className="ticket-artist">
              {concert.subtitle || concert.artist}
            </p>

            <div className="ticket-event-info">

              <div>
                <span>📅</span>
                <div>
                  <small>Tanggal Konser</small>
                  <strong>{concert.date}</strong>
                </div>
              </div>

              <div>
                <span>📍</span>
                <div>
                  <small>Lokasi</small>
                  <strong>
                    {concert.venue || concert.location}
                  </strong>
                </div>
              </div>

              <div>
                <span>🎤</span>
                <div>
                  <small>Artist</small>
                  <strong>{concert.artist}</strong>
                </div>
              </div>

            </div>
          </section>

          <section className="ticket-panel">

            <div className="ticket-tabs">

              <button
                type="button"
                className={
                  activeTab === "description" ? "active" : ""
                }
                onClick={() => setActiveTab("description")}
              >
                Deskripsi
              </button>

              <button
                type="button"
                className={
                  activeTab === "terms" ? "active" : ""
                }
                onClick={() => setActiveTab("terms")}
              >
                Syarat & Ketentuan
              </button>

            </div>

            {activeTab === "description" ? (
              <div className="ticket-description">
                <h3>Tentang Konser</h3>

                <p>
                  {concert.description ||
                    "Temukan pengalaman konser yang berkesan bersama ENCORE."}
                </p>

                <p>
                  Temukan pengalaman konser yang
                  berkesan bersama ENCORE.
                </p>

                <p>
                  Pilih kategori tiket, lihat denah,
                  dan siapkan dirimu untuk momen
                  yang tak terlupakan.
                </p>
              </div>
            ) : (
              <div className="ticket-description">
                <h3>Syarat & Ketentuan</h3>

                <ul>
                  {(concert.notes || []).map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

          </section>

          {concert.seatingPlan && (
            <section className="ticket-panel">

              <span className="eyebrow">
                VENUE SEATING PLAN
              </span>

              <h2>
                {concert.id === 6
                  ? "Informasi Harga Tiket"
                  : "Denah Tempat Duduk"}
              </h2>

              <p className="ticket-muted">
                {concert.id === 6
                  ? "Lihat daftar harga tiket Regular dan VIP untuk Day 1 dan Day 2."
                  : "Lihat posisi panggung dan kategori tiket sebelum menentukan tempat dudukmu."}
              </p>

              <div className="encore-seating-frame">

                {!imageError ? (
                  <img
                    src={concert.seatingPlan}
                    alt={
                      concert.id === 6
                        ? `Informasi harga tiket ${concert.title}`
                        : `Seating plan ${concert.title}`
                    }
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="encore-seating-placeholder">

                    <span className="encore-placeholder-icon">
                      ▧
                    </span>

                    <h3>
                      {concert.id === 6
                        ? "Informasi Tiket"
                        : "Seating Plan"}
                    </h3>

                    <p>
                      Gambar informasi tiket akan
                      ditampilkan di sini.
                    </p>

                    <small>public/images/</small>

                  </div>
                )}

              </div>

              <p className="ticket-demo-note">
                {concert.id === 6
                  ? "* Harga mengikuti informasi pada poster penyelenggara dan belum termasuk pajak serta admin fee."
                  : "* Denah merupakan ilustrasi area kategori tiket. Tata letak aktual mengikuti penyelenggara."}
              </p>

            </section>
          )}

          <section
            className="ticket-panel"
            id="select-tickets"
          >

            <span className="eyebrow">
              CHOOSE YOUR EXPERIENCE
            </span>

            <h2>Pilih Kategori Tiket</h2>

            <p className="ticket-muted">
              Pilih kategori tiket sesuai pengalaman
              konser yang kamu inginkan.
            </p>

            <div className="ticket-options">

              {tickets.map((ticket, index) => {
                const isSelected = selectedTicket === index;

                return (
                  <div
                    key={`${ticket.name}-${index}`}
                    className={`encore-ticket-card ${
                      ticket.isVip ? "encore-vip-card" : ""
                    } ${
                      isSelected ? "encore-ticket-selected" : ""
                    }`}
                  >

                    <button
                      type="button"
                      className="encore-ticket-select"
                      onClick={() => {
                        setSelectedTicket(index);
                        setQuantity(1);
                      }}
                      aria-pressed={isSelected}
                    >

                      <span
                        className="encore-ticket-color"
                        style={{
                          backgroundColor:
                            ticket.color || "#8B5CF6",
                        }}
                      />

                      <span className="encore-ticket-information">

                        {ticket.isVip && (
                          <span className="encore-vip-badge">
                            ★ VIP EXCLUSIVE
                          </span>
                        )}

                        <strong>{ticket.name}</strong>

                        <small>{ticket.description}</small>

                      </span>

                      <span className="encore-ticket-price-area">

                        <strong>
                          {formatPrice(ticket.price)}
                        </strong>

                        <span className="encore-ticket-check">
                          {isSelected ? "●" : "○"}
                        </span>

                      </span>

                    </button>

                    {ticket.benefits &&
                      ticket.benefits.length > 0 && (
                        <div className="encore-vip-benefits">

                          <div className="encore-vip-benefits-heading">
                            <span>✦</span>
                            <h4>VIP Package Benefits</h4>
                          </div>

                          <div className="encore-vip-benefit-list">

                            {ticket.benefits.map(
                              (benefit, benefitIndex) => (
                                <div
                                  className="encore-vip-benefit"
                                  key={benefitIndex}
                                >
                                  <span>✓</span>
                                  <p>{benefit}</p>
                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                  </div>
                );
              })}

            </div>

            <p className="ticket-demo-note">
              * Harga tiket belum termasuk pajak
              dan biaya tambahan.
            </p>

          </section>

          <section
            className="ticket-panel encore-location-section"
            id="concert-location"
          >

            <span className="eyebrow">
              FIND YOUR VENUE
            </span>

            <h2>Lokasi Konser</h2>

            <p className="ticket-muted">
              Temukan lokasi konsermu dan
              rencanakan perjalanan dengan mudah.
            </p>

            <div className="encore-location-card">

              <div className="encore-location-header">

                <div className="encore-location-icon">
                  📍
                </div>

                <div className="encore-location-heading">

                  <span>CONCERT VENUE</span>

                  <h3>
                    {hasSpecificVenue
                      ? venueName
                      : "Lokasi Belum Diumumkan"}
                  </h3>

                  <p>
                    {concert.location}, Indonesia
                  </p>

                </div>

              </div>

              {hasSpecificVenue ? (
                <>

                  <div className="encore-map-frame">
                    <iframe
                      title={`Google Maps ${venueName}`}
                      src={googleMapsEmbed}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="encore-map-actions">

                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="encore-map-primary"
                    >
                      🗺️ Lihat di Google Maps
                    </a>

                    <a
                      href={googleMapsDirections}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="encore-map-secondary"
                    >
                      Petunjuk Arah
                    </a>

                  </div>

                  <p className="encore-location-note">
                    * Lokasi dicari berdasarkan nama
                    venue. Periksa kembali pintu masuk
                    dan titik kedatangan sesuai
                    informasi penyelenggara.
                  </p>

                </>
              ) : (

                <div className="encore-location-unavailable">

                  <div className="encore-location-unavailable-icon">
                    🗺️
                  </div>

                  <h3>Detail Lokasi Segera Hadir</h3>

                  <p>
                    Informasi venue spesifik untuk
                    {` ${concert.title} `}
                    belum tersedia pada data acara.
                  </p>

                  <p>
                    Lokasi yang tercantum saat ini:
                    <strong>
                      {" "}{concert.location}, Indonesia
                    </strong>
                  </p>

                  <span>
                    Pantau informasi dari penyelenggara
                    untuk mengetahui alamat venue.
                  </span>

                </div>

              )}

            </div>

          </section>

        </div>

        <aside className="ticket-booking-card">

          <span className="eyebrow">
            YOUR TICKET
          </span>

          <h3>Ringkasan Pemesanan</h3>

          <div className="ticket-summary-row">
            <span>Konser</span>
            <strong>{concert.title}</strong>
          </div>

          <div className="ticket-summary-row">
            <span>Kategori</span>
            <strong>{activeTicket.name}</strong>
          </div>

          <div className="ticket-summary-row">
            <span>
              {activeTicket.persons
                ? "Harga per Paket"
                : "Harga per Tiket"}
            </span>

            <strong>{formatPrice(activeTicket.price)}</strong>
          </div>

          {activeTicket.persons && (
            <div className="ticket-summary-row">
              <span>Peserta per Paket</span>
              <strong>{activeTicket.persons} orang</strong>
            </div>
          )}

          <div className="ticket-quantity-section">

            <span>
              {activeTicket.persons
                ? "Jumlah Paket"
                : "Jumlah Tiket"}
            </span>

            <div className="ticket-quantity">

              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((prev) =>
                    Math.max(1, prev - 1)
                  )
                }
                aria-label="Kurangi jumlah"
              >
                −
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                disabled={quantity >= 4}
                onClick={() =>
                  setQuantity((prev) =>
                    Math.min(4, prev + 1)
                  )
                }
                aria-label="Tambah jumlah"
              >
                +
              </button>

            </div>

          </div>

          {activeTicket.persons && (
            <div className="ticket-summary-row">
              <span>Total Peserta</span>
              <strong>
                {activeTicket.persons * quantity} orang
              </strong>
            </div>
          )}

          <div className="ticket-total">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <p className="encore-booking-note">
            Belum termasuk pajak dan biaya layanan.
          </p>

          <button
            type="button"
            className="primary-btn ticket-buy-btn"
            onClick={() => {
              router.push(
                `/buyer/checkout?concertId=${concert.id}&ticketIndex=${selectedTicket}&quantity=${quantity}`
              );
            }}
          >
            Lanjutkan Pemesanan
          </button>

          <p className="ticket-secure-note">
            🔒 Simulasi pemesanan ENCORE
          </p>

        </aside>

      </div>

      <style>{`

        /* BACKGROUND DETAIL KONSER */
        .ticket-detail-page {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          width: 100%;
          color: #ffffff;
          background-color: #090714 !important;
          background-image:
            linear-gradient(
              180deg,
              rgba(9, 7, 20, 0.48) 0%,
              rgba(9, 7, 20, 0.70) 48%,
              rgba(9, 7, 20, 0.88) 100%
            ),
            url("/images/bg%20konser.jpg") !important;
          background-position: center top !important;
          background-size: cover !important;
          background-repeat: no-repeat !important;
          background-attachment: fixed !important;
        }

        @media (max-width: 700px) {
          .ticket-detail-page {
            background-attachment: scroll !important;
          }
        }

        .encore-seating-frame {
          width: 100%;
          margin-top: 25px;
          padding: 14px;
          border: 1px solid #49316d;
          border-radius: 16px;
          background: #100b20;
          overflow: hidden;
        }

        .encore-seating-frame img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 10px;
          object-fit: contain;
        }

        .encore-seating-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 310px;
          padding: 30px;
          border: 2px dashed #594578;
          border-radius: 12px;
          background: #191329;
          text-align: center;
        }

        .encore-placeholder-icon {
          color: #a78bfa;
          font-size: 55px;
          line-height: 1;
        }

        .encore-seating-placeholder h3 {
          color: white;
          font-size: 23px;
        }

        .encore-seating-placeholder p,
        .encore-seating-placeholder small {
          color: #a5a0b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .ticket-sale-box {
          margin-top: 24px;
          padding: 18px;
          border: 1px solid #49316d;
          border-radius: 14px;
          background: #120d22;
        }

        .ticket-sale-box h3 {
          margin-bottom: 14px;
          font-family: "Outfit", sans-serif;
          font-size: 18px;
        }

        .ticket-sale-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 10px 0;
          border-top: 1px solid #2c2340;
        }

        .ticket-sale-row:first-of-type {
          border-top: none;
          padding-top: 0;
        }

        .ticket-sale-row span {
          color: #a5a0b8;
          font-size: 13px;
        }

        .ticket-sale-row strong {
          color: #f8fafc;
          font-size: 13px;
          text-align: right;
        }

        .encore-ticket-card {
          overflow: hidden;
          border: 1px solid #302747;
          border-radius: 13px;
          background: #090714;
          transition: all 0.2s ease;
        }

        .encore-ticket-card:hover {
          border-color: #8b5cf6;
        }

        .encore-ticket-card.encore-ticket-selected {
          border-color: #a78bfa;
          background: #211735;
          box-shadow: 0 0 0 1px #8b5cf62b;
        }

        .encore-ticket-select {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
          padding: 20px;
          border: none;
          background: transparent;
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .encore-ticket-color {
          width: 15px;
          min-width: 15px;
          height: 45px;
          border-radius: 4px;
        }

        .encore-ticket-information {
          display: flex;
          flex: 1;
          min-width: 0;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
        }

        .encore-ticket-information > strong {
          font-family: "Outfit", sans-serif;
          font-size: 17px;
        }

        .encore-ticket-information > small {
          color: #a5a0b8;
          font-size: 12px;
        }

        .encore-ticket-price-area {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-shrink: 0;
        }

        .encore-ticket-price-area > strong {
          color: #c4b5fd;
          font-size: 15px;
          white-space: nowrap;
        }

        .encore-ticket-check {
          color: #a78bfa;
          font-size: 24px;
        }

        .encore-vip-card {
          border: 2px solid #b58a50;
          background: linear-gradient(
            135deg,
            #49251e,
            #281923 65%,
            #151126
          );
        }

        .encore-vip-card:hover,
        .encore-vip-card.encore-ticket-selected {
          border-color: #e7bd75;
          background: linear-gradient(
            135deg,
            #573022,
            #30202b 65%,
            #151126
          );
          box-shadow: 0 0 28px #d6a45d28;
        }

        .encore-vip-card
          .encore-ticket-information > strong {
          color: #ffe2a6;
          font-size: 21px;
        }

        .encore-vip-card
          .encore-ticket-price-area > strong {
          color: #f2ce89;
          font-size: 17px;
        }

        .encore-vip-card .encore-ticket-check {
          color: #f2ce89;
        }

        .encore-vip-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 11px;
          border: 1px solid #d5a35d70;
          border-radius: 6px;
          background: #d5a35d24;
          color: #f2ce89;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .encore-vip-benefits {
          margin: 0 20px 20px;
          padding: 20px;
          border-top: 1px solid #d5a35d50;
          border-radius: 0 0 9px 9px;
          background: #09071435;
        }

        .encore-vip-benefits-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
        }

        .encore-vip-benefits-heading span {
          color: #f2ce89;
          font-size: 21px;
        }

        .encore-vip-benefits-heading h4 {
          color: #f2ce89;
          font-size: 15px;
        }

        .encore-vip-benefit-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 20px;
        }

        .encore-vip-benefit {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .encore-vip-benefit > span {
          color: #f2ce89;
          font-size: 14px;
          font-weight: 700;
        }

        .encore-vip-benefit p {
          color: #e6d6c5;
          font-size: 12px;
          line-height: 1.6;
        }

        .encore-booking-note {
          margin: -5px 0 20px;
          color: #a5a0b8;
          font-size: 11px;
          line-height: 1.6;
        }

        .encore-location-section {
          scroll-margin-top: 100px;
        }

        .encore-location-card {
          margin-top: 25px;
          border: 1px solid #49316d;
          border-radius: 17px;
          background: #100b20;
          overflow: hidden;
        }

        .encore-location-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 23px 25px;
          background: linear-gradient(
            120deg,
            #1d1431,
            #120d22
          );
          border-bottom: 1px solid #302747;
        }

        .encore-location-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 13px;
          background: #8b5cf625;
          font-size: 25px;
        }

        .encore-location-heading {
          min-width: 0;
        }

        .encore-location-heading > span {
          color: #a78bfa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .encore-location-heading h3 {
          margin-top: 6px;
          color: #f8fafc;
          font-family: "Outfit", sans-serif;
          font-size: 20px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .encore-location-heading p {
          margin-top: 6px;
          color: #a5a0b8;
          font-size: 13px;
        }

        .encore-map-frame {
          position: relative;
          width: 100%;
          height: 340px;
          overflow: hidden;
          background: #18132a;
        }

        .encore-map-frame iframe {
          display: block;
          width: 100%;
          height: 100%;
          border: none;
        }

        .encore-map-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 13px;
          padding: 23px 25px 15px;
        }

        .encore-map-actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 46px;
          padding: 13px 19px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.25s ease;
        }

        .encore-map-primary {
          background: #8b5cf6;
          border: 1px solid #8b5cf6;
          color: white;
        }

        .encore-map-primary:hover {
          background: #7c3aed;
          border-color: #7c3aed;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px #8b5cf630;
        }

        .encore-map-secondary {
          background: #211735;
          border: 1px solid #49316d;
          color: #d8c4ff;
        }

        .encore-map-secondary:hover {
          border-color: #a78bfa;
          background: #302047;
          color: #ffffff;
          transform: translateY(-2px);
        }

        .encore-location-note {
          padding: 0 25px 23px;
          color: #9990aa;
          font-size: 11px;
          line-height: 1.8;
        }

        .encore-location-unavailable {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 25px;
          text-align: center;
          background:
            radial-gradient(
              ellipse at center,
              #8b5cf61a,
              transparent 70%
            ),
            #100b20;
        }

        .encore-location-unavailable-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 76px;
          height: 76px;
          margin-bottom: 20px;
          border: 1px solid #49316d;
          border-radius: 18px;
          background: #8b5cf620;
          font-size: 36px;
        }

        .encore-location-unavailable h3 {
          color: #f8fafc;
          font-family: "Outfit", sans-serif;
          font-size: 22px;
        }

        .encore-location-unavailable p {
          max-width: 440px;
          margin-top: 13px;
          color: #b5aac8;
          font-size: 13px;
          line-height: 1.8;
        }

        .encore-location-unavailable p strong {
          color: #e9d5ff;
        }

        .encore-location-unavailable > span {
          max-width: 430px;
          margin-top: 22px;
          color: #a78bfa;
          font-size: 12px;
          line-height: 1.7;
        }

        @media (max-width: 700px) {

          .ticket-sale-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .ticket-sale-row strong {
            text-align: left;
          }

          .encore-ticket-select {
            flex-wrap: wrap;
            padding: 17px;
          }

          .encore-ticket-information {
            min-width: 180px;
          }

          .encore-ticket-price-area {
            width: 100%;
            justify-content: space-between;
            padding-left: 30px;
          }

          .encore-vip-benefits {
            margin: 0 15px 15px;
            padding: 17px 10px;
          }

          .encore-vip-benefit-list {
            grid-template-columns: 1fr;
          }

          .encore-seating-frame {
            padding: 7px;
          }

          .encore-seating-placeholder {
            min-height: 220px;
            padding: 20px;
          }

          .encore-location-header {
            padding: 20px 17px;
            gap: 12px;
          }

          .encore-location-icon {
            width: 44px;
            height: 44px;
            font-size: 22px;
          }

          .encore-location-heading h3 {
            font-size: 17px;
          }

          .encore-map-frame {
            height: 280px;
          }

          .encore-map-actions {
            flex-direction: column;
            padding: 17px 17px 12px;
          }

          .encore-map-actions a {
            width: 100%;
          }

          .encore-location-note {
            padding: 0 17px 20px;
          }

          .encore-location-unavailable {
            padding: 40px 17px;
          }

        }

      `}</style>

    </main>
  );
}

export default function ConcertDetailPage({ params }) {
  return (
    <Suspense
      fallback={
        <main className="ticket-detail-page">
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            Memuat detail konser...
          </div>
        </main>
      }
    >
      <ConcertDetailContent params={params} />
    </Suspense>
  );
}
