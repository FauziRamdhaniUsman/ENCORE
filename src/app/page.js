
"use client";

import { useState } from "react";
import Link from "next/link";
import { concerts, formatPrice } from "../data/concerts";

// ======================================
// IMAGE HELPER
// ======================================

const imageExtensions = ["jpg", "jpeg", "png", "webp"];

function LocalPhoto({
  name,
  alt,
  className = "",
  loading = "lazy",
}) {
  const [extensionIndex, setExtensionIndex] = useState(0);

  return (
    <img
      className={className}
      src={`/images/${name}.${imageExtensions[extensionIndex]}`}
      alt={alt}
      loading={loading}
      onError={() => {
        if (extensionIndex < imageExtensions.length - 1) {
          setExtensionIndex((current) => current + 1);
        }
      }}
    />
  );
}

// ======================================
// HERO PHOTOS
// ======================================

const heroPhotos = [
  "konser 1",
  "konser 2",
  "konser 3",
  "konser 4",
  "konser 5",
];

// ======================================
// GALLERY PREVIEW
// HOME MENGGUNAKAN GALERI 1 - 3
// EXPERIENCE NANTI GALERI 1 - 8
// ======================================

const galleryPreview = [
  { name: "galeri 1", title: "Concert Gallery 1" },
  { name: "galeri 2", title: "Concert Gallery 2" },
  { name: "galeri 3", title: "Concert Gallery 3" },
];

// ======================================
// ABOUT US ICONS
// ======================================

