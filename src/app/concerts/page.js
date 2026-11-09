
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerts, formatPrice } from "../../data/concerts";

export default function ConcertPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [genre, setGenre] = useState("Semua Genre");
  const [today, setToday] = useState(null);
  const [allConcerts, setAllConcerts] = useState(concerts);

  // ======================================
  // 01. TANGGAL INDONESIA
  // ======================================

  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    );

    setToday(
      `${values.year}-${values.month}-${values.day}`
    );
  }, []);

  // ======================================
  // 01B. AMBIL EVENT BUATAN ORGANIZER
  // ======================================

  useEffect(() => {
    try {
      const savedEvents = JSON.parse(
        localStorage.getItem("encoreCustomConcerts") || "[]"
      );

      setAllConcerts([
        ...concerts,
        ...savedEvents.filter(
          (event) => !concerts.some((item) => item.id === event.id)
        ),
      ]);
    } catch (error) {
      console.error("Gagal membaca event Organizer:", error);
      setAllConcerts(concerts);
    }
  }, []);

  // ======================================
  // 02. STATUS KONSER
  // ======================================

  const getStatus = (concert) => {
    if (!today || !concert.dateISO) {
      return "Memuat status";
    }

    if (concert.dateISO > today) return "Mendatang";
    if (concert.dateISO === today) return "Berlangsung";

    return "Selesai";
  };

  // ======================================
  // 03. FILTER GENRE
  // ======================================

  const genres = [
    "Semua Genre",
    ...new Set(
      allConcerts.map((concert) => concert.genre).filter(Boolean)
    ),
  ];

  // ======================================
  // 04. FILTER KONSER
  // ======================================

  const filteredConcerts = allConcerts.filter((concert) => {
    const keyword = search.toLowerCase().trim();

    const matchSearch = [
      concert.title,
      concert.artist,
      concert.location,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(keyword)
    );

    const matchStatus =
      status === "Semua" ||
      getStatus(concert) === status;

    const matchGenre =
      genre === "Semua Genre" ||
      concert.genre === genre;

    return matchSearch && matchStatus && matchGenre;
  });

  // ======================================
  // 05. TAMPILAN HALAMAN
  // ======================================

  return (
    <main className="concert-page">

      {/* BACKGROUND */}

      <div className="concert-background" />
      <div className="concert-background-overlay" />

      <section className="events-section explore-section">

        {/* SEARCH */}

        <div className="explore-controls">

          <div className="search-box explore-search">

            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              placeholder="Cari konser, artis, atau kota..."
              aria-label="Cari konser, artis, atau kota"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="concert-search-clear"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}

          </div>

          {/* GENRE */}

          <select
            className="genre-select"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            aria-label="Pilih genre musik"
          >
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

        </div>

        {/* STATUS FILTER */}

        <div className="explore-status-tabs">

          {[
            "Semua",
            "Mendatang",
            "Berlangsung",
            "Selesai",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className={status === item ? "active" : ""}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}

        </div>

        {/* RESULT COUNT */}

        <p className="explore-result-count">
          {today === null && status !== "Semua"
            ? "Memuat konser..."
            : `Menampilkan ${filteredConcerts.length} konser`}
        </p>

        {/* CONCERT GRID */}

        <div className="concert-grid encore-four-grid">

          {filteredConcerts.map((concert) => (
            <article
              className="concert-card"
              key={concert.id}
            >

              <div className="concert-image">

                <img
                  src={concert.image || "/images/default-concert.jpg"}
                  alt={concert.title}
                  loading="lazy"
                />

                <span className="category-badge">
                  {concert.category || "Konser"}
                </span>

              </div>

              <div className="concert-info">

                <p className="concert-date">
                  {concert.date}
                </p>

                <h3>{concert.title}</h3>

                <p className="artist">
                  {concert.artist}
                </p>

                <p className="location">
                  ⌖ {concert.location}
                </p>

                <div className="concert-tags">

                  {concert.genre && (
                    <span>{concert.genre}</span>
                  )}

                  <span>{getStatus(concert)}</span>

                </div>

                <div className="card-bottom">

                  <div>
                    <span className="price-label">
                      Mulai dari
                    </span>

                    <strong>
                      {formatPrice(concert.price)}
                    </strong>
                  </div>

                  <Link
                    href={`/concerts/${concert.id}`}
                    className="detail-btn"
                    aria-label={`Lihat detail ${concert.title}`}
                  >
                    Detail
                  </Link>

                </div>

              </div>

            </article>
          ))}

        </div>

        {/* EMPTY STATE */}

        {filteredConcerts.length === 0 &&
          !(today === null && status !== "Semua") && (
            <p className="empty-state">
              Konser tidak ditemukan. Coba kata kunci atau filter lainnya.
            </p>
          )}

      </section>

      {/* ======================================
          06. CSS HALAMAN CONCERTS
          LANGSUNG DI PAGE.JS
      ====================================== */}

      <style>{`

        /* MAIN PAGE */

        .concert-page {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          width: 100%;
          color: #ffffff;
          background: #090714;
          overflow: hidden;
        }

        .concert-page * {
          box-sizing: border-box;
        }

        /* BACKGROUND */

        .concert-background {
          position: absolute;
          z-index: -2;
          inset: 0;
          background-image: url("/images/bg%20concerts.jpg");
          background-position: center top;
          background-size: cover;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .concert-background-overlay {
          position: absolute;
          z-index: -1;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(9, 7, 20, 0.68) 0%,
            rgba(9, 7, 20, 0.82) 45%,
            rgba(9, 7, 20, 0.96) 100%
          );
          pointer-events: none;
        }

        /* CONTENT SECTION */

        .concert-page .events-section,
        .concert-page .explore-section {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 28px 7% 65px;
          margin: 0;
          background: transparent !important;
        }

        /* SEARCH AND GENRE */

        .concert-page .explore-controls {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          max-width: none;
          margin: 0 0 22px;
          padding: 0;
        }

        /* SEARCH BOX */

        .concert-page .search-box.explore-search {
          display: flex;
          align-items: center;
          flex: 1;
          width: auto;
          min-width: 0;
          height: 52px;
          gap: 12px;
          padding: 0 18px;
          border: 1px solid rgba(196, 181, 253, 0.24);
          border-radius: 11px;
          background: rgba(16, 12, 31, 0.90);
          backdrop-filter: blur(12px);
          box-shadow: none;
          transition: border-color 0.25s ease,
            background 0.25s ease;
        }

        .concert-page .search-box.explore-search:focus-within {
          border-color: #a78bfa;
          background: rgba(20, 15, 38, 0.96);
        }

        .concert-page .explore-search svg {
          flex-shrink: 0;
          color: #b9a6e9;
        }

        .concert-page .explore-search input {
          flex: 1;
          width: 100%;
          min-width: 0;
          height: 100%;
          padding: 0;
          margin: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #ffffff;
          box-shadow: none;
          font-family: inherit;
          font-size: 13px;
        }

        .concert-page .explore-search input::placeholder {
          color: #91889f;
        }

        .concert-page .explore-search input::-webkit-search-cancel-button {
          display: none;
        }

        .concert-page .concert-search-clear {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          padding: 0;
          border: none;
          background: transparent;
          color: #b9a6e9;
          font-size: 22px;
          cursor: pointer;
        }

        /* GENRE SELECT */

        .concert-page .genre-select {
          flex-shrink: 0;
          width: 190px;
          height: 52px;
          padding: 0 16px;
          border: 1px solid rgba(196, 181, 253, 0.24);
          border-radius: 11px;
          outline: none;
          background-color: rgba(16, 12, 31, 0.94);
          color: #ffffff;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
        }

        .concert-page .genre-select:focus {
          border-color: #a78bfa;
        }

        .concert-page .genre-select option {
          background: #151126;
          color: #ffffff;
        }

        /* STATUS TABS */

        .concert-page .explore-status-tabs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
          margin: 0 0 30px;
        }

        .concert-page .explore-status-tabs button {
          min-height: 48px;
          padding: 0 25px;
          border: 1px solid rgba(167, 139, 250, 0.20);
          border-radius: 11px;
          background: rgba(20, 15, 38, 0.88);
          color: #c8bfdc;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .concert-page .explore-status-tabs button:hover {
          border-color: #8b5cf6;
          color: #ffffff;
        }

        .concert-page .explore-status-tabs button.active {
          border-color: #8b5cf6;
          background: #8b5cf6;
          color: #ffffff;
        }

        /* RESULT COUNT */

        .concert-page .explore-result-count {
          margin: 0 0 27px;
          color: #c1b8d5;
          font-size: 13px;
          line-height: 1.6;
        }

        /* CONCERT GRID */

        .concert-page .concert-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
          width: 100%;
          margin: 0;
          padding: 0;
          background: transparent;
        }

        .concert-page .concert-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
          max-width: none;
          overflow: hidden;
          border: 1px solid rgba(196, 181, 253, 0.10);
          border-radius: 13px;
          background: rgba(13, 10, 27, 0.94);
          transition: transform 0.25s ease,
            border-color 0.25s ease;
        }

        .concert-page .concert-card:hover {
          transform: translateY(-4px);
          border-color: rgba(167, 139, 250, 0.45);
        }

        /* POSTER */

        .concert-page .concert-image {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          padding: 0;
          overflow: hidden;
          background: #090714;
        }

        .concert-page .concert-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.4s ease;
        }

        .concert-page .concert-card:hover .concert-image img {
          transform: scale(1.035);
        }

        .concert-page .category-badge {
          position: absolute;
          top: 13px;
          left: 13px;
          padding: 7px 12px;
          border-radius: 7px;
          background: rgba(13, 10, 27, 0.94);
          color: #c4b5fd;
          font-size: 11px;
          font-weight: 600;
        }

        /* CONCERT INFORMATION */

        .concert-page .concert-info {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-width: 0;
          padding: 17px;
        }

        .concert-page .concert-date {
          margin: 0 0 9px;
          color: #a78bfa;
          font-size: 12px;
        }

        .concert-page .concert-info h3 {
          margin: 0 0 7px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 750;
          line-height: 1.4;
        }

        .concert-page .artist {
          margin: 0 0 9px;
          color: #c3bbd2;
          font-size: 12px;
          line-height: 1.6;
        }

        .concert-page .location {
          margin: 0 0 13px;
          color: #a49bb5;
          font-size: 12px;
        }

        /* TAGS */

        .concert-page .concert-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 17px;
        }

        .concert-page .concert-tags span {
          padding: 6px 9px;
          border: 1px solid rgba(167, 139, 250, 0.18);
          border-radius: 5px;
          background: rgba(139, 92, 246, 0.10);
          color: #c4b5fd;
          font-size: 10px;
        }

        /* PRICE AND DETAIL */

        .concert-page .card-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
          padding-top: 13px;
          border-top: 1px solid rgba(196, 181, 253, 0.12);
        }

        .concert-page .card-bottom > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .concert-page .price-label {
          color: #91889f;
          font-size: 10px;
        }

        .concert-page .card-bottom strong {
          color: #ffffff;
          font-size: 13px;
          line-height: 1.4;
        }

        .concert-page .detail-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          min-height: 35px;
          padding: 0 15px;
          border-radius: 7px;
          background: #8b5cf6;
          color: #ffffff;
          font-size: 11px;
          font-weight: 650;
          text-decoration: none;
          transition: 0.25s ease;
        }

        .concert-page .detail-btn:hover {
          background: #7042d4;
        }

        /* EMPTY STATE */

        .concert-page .empty-state {
          padding: 50px 15px;
          color: #b9a6e9;
          font-size: 14px;
          text-align: center;
        }

        /* TABLET */

        @media (min-width: 641px) and (max-width: 1024px) {

          .concert-page .concert-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }

          .concert-page .events-section {
            padding-left: 5%;
            padding-right: 5%;
          }

        }

        /* MOBILE */

        @media (max-width: 640px) {

          .concert-page .events-section,
          .concert-page .explore-section {
            padding: 20px 5% 45px;
          }

          .concert-page .explore-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-bottom: 16px;
          }

          .concert-page .search-box.explore-search {
            width: 100%;
            height: 46px;
          }

          .concert-page .genre-select {
            width: 100%;
            height: 44px;
          }

          .concert-page .explore-status-tabs {
            gap: 8px;
            margin-bottom: 23px;
          }

          .concert-page .explore-status-tabs button {
            min-height: 40px;
            padding: 0 15px;
            font-size: 11px;
          }

          .concert-page .explore-result-count {
            margin-bottom: 20px;
          }

          .concert-page .concert-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }

          .concert-page .concert-image {
            aspect-ratio: 3 / 4;
          }

        }

      `}</style>

    </main>
  );
}