function AboutIcon({ type }) {
  const common = {
    width: 48,
    height: 48,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "innovative") {
    return (
      <svg {...common}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14a6 6 0 1 0-6.18 0c.7.5 1.09 1.2 1.09 2v2h4v-2c0-.8.39-1.5 1.09-2Z" />
        <path d="M12 2V1" />
        <path d="m4.93 4.93-.7-.7" />
        <path d="M19.07 4.93l.7-.7" />
      </svg>
    );
  }

  if (type === "quality") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="5" />
        <path d="m8.8 12-1.5 9L12 18l4.7 3-1.5-9" />
        <path d="m10.3 8 1.2 1.2 2.3-2.4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

// ======================================
// HOME PAGE
// ======================================

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [concertIndex, setConcertIndex] = useState(0);

  const featuredConcert = concerts[concertIndex];

  const changeHero = (direction) => {
    setHeroIndex(
      (current) =>
        (current + direction + heroPhotos.length) %
        heroPhotos.length
    );
  };

  const changeConcert = (direction) => {
    if (!concerts.length) return;

    setConcertIndex(
      (current) =>
        (current + direction + concerts.length) %
        concerts.length
    );
  };

  return (
    <main className="encore-home-2026">

      {/* ======================================
          01 HERO PHOTO SLIDER
          TIDAK DIUBAH
      ====================================== */}

      <section
        className="eh-hero"
        aria-label="ENCORE concert photography slider"
      >
        <div className="eh-hero-photo" key={heroIndex}>
          <LocalPhoto
            name={heroPhotos[heroIndex]}
            alt={`ENCORE concert atmosphere ${heroIndex + 1}`}
            loading="eager"
          />
        </div>

        <div className="eh-hero-shade" />

        <button
          className="eh-hero-arrow eh-left"
          type="button"
          onClick={() => changeHero(-1)}
          aria-label="Previous hero photo"
        >
          ‹
        </button>

        <button
          className="eh-hero-arrow eh-right"
          type="button"
          onClick={() => changeHero(1)}
          aria-label="Next hero photo"
        >
          ›
        </button>

        <div className="eh-hero-bottom">
          <div className="eh-hero-hairlines">
            {heroPhotos.map((photo, index) => (
              <button
                type="button"
                key={photo}
                onClick={() => setHeroIndex(index)}
                className={index === heroIndex ? "active" : ""}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={index === heroIndex}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          02 ABOUT US
          TIDAK DIUBAH
      ====================================== */}

      <section
        className="eh-about"
        aria-labelledby="eh-about-title"
      >
        <div className="eh-about-background">
          <LocalPhoto
            name="bg about"
            alt="Suasana konser sebagai latar belakang About ENCORE"
          />
        </div>

        <div className="eh-about-overlay" />

        <div className="eh-about-content">

          <div className="eh-about-heading">
            <h2 id="eh-about-title">ABOUT US</h2>
            <div className="eh-about-line" />
          </div>

          <div className="eh-about-slogan">
            <h3>
              Every Concert
              <br />
              Starts with <em>ENCORE.</em>
            </h3>

            <span className="eh-about-tagline">
              Where Music Meets Memories.
            </span>
          </div>

          <div className="eh-about-description">
            <p>
              ENCORE adalah platform eksplorasi konser dan
              festival musik yang membantu kamu menemukan
              pengalaman live music favorit dengan lebih
              mudah. Mulai dari konser musisi lokal hingga
              artis internasional yang tampil di Indonesia,
              ENCORE hadir untuk menghubungkan pencinta musik
              dengan berbagai pilihan konser dan festival
              dalam satu tempat.
            </p>
          </div>

          <div className="eh-about-values">

            <div className="eh-about-value">
              <div className="eh-about-value-icon">
                <AboutIcon type="innovative" />
              </div>

              <div className="eh-about-value-line" />

              <h4>Innovative</h4>

              <p>
                Menghadirkan ide-ide segar dan kreatif
                untuk menciptakan pengalaman eksplorasi
                konser yang menarik dan mudah diakses.
              </p>
            </div>

            <div className="eh-about-value">
              <div className="eh-about-value-icon">
                <AboutIcon type="quality" />
              </div>

              <div className="eh-about-value-line" />

              <h4>Quality</h4>

              <p>
                Mengutamakan kualitas informasi dan layanan
                dengan memperhatikan setiap detail untuk
                memberikan pengalaman terbaik bagi pengguna.
              </p>
            </div>

            <div className="eh-about-value">
              <div className="eh-about-value-icon">
                <AboutIcon type="reliable" />
              </div>

              <div className="eh-about-value-line" />

              <h4>Reliable</h4>

              <p>
                Berkomitmen menghadirkan informasi yang jelas
                serta layanan yang dapat diandalkan untuk
                memenuhi kebutuhan pencinta musik.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================
          03 FEATURED CONCERTS
          TIDAK DIUBAH
      ====================================== */}

      <section
        className="eh-featured"
        id="featured-concerts"
        aria-label="Featured Concerts"
      >
        {featuredConcert && (
          <div className="eh-feature-slider">

            <div
              className="eh-feature-content"
              key={featuredConcert.id}
            >
              <div className="eh-feature-backdrop" />

              <div className="eh-feature-overlay" />

              <div className="eh-feature-layout">

                <div className="eh-feature-copy">

                  <h2 className="eh-feature-title">
                    {featuredConcert.title}
                  </h2>

                  <p className="eh-feature-subtitle">
                    {featuredConcert.subtitle ||
                      featuredConcert.artist}
                  </p>

                  <div className="eh-feature-meta">
                    <div>
                      <span>◷</span>
                      {featuredConcert.date}
                    </div>

                    <div>
                      <span>⌖</span>
                      {featuredConcert.venue ||
                        featuredConcert.location}
                    </div>
                  </div>

                  <div className="eh-feature-price">
                    <span>STARTING FROM</span>

                    <strong>
                      {formatPrice(featuredConcert.price)}
                    </strong>
                  </div>

                  <div className="eh-feature-actions">
                    <Link
                      className="eh-purple-button"
                      href={`/concerts/${featuredConcert.id}`}
                    >
                      Explore Event
                    </Link>

                    <Link
                      className="eh-outline-button"
                      href="/concerts"
                    >
                      View All Concerts
                    </Link>
                  </div>
                </div>

                <div className="eh-feature-visual">
                  <div className="eh-feature-poster">
                    <img
                      src={featuredConcert.image}
                      alt={`Poster ${featuredConcert.title}`}
                    />
                  </div>

                  <div className="eh-poster-caption">
                    <span>ENCORE SELECTED EVENTS</span>
                    <span>EST. 2026</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="eh-feature-navigation">

              <div className="eh-feature-arrows">
                <button
                  type="button"
                  onClick={() => changeConcert(-1)}
                  aria-label="Previous concert"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => changeConcert(1)}
                  aria-label="Next concert"
                >
                  ›
                </button>
              </div>

            </div>

          </div>
        )}
      </section>

      {/* ======================================
          04 GALLERY PREVIEW

          REVISI TERBARU:
          - TANPA JUDUL GALLERY
          - LANGSUNG TIGA FOTO
          - FOTO TANPA TEKS
          - NAMA FILE GALERI 1, 2, 3
          - TOMBOL DI KANAN BAWAH
      ====================================== */}

      <section
        className="eh-gallery"
        aria-label="ENCORE Gallery"
      >

        <div
          className="eh-gallery-background"
          aria-hidden="true"
        />

        <div
          className="eh-gallery-background-overlay"
          aria-hidden="true"
        />

        {/* LANGSUNG FOTO TANPA HEADING */}

        <div className="eh-gallery-grid">

          {galleryPreview.map((photo, index) => (
            <Link
              href="/experience"
              key={photo.name}
              className={
                index === 0
                  ? "eh-gallery-item eh-gallery-large"
                  : "eh-gallery-item"
              }
              aria-label={`Explore ${photo.title} gallery`}
            >
              <LocalPhoto
                name={photo.name}
                alt={photo.title}
              />
            </Link>
          ))}

        </div>

        {/* EXPLORE FULL GALLERY DI KANAN BAWAH */}

        <div className="eh-gallery-bottom">
          <Link
            href="/experience"
            className="eh-outline-button"
          >
            Explore Full Gallery
          </Link>
        </div>

      </section>

      {/* FOOTER GLOBAL DARI SITESHELL */}

      <style>{`

        /* ================================
           HOME GLOBAL
        ================================= */

        .encore-home-2026 {
          width: 100%;
          min-height: 100vh;
          background: #090714;
          color: #ffffff;
          overflow: hidden;
        }

        .encore-home-2026 * {
          box-sizing: border-box;
        }

        .encore-home-2026 a {
          text-decoration: none;
        }

        .encore-home-2026 h1,
        .encore-home-2026 h2,
        .encore-home-2026 h3,
        .encore-home-2026 h4 {
          font-family: "Outfit", sans-serif;
        }

        .encore-home-2026 em {
          font-style: normal;
          color: #a78bfa;
        }

        .eh-overline {
          display: block;
          color: #a78bfa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        /* ================================
           HERO PHOTO SLIDER
           TIDAK DIUBAH
        ================================= */

        .eh-hero {
          position: relative;
          width: 100%;
          height: calc(100svh - 76px);
          min-height: 500px;
          background: #090714;
          overflow: hidden;
        }

        .eh-hero-photo {
          position: absolute;
          inset: 0;
          animation: ehFade .55s ease;
        }

        @keyframes ehFade {
          from {
            opacity: .45;
          }

          to {
            opacity: 1;
          }
        }

        .eh-hero-photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .eh-hero-shade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            0deg,
            rgba(9,7,20,.7),
            transparent 22%,
            transparent 85%,
            rgba(9,7,20,.12)
          );
        }

        .eh-hero-arrow {
          position: absolute;
          z-index: 2;
          top: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 76px;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          color: #ffffffd9;
          font-family: Arial, sans-serif;
          font-size: 58px;
          font-weight: 200;
          line-height: 1;
          cursor: pointer;
          transform: translateY(-50%);
          transition: color .2s, opacity .2s;
        }

        .eh-hero-arrow:hover {
          color: #c4b5fd;
          background: transparent;
        }

        .eh-left {
          left: 24px;
        }

        .eh-right {
          right: 24px;
        }

        .eh-hero-bottom {
          position: absolute;
          z-index: 2;
          bottom: 28px;
          left: 7%;
          right: 7%;
        }

        .eh-hero-hairlines {
          display: flex;
          gap: 9px;
          max-width: 480px;
          margin: 0 auto;
        }

        .eh-hero-hairlines button {
          flex: 1;
          height: 3px;
          padding: 0;
          border: 0;
          border-radius: 10px;
          background: #ffffff85;
          cursor: pointer;
          transition: .2s;
        }

        .eh-hero-hairlines button.active {
          background: #c4b5fd;
          box-shadow: 0 0 14px #8b5cf6;
        }

        /* ================================
           ABOUT US
           TIDAK DIUBAH
        ================================= */

        .eh-about {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          min-height: 610px;
          padding: 72px 7% 85px;
          background: #090714;
          border-top: 1px solid #302747;
          text-align: center;
        }

        .eh-about-background {
          position: absolute;
          z-index: -2;
          inset: 0;
          pointer-events: none;
        }

        .eh-about-background img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .eh-about-overlay {
          position: absolute;
          z-index: -1;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(9,7,20,.91) 0%,
            rgba(9,7,20,.78) 43%,
            rgba(9,7,20,.94) 100%
          );
        }

        .eh-about-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }

        .eh-about-heading h2 {
          margin: 0;
          color: #fff;
          font-size: clamp(26px, 2.8vw, 37px);
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: 1.6px;
        }

        .eh-about-line {
          width: 53px;
          height: 3px;
          margin: 16px auto 0;
          border-radius: 10px;
          background: #8b5cf6;
        }

        .eh-about-slogan {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 21px;
        }

        .eh-about-slogan h3 {
          margin: 0;
          color: #fff;
          font-size: clamp(31px, 4vw, 52px);
          line-height: 1.17;
          font-weight: 800;
          letter-spacing: -1.2px;
        }

        .eh-about-tagline {
          display: block;
          margin-top: 15px;
          color: #d4c4f2;
          font-size: clamp(13px, 1.3vw, 16px);
          font-weight: 500;
          letter-spacing: .2px;
        }

        .eh-about-description {
          max-width: 820px;
          margin: 25px auto 0;
        }

        .eh-about-description p {
          margin: 0;
          color: #e2d9ec;
          font-size: 14px;
          line-height: 1.95;
        }

        .eh-about-values {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 35px;
          margin-top: 43px;
        }

        .eh-about-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 0;
          padding: 12px;
        }

        .eh-about-value-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 62px;
          height: 62px;
          color: #c4b5fd;
        }

        .eh-about-value-icon svg {
          width: 48px;
          height: 48px;
        }

        .eh-about-value-line {
          width: 35px;
          height: 2px;
          margin: 13px 0 15px;
          background: #8b5cf6;
        }

        .eh-about-value h4 {
          margin: 0;
          color: white;
          font-size: 20px;
          line-height: 1.3;
          font-weight: 700;
        }

        .eh-about-value p {
          max-width: 310px;
          margin: 11px 0 0;
          color: #c6bcd3;
          font-size: 13px;
          line-height: 1.85;
        }

        /* ================================
           BUTTONS
           TIDAK DIUBAH
        ================================= */

        .eh-purple-button,
        .eh-outline-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-height: 45px;
          padding: 12px 19px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          transition: .2s;
        }

        .eh-purple-button {
          background: #8b5cf6;
          color: white;
        }

        .eh-purple-button:hover {
          background: #7c3aed;
        }

        .eh-outline-button {
          border: 1px solid #8e7aab;
          background: #ffffff0b;
          color: white;
        }

        .eh-outline-button:hover {
          border-color: #a78bfa;
          background: #8b5cf625;
        }

        /* ================================
           FEATURED CONCERTS
           TIDAK DIUBAH
        ================================= */

        .eh-featured {
          padding: 0;
          background: #0d0a1b;
          border-top: 1px solid #302747;
        }

        .eh-feature-slider {
          position: relative;
          height: 650px;
          overflow: hidden;
          background: #090714;
        }

        .eh-feature-content {
          position: absolute;
          inset: 0;
          animation: ehFade .45s ease;
        }

        .eh-feature-backdrop {
          position: absolute;
          inset: 0;
          background-image: url("/images/BG konser.jpg");
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          filter: brightness(.7);
        }

        .eh-feature-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(9,7,20,.92) 0%,
              rgba(9,7,20,.79) 46%,
              rgba(9,7,20,.63) 100%
            ),
            linear-gradient(
              0deg,
              rgba(9,7,20,.88),
              transparent 40%
            );
        }

        .eh-feature-layout {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          align-items: center;
          gap: 48px;
          max-width: 1350px;
          height: 100%;
          margin: auto;
          padding: 38px 7% 90px;
        }

        .eh-feature-copy {
          min-width: 0;
        }

        .eh-feature-title {
          margin: 0;
          font-size: clamp(35px,4.4vw,62px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -1.5px;
          overflow-wrap: break-word;
        }

        .eh-feature-subtitle {
          margin-top: 13px;
          color: #d2c5df;
          font-size: 16px;
          line-height: 1.6;
        }

        .eh-feature-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 23px;
          margin-top: 20px;
        }

        .eh-feature-meta > div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ddd5e9;
          font-size: 12px;
          line-height: 1.7;
        }

        .eh-feature-meta > div span {
          color: #b19aff;
          font-size: 18px;
        }

        .eh-feature-price {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          margin-top: 22px;
        }

        .eh-feature-price > span {
          color: #a5a0b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .eh-feature-price strong {
          color: #d7c4ff;
          font-size: clamp(24px,2.6vw,31px);
        }

        .eh-feature-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 23px;
        }

        /* POSTER KONSER */

        .eh-feature-visual {
          width: 100%;
          min-width: 0;
        }

        .eh-feature-poster {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 455px;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }

        .eh-feature-poster img {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 24px 55px rgba(0,0,0,.42);
        }

        .eh-poster-caption {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
          color: #ada0bd;
          font-size: 9px;
          letter-spacing: 1.3px;
        }

        /* NAVIGASI KONSER */

        .eh-feature-navigation {
          position: absolute;
          z-index: 5;
          bottom: 21px;
          left: 7%;
          right: 7%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 20px;
          max-width: 1160px;
          margin: 0 auto;
          padding-top: 15px;
          border: none;
        }

        .eh-feature-arrows {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .eh-feature-arrows button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 42px;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          color: #ffffff;
          font-family: Arial, sans-serif;
          font-size: 43px;
          font-weight: 200;
          line-height: 1;
          cursor: pointer;
          transition: color .2s;
        }

        .eh-feature-arrows button:hover {
          border: none;
          background: transparent;
          color: #c4b5fd;
        }

        /* ================================
           GALLERY PREVIEW

           TANPA JUDUL
           LANGSUNG 3 FOTO
        ================================= */

        .eh-gallery {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: 90px 7%;
          background: #090714;
          border-top: 1px solid #302747;
        }

        /* BACKGROUND GALERI TETAP */

        .eh-gallery-background {
          position: absolute;
          z-index: 0;
          inset: 0;
          background-image: url("/images/BG galeri.jpg");
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          pointer-events: none;
        }

        .eh-gallery-background-overlay {
          position: absolute;
          z-index: 1;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(9,7,20,.92) 0%,
            rgba(9,7,20,.78) 45%,
            rgba(9,7,20,.94) 100%
          );
          pointer-events: none;
        }

        .eh-gallery-grid,
        .eh-gallery-bottom {
          position: relative;
          z-index: 2;
        }

        /* TIGA FOTO TANPA TEKS */

        .eh-gallery-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          grid-template-rows: 220px 220px;
          gap: 15px;
        }

        .eh-gallery-item {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #49316d;
          border-radius: 14px;
          background: #211735;
        }

        .eh-gallery-large {
          grid-column: 1;
          grid-row: 1 / span 2;
        }

        .eh-gallery-item img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s;
        }

        .eh-gallery-item:hover img {
          transform: scale(1.06);
        }

        /* TOMBOL KANAN BAWAH */

        .eh-gallery-bottom {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 32px;
          padding: 0;
          border: none;
        }

        /* ================================
           TABLET
        ================================= */

        @media (max-width: 1100px) {

          .eh-about-values {
            gap: 20px;
          }

          .eh-feature-slider {
            height: 610px;
          }

          .eh-feature-layout {
            gap: 25px;
            padding-left: 5%;
            padding-right: 5%;
          }

          .eh-feature-poster {
            height: 415px;
          }

          .eh-feature-title {
            font-size: clamp(34px,4.5vw,49px);
          }

        }

        /* ================================
           SHORT LAPTOP SCREEN
        ================================= */

        @media (min-width: 701px) and (max-height: 740px) {

          .eh-feature-slider {
            height: 570px;
          }

          .eh-feature-layout {
            padding-top: 25px;
            padding-bottom: 82px;
          }

          .eh-feature-poster {
            height: 380px;
          }

          .eh-feature-title {
            font-size: clamp(33px,4vw,48px);
          }

          .eh-feature-price {
            margin-top: 15px;
          }

        }

        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 700px) {

          /* HERO MOBILE */

          .eh-hero {
            height: calc(100svh - 65px);
            min-height: 420px;
          }

          .eh-hero-arrow {
            width: 43px;
            height: 62px;
            font-size: 49px;
          }

          .eh-left {
            left: 10px;
          }

          .eh-right {
            right: 10px;
          }

          /* ABOUT US MOBILE */

          .eh-about {
            min-height: auto;
            padding: 58px 5% 70px;
          }

          .eh-about-heading h2 {
            font-size: 29px;
          }

          .eh-about-line {
            margin-top: 14px;
          }

          .eh-about-slogan {
            margin-top: 18px;
          }

          .eh-about-slogan h3 {
            font-size: clamp(30px, 7.4vw, 43px);
          }

          .eh-about-tagline {
            font-size: 13px;
          }

          .eh-about-description {
            margin-top: 23px;
          }

          .eh-about-description p {
            font-size: 13px;
            line-height: 1.9;
          }

          .eh-about-values {
            grid-template-columns: 1fr;
            gap: 18px;
            margin-top: 33px;
          }

          .eh-about-value {
            padding: 8px 0;
          }

          .eh-about-value p {
            max-width: 350px;
          }

          /* FEATURED CONCERT MOBILE */

          .eh-featured {
            padding: 0;
          }

          .eh-feature-slider {
            height: auto;
          }

          .eh-feature-content {
            position: relative;
          }

          .eh-feature-layout {
            display: flex;
            flex-direction: column-reverse;
            align-items: stretch;
            gap: 24px;
            padding: 30px 5% 105px;
          }

          .eh-feature-poster {
            height: 325px;
          }

          .eh-feature-poster img {
            max-width: 100%;
            max-height: 100%;
          }

          .eh-feature-title {
            font-size: clamp(34px,8vw,46px);
          }

          .eh-feature-subtitle {
            font-size: 14px;
          }

          /* NAVIGASI MOBILE */

          .eh-feature-navigation {
            left: 5%;
            right: 5%;
            bottom: 20px;
            gap: 13px;
            border: none;
          }

          .eh-feature-arrows {
            gap: 10px;
          }

          .eh-feature-arrows button {
            width: 30px;
            height: 39px;
            font-size: 38px;
          }

          /* GALLERY MOBILE */

          .eh-gallery {
            padding: 75px 5%;
          }

          .eh-gallery-grid {
            grid-template-columns: repeat(2, minmax(0,1fr));
            grid-template-rows: 270px 180px;
            gap: 12px;
          }

          .eh-gallery-large {
            grid-column: 1 / -1;
            grid-row: 1;
          }

          .eh-gallery-item {
            min-height: 0;
          }

          .eh-gallery-bottom {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 28px;
            padding: 0;
            border: none;
          }

        }

        @media (prefers-reduced-motion: reduce) {

          .eh-hero-photo,
          .eh-feature-content {
            animation: none;
          }

          .eh-gallery-item img {
            transition: none;
          }

        }

      `}</style>

    </main>
  );
}
