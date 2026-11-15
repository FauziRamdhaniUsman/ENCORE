"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { concerts, formatPrice } from "../data/concerts";

const imageExtensions = ["jpg", "jpeg", "png", "webp"];

function LocalPhoto({ name, alt, className = "", loading = "lazy" }) {
  const [extensionIndex, setExtensionIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="eh-photo-fallback" role="img" aria-label={alt} />;
  }

  return (
    <img
      className={className}
      src={`/images/${name}.${imageExtensions[extensionIndex]}`}
      alt={alt}
      loading={loading}
      onError={() => {
        if (extensionIndex < imageExtensions.length - 1) {
          setExtensionIndex((current) => current + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}

const heroPhotos = [
  "konser 1",
  "konser 2",
  "konser 3",
  "konser 4",
  "konser 5",
];

const cities = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Semarang",
  "Bali",
];

const cityPhotos = {
  Jakarta: "kota jakarta",
  Bandung: "kota bandung",
  Surabaya: "kota surabaya",
  Yogyakarta: "kota yogyakarta",
  Semarang: "kota semarang",
  Bali: "kota bali",
};

const artists = [
  { name: "Kanye West", photo: "artis 1" },
  { name: "Taylor Swift", photo: "artis 2" },
  { name: "The 1975", photo: "artis 3" },
  { name: "Bruno Mars", photo: "artis 4" },
  { name: "Olivia Rodrigo", photo: "artis 5" },
];

const galleryPreview = Array.from({ length: 9 }, (_, index) => ({
  name: `galeri ${index + 1}`,
  title: `Concert Gallery ${index + 1}`,
}));

const galleryRows = [
  galleryPreview,
  [...galleryPreview].reverse(),
];

const benefits = [
  {
    icon: "ticket",
    title: "Official tickets",
    text: "Semua event datang dari penyelenggara, jadi kamu tahu tiketmu asli.",
  },
  {
    icon: "wallet",
    title: "Easy payment",
    text: "QRIS, e-wallet, atau transfer bank. Pilih yang paling nyaman.",
  },
  {
    icon: "bolt",
    title: "Instant e-ticket",
    text: "Tiket langsung masuk ke akunmu begitu pembayaran selesai.",
  },
  {
    icon: "support",
    title: "Friendly support",
    text: "Bingung atau salah pesan? Tim kami siap membantu.",
  },
];

const steps = [
  {
    number: "01",
    icon: "search",
    title: "Choose Concert",
    text: "Cari artis, kota, atau genre favoritmu.",
  },
  {
    number: "02",
    icon: "payment",
    title: "Make Payment",
    text: "Pilih kategori tiket lalu selesaikan pembayaran.",
  },
  {
    number: "03",
    icon: "ticket",
    title: "Get Your Ticket",
    text: "Tunjukkan e-ticket di pintu masuk dan nikmati konsernya.",
  },
];

const testimonials = [
  {
    name: "Rina",
    city: "Jakarta",
    rating: 5,
    text: "Beli tiketnya cepat banget, e-ticket langsung masuk ke akun. Nggak perlu khawatir soal tiket palsu.",
  },
  {
    name: "Dimas",
    city: "Semarang",
    rating: 5,
    text: "Cari konser berdasarkan kota itu enak. Dalam beberapa menit aku sudah ketemu konser favoritku.",
  },
  {
    name: "Sari",
    city: "Bandung",
    rating: 5,
    text: "Bayar pakai QRIS tinggal scan, langsung beres. Pengalaman beli tiket jadi lebih praktis.",
  },
  {
    name: "Andi",
    city: "Yogyakarta",
    rating: 5,
    text: "Tampilan websitenya menarik dan informasi konsernya mudah dipahami. Jadi lebih gampang cari event.",
  },
  {
    name: "Nadia",
    city: "Surabaya",
    rating: 5,
    text: "Proses pemesanan simpel dan nggak membingungkan. Semua informasi tiket bisa dilihat dalam satu tempat.",
  },
  {
    name: "Fajar",
    city: "Bali",
    rating: 5,
    text: "Suka banget karena bisa menemukan berbagai konser dengan mudah. Jadi nggak ketinggalan event favorit.",
  },
];

const faqs = [
  {
    q: "Bagaimana cara membeli tiket di ENCORE?",
    a: "Pilih konser yang kamu inginkan di halaman Concerts, tentukan kategori dan jumlah tiket, lalu lanjutkan ke proses pembayaran.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kamu dapat memilih metode pembayaran yang tersedia, seperti QRIS, e-wallet, atau transfer bank.",
  },
  {
    q: "Di mana saya bisa melihat e-ticket?",
    a: "Setelah pembayaran berhasil, e-ticket dapat dilihat melalui akun kamu pada bagian My Ticket.",
  },
  {
    q: "Apakah tiket yang sudah dibeli bisa dikembalikan?",
    a: "Kebijakan pengembalian tiket mengikuti ketentuan masing-masing penyelenggara konser. Pastikan membaca informasi event sebelum melakukan pembelian.",
  },
  {
    q: "Apakah saya bisa membeli lebih dari satu tiket?",
    a: "Bisa, selama jumlah tiket yang kamu pesan masih sesuai dengan batas pembelian yang ditentukan pada masing-masing konser.",
  },
  {
    q: "Bagaimana jika saya mengalami kendala saat pemesanan?",
    a: "Kamu bisa menghubungi tim ENCORE melalui halaman About pada bagian Send a Message. Sertakan informasi pesanan agar kami dapat membantu.",
  },
];

function BenefitIcon({ type }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "ticket") {
    return (
      <svg {...common}>
        <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4Z" />
        <path d="M14 7v10" strokeDasharray="2 2" />
      </svg>
    );
  }

  if (type === "wallet") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <path d="M16 14.5h2" />
      </svg>
    );
  }

  if (type === "bolt") {
    return (
      <svg {...common}>
        <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
    </svg>
  );
}

function StepIcon({ type }) {
  const common = {
    width: 25,
    height: 25,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "search") {
    return (
      <svg {...common}>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (type === "payment") {
    return (
      <svg {...common}>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="M2.5 10h19" />
        <path d="M7 15h3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4Z" />
      <path d="M14 7v10" strokeDasharray="2 2" />
    </svg>
  );
}

function ReviewAvatar() {
  return (
    <span className="eh-review-avatar" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </svg>
    </span>
  );
}

export default function Home() {
  const sliderRef = useRef(null);
  const testimonialRef = useRef(null);
  const testimonialTouchX = useRef(null);

  const [heroIndex, setHeroIndex] = useState(0);

  const [sliderEdge, setSliderEdge] = useState({
    start: true,
    end: false,
  });

  const [testimonialIndex, setTestimonialIndex] = useState(testimonials.length);
  const [testimonialStep, setTestimonialStep] = useState(0);
  const [testimonialAnimating, setTestimonialAnimating] = useState(false);

  const recommendedConcerts = concerts.slice(0, 6);

  const upcomingConcerts = [...concerts]
    .sort((a, b) => {
      const da = Date.parse(a.date);
      const db = Date.parse(b.date);

      if (Number.isNaN(da) && Number.isNaN(db)) return 0;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;

      return da - db;
    })
    .slice(0, 4);

  const cityCards = cities.map((name) => ({
    name,
    count: concerts.filter((concert) =>
      (concert.city || concert.location || "")
        .toLowerCase()
        .includes(name.toLowerCase())
    ).length,
  }));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroPhotos.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const changeHero = (direction) => {
    setHeroIndex(
      (current) =>
        (current + direction + heroPhotos.length) % heroPhotos.length
    );
  };

  const updateSliderEdge = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    setSliderEdge({
      start: slider.scrollLeft <= 4,
      end:
        slider.scrollLeft + slider.clientWidth >=
        slider.scrollWidth - 4,
    });
  };

  useEffect(() => {
    updateSliderEdge();
    window.addEventListener("resize", updateSliderEdge);

    return () => {
      window.removeEventListener("resize", updateSliderEdge);
    };
  }, []);

  const slideConcerts = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction * slider.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const viewport = testimonialRef.current;
    if (!viewport) return;

    const measure = () => {
      const card = viewport.querySelector(".eh-testimonial");
      const track = viewport.querySelector(".eh-testimonials-track");
      if (!card || !track) return;

      const gap =
        parseFloat(window.getComputedStyle(track).columnGap) || 18;

      setTestimonialStep(card.getBoundingClientRect().width + gap);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  const slideTestimonials = (direction) => {
    if (testimonialAnimating || !testimonialStep) return;

    setTestimonialAnimating(true);
    setTestimonialIndex((current) => current + direction);
  };

  const handleTestimonialTransitionEnd = (event) => {
    if (event.propertyName !== "transform") return;

    if (testimonialIndex < testimonials.length) {
      setTestimonialIndex(
        (current) => current + testimonials.length
      );
    } else if (testimonialIndex >= testimonials.length * 2) {
      setTestimonialIndex(
        (current) => current - testimonials.length
      );
    }

    setTestimonialAnimating(false);
  };

  const handleTestimonialTouchEnd = (event) => {
    const startX = testimonialTouchX.current;
    if (startX === null) return;

    const distance = event.changedTouches[0].clientX - startX;

    if (Math.abs(distance) > 45) {
      slideTestimonials(distance < 0 ? 1 : -1);
    }

    testimonialTouchX.current = null;
  };

  return (
    <main className="encore-home-2026">
      <h1 className="eh-sr-only">
        ENCORE, tiket konser dan festival musik
      </h1>

      <section className="eh-hero" aria-label="Foto konser">
        <div className="eh-hero-photo" key={heroIndex}>
          <LocalPhoto
            name={heroPhotos[heroIndex]}
            alt={`Suasana konser ${heroIndex + 1}`}
            loading="eager"
          />
        </div>

        <div className="eh-hero-shade" />

        <button
          className="eh-hero-arrow eh-left"
          type="button"
          onClick={() => changeHero(-1)}
          aria-label="Foto sebelumnya"
        >
          ‹
        </button>

        <button
          className="eh-hero-arrow eh-right"
          type="button"
          onClick={() => changeHero(1)}
          aria-label="Foto berikutnya"
        >
          ›
        </button>

        <div className="eh-hero-hairlines">
          {heroPhotos.map((photo, index) => (
            <button
              type="button"
              key={photo}
              onClick={() => setHeroIndex(index)}
              className={index === heroIndex ? "active" : ""}
              aria-label={`Tampilkan foto ${index + 1}`}
              aria-pressed={index === heroIndex}
            />
          ))}
        </div>
      </section>

      <div className="eh-page">
        {recommendedConcerts.length > 0 && (
          <section className="eh-section" id="featured-concerts">
            <div className="eh-section-head">
              <div>
                <h2>Recommendation</h2>
              </div>

              <div className="eh-slider-controls">
                <button
                  type="button"
                  onClick={() => slideConcerts(-1)}
                  disabled={sliderEdge.start}
                  aria-label="Sebelumnya"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => slideConcerts(1)}
                  disabled={sliderEdge.end}
                  aria-label="Berikutnya"
                >
                  ›
                </button>

                <Link href="/concerts" className="eh-outline-button">
                  View All
                </Link>
              </div>
            </div>

            <div
              className="eh-slider"
              ref={sliderRef}
              onScroll={updateSliderEdge}
              tabIndex={0}
              aria-label="Daftar rekomendasi"
            >
              {recommendedConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  href={`/concerts/${concert.id}`}
                  className="eh-poster"
                  aria-label={`Lihat detail ${concert.title}`}
                >
                  <img
                    src={concert.image}
                    alt={`Poster ${concert.title}`}
                    loading="lazy"
                  />

                  <div className="eh-poster-shade" />

                  <h3 className="eh-poster-title">
                    {concert.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="eh-section eh-section-tight">
          <div className="eh-section-head">
            <div>
              <h2>Trending Artists</h2>
            </div>
          </div>

          <div className="eh-artists">
            {artists.map((artist) => (
              <Link
                key={artist.name}
                href={`/concerts?q=${encodeURIComponent(artist.name)}`}
                className="eh-artist"
              >
                <div className="eh-artist-photo">
                  <LocalPhoto name={artist.photo} alt={artist.name} />
                </div>

                <span>{artist.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {upcomingConcerts.length > 0 && (
          <section className="eh-section eh-section-tight">
            <div className="eh-section-head">
              <div>
                <h2>Upcoming Concerts</h2>
              </div>

              <Link href="/concerts" className="eh-outline-button">
                Lihat jadwal lengkap
              </Link>
            </div>

            <div className="eh-upcoming">
              {upcomingConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  href={`/concerts/${concert.id}`}
                  className="eh-up-row"
                >
                  <div className="eh-up-thumb">
                    <img
                      src={concert.image}
                      alt={`Poster ${concert.title}`}
                      loading="lazy"
                    />
                  </div>

                  <div className="eh-up-info">
                    <h3>{concert.title}</h3>
                    <p>{concert.artist || concert.subtitle}</p>

                    <span>
                      ◷ {concert.date} &nbsp;&nbsp; ⌖{" "}
                      {concert.venue || concert.location}
                    </span>
                  </div>

                  <div className="eh-up-action">
                    <div>
                      <small>Mulai dari</small>
                      <strong>{formatPrice(concert.price)}</strong>
                    </div>

                    <span className="eh-ticket-cta">
                      Buy Ticket <span className="eh-ticket-arrow">›</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="eh-section eh-section-tight">
          <div className="eh-section-head">
            <div>
              <h2>Explore by Cities</h2>
            </div>
          </div>

          <div className="eh-cities">
            {cityCards.map((item) => (
              <Link
                key={item.name}
                href={`/concerts?city=${encodeURIComponent(item.name)}`}
                className="eh-photo-card eh-city"
              >
                <LocalPhoto
                  name={cityPhotos[item.name]}
                  alt={`Kota ${item.name}`}
                />

                <div className="eh-photo-card-shade" />

                <div className="eh-photo-card-text">
                  <strong>{item.name}</strong>
                  <span>
                    {item.count > 0
                      ? `${item.count} konser`
                      : "Segera hadir"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="eh-why" aria-labelledby="eh-why-title">
          <div className="eh-why-content">
            <h2 id="eh-why-title">
              Every Concert
              <br />
              Starts with ENCORE.
            </h2>

            <p className="eh-why-tagline">
              Where Music Meets Memories.
            </p>

            <div className="eh-benefits">
              {benefits.map((benefit) => (
                <div className="eh-benefit" key={benefit.title}>
                  <div className="eh-benefit-icon">
                    <BenefitIcon type={benefit.icon} />
                  </div>

                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="eh-section">
          <div className="eh-howto">
            <div className="eh-section-head">
              <h2>How to Buy Tickets</h2>

              <Link href="/concerts" className="eh-purple-button">
                Mulai cari konser
              </Link>
            </div>

            <ol className="eh-steps">
              {steps.map((step) => (
                <li key={step.number}>
                  <div className="eh-step-top">
                    <span className="eh-step-number">
                      {step.number}
                    </span>

                    <span className="eh-step-icon">
                      <StepIcon type={step.icon} />
                    </span>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="eh-gallery" aria-label="Galeri ENCORE">
          <div className="eh-gallery-background" aria-hidden="true" />
          <div className="eh-gallery-background-overlay" aria-hidden="true" />

          <div className="eh-section-head eh-gallery-head">
            <h2>Concert Gallery</h2>
          </div>

          <div className="eh-marquee-wrap">
            {galleryRows.map((row, rowIndex) => (
              <div className="eh-marquee" key={rowIndex}>
                <div
                  className={`eh-marquee-track ${
                    rowIndex === 1 ? "eh-reverse" : ""
                  }`}
                >
                  {[0, 1].map((copy) => (
                    <div
                      className="eh-marquee-group"
                      key={copy}
                      aria-hidden={copy === 1 ? "true" : undefined}
                    >
                      {row.map((photo) => (
                        <div
                          className="eh-marquee-item"
                          key={`${copy}-${photo.name}`}
                        >
                          <LocalPhoto
                            name={photo.name}
                            alt={copy === 1 ? "" : photo.title}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="eh-section">
          <div className="eh-section-head">
            <div>
              <h2>Encore Experience</h2>
            </div>
          </div>

          <div className="eh-testimonial-wrapper">
            <button
              type="button"
              className="eh-review-arrow eh-review-left"
              onClick={() => slideTestimonials(-1)}
              aria-label="Ulasan sebelumnya"
            >
              ‹
            </button>

            <div
              className="eh-testimonials"
              ref={testimonialRef}
              aria-label="Ulasan pengguna"
              onTouchStart={(event) => {
                testimonialTouchX.current = event.touches[0].clientX;
              }}
              onTouchEnd={handleTestimonialTouchEnd}
              onTouchCancel={() => {
                testimonialTouchX.current = null;
              }}
            >
              <div
                className="eh-testimonials-track"
                style={{
                  transform: `translate3d(-${
                    testimonialIndex * testimonialStep
                  }px, 0, 0)`,
                  transition: testimonialAnimating
                    ? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                  visibility: testimonialStep ? "visible" : "hidden",
                }}
                onTransitionEnd={handleTestimonialTransitionEnd}
              >
                {[0, 1, 2].flatMap((copy) =>
                  testimonials.map((item) => (
                    <figure
                      className="eh-testimonial"
                      key={`${copy}-${item.name}`}
                      aria-hidden={copy !== 1}
                    >
                      <figcaption className="eh-review-person">
                        <ReviewAvatar />

                        <span className="eh-review-person-info">
                          <strong>{item.name}</strong>
                          <span>{item.city}</span>
                        </span>
                      </figcaption>

                      <div
                        className="eh-stars"
                        aria-label={`${item.rating} dari 5 bintang`}
                      >
                        {"★".repeat(item.rating)}
                      </div>

                      <blockquote>{item.text}</blockquote>
                    </figure>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              className="eh-review-arrow eh-review-right"
              onClick={() => slideTestimonials(1)}
              aria-label="Ulasan berikutnya"
            >
              ›
            </button>
          </div>
        </section>

        <section className="eh-section eh-section-tight" id="faq">
          <div className="eh-faq-wrap">
            <div className="eh-faq-head">
              <h2>Frequently Asked Questions</h2>
            </div>

            <div className="eh-faq">
              {faqs.map((item) => (
                <details key={item.q} className="eh-faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .encore-home-2026 {
          --bg: #0a0716;
          --surface: rgba(21, 16, 39, .86);
          --line: #2c2247;
          --violet: #8b5cf6;
          --lilac: #c4b5fd;
          --muted: #b9aed0;
          --amber: #fbbf24;
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg);
          background-image:
            linear-gradient(rgba(10, 7, 22, .35), rgba(10, 7, 22, .55)),
            url("/images/bg%20home.jpg");
          background-position: center center;
          background-size: 100% auto;
          background-repeat: repeat-y;
          color: #ffffff;
          overflow: hidden;
        }

        .encore-home-2026 * {
          box-sizing: border-box;
        }

        .encore-home-2026 a {
          text-decoration: none;
          color: inherit;
        }

        .encore-home-2026 h1,
        .encore-home-2026 h2,
        .encore-home-2026 h3 {
          margin: 0;
          font-family: var(--font-outfit), sans-serif;
        }

        .encore-home-2026 :focus-visible {
          outline: 2px solid var(--lilac);
          outline-offset: 3px;
        }

        .eh-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(16px, 5vw, 48px);
        }

        .eh-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .eh-photo-fallback {
          width: 100%;
          height: 100%;
          min-height: 100%;
          background: linear-gradient(135deg, #2a1658, #14102b);
        }

        .eh-purple-button,
        .eh-outline-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background .2s, border-color .2s;
        }

        .eh-purple-button {
          border: none;
          background: var(--violet);
          color: #fff;
        }

        .eh-purple-button:hover {
          background: #7c3aed;
        }

        .eh-outline-button {
          border: 1px solid #8e7aab;
          background: #ffffff0b;
          color: #fff;
        }

        .eh-outline-button:hover {
          border-color: var(--lilac);
          background: #8b5cf625;
        }

        .eh-section {
          padding: 56px 0;
        }

        .eh-section-tight {
          padding-top: 0;
        }

        .eh-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 24px;
        }

        .eh-section-head h2 {
          font-size: clamp(22px, 2.4vw, 30px);
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .eh-section-head p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 14px;
        }

        .eh-hero {
          position: relative;
          width: 100%;
          height: min(620px, 80svh);
          min-height: 320px;
          overflow: hidden;
          background: #14102b;
        }

        .eh-hero-photo {
          position: absolute;
          inset: 0;
          animation: ehFade .6s ease;
        }

        .eh-hero-photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @keyframes ehFade {
          from { opacity: .4; }
          to { opacity: 1; }
        }

        .eh-hero-shade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            0deg,
            rgba(10,7,22,.9),
            transparent 30%
          );
        }

        .eh-hero-arrow {
          position: absolute;
          z-index: 3;
          top: 50%;
          width: 52px;
          height: 76px;
          padding: 0;
          border: none;
          background: transparent;
          color: #ffffffd9;
          font-family: Arial, sans-serif;
          font-size: 54px;
          font-weight: 200;
          line-height: 1;
          cursor: pointer;
          transform: translateY(-50%);
          transition: color .2s;
        }

        .eh-hero-arrow:hover {
          color: var(--lilac);
        }

        .eh-left { left: 24px; }
        .eh-right { right: 24px; }

        .eh-hero-hairlines {
          position: absolute;
          z-index: 3;
          bottom: 24px;
          left: 50%;
          display: flex;
          gap: 8px;
          width: min(320px, 70%);
          transform: translateX(-50%);
        }

        .eh-hero-hairlines button {
          flex: 1;
          height: 3px;
          padding: 0;
          border: 0;
          border-radius: 10px;
          background: #ffffff70;
          cursor: pointer;
        }

        .eh-hero-hairlines button.active {
          background: var(--lilac);
        }

        .eh-slider-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .eh-slider-controls button {
          width: 42px;
          height: 42px;
          padding: 0 0 3px;
          border: 1px solid var(--line);
          border-radius: 50%;
          background: var(--surface);
          color: #fff;
          font-family: Arial, sans-serif;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          transition: border-color .2s, background .2s;
        }

        .eh-slider-controls button:hover {
          border-color: var(--violet);
          background: #8b5cf622;
        }

        .eh-slider-controls button:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .eh-slider {
          display: flex;
          gap: 16px;
          padding: 4px 2px 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: none;
        }

        .eh-slider::-webkit-scrollbar {
          display: none;
        }

        .eh-slider .eh-poster {
          flex: 0 0 min(220px, 66%);
          scroll-snap-align: start;
        }

        .eh-poster {
          position: relative;
          display: block;
          isolation: isolate;
          overflow: hidden;
          aspect-ratio: 4 / 5;
          border-radius: 14px;
          background: #211735;
          box-shadow: inset 0 0 0 1px var(--line);
          transition: box-shadow .3s ease, transform .3s ease;
        }

        .eh-poster:hover {
          box-shadow: 0 12px 30px #0007, 0 0 0 1px var(--violet);
          transform: translateY(-5px);
        }

        .eh-poster img {
          position: absolute;
          z-index: -2;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .5s ease;
        }

        .eh-poster:hover img {
          transform: scale(1.06);
        }

        .eh-poster-shade {
          position: absolute;
          z-index: -1;
          inset: 0;
          background: linear-gradient(
            0deg,
            rgba(10,7,22,.9),
            rgba(10,7,22,0) 45%
          );
        }

        .eh-poster-title {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 14px;
          display: -webkit-box;
          overflow: hidden;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 700;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .eh-ticket-cta {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          overflow: hidden;
          padding: 11px 17px;
          border: 1px solid #a78bfa70;
          border-radius: 9px;
          background: linear-gradient(115deg, #8b5cf6, #7042d4);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 14px #8b5cf630;
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .eh-ticket-cta::before {
          content: "";
          position: absolute;
          z-index: -1;
          top: -50%;
          left: -85%;
          width: 45%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            #ffffff75,
            transparent
          );
          transform: skewX(-22deg);
          transition: left .55s ease;
        }

        .eh-up-row:hover .eh-ticket-cta::before {
          left: 145%;
        }

        .eh-up-row:hover .eh-ticket-cta {
          transform: translateY(-3px) scale(1.035);
          box-shadow: 0 8px 23px #8b5cf660;
          background: linear-gradient(115deg, #a78bfa, #7c3aed);
        }

        .eh-ticket-arrow {
          display: inline-block;
          font-size: 19px;
          line-height: 10px;
          transition: transform .25s ease;
        }

        .eh-up-row:hover .eh-ticket-arrow {
          transform: translateX(4px);
        }

        .eh-artists {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
        }

        .eh-artist {
          text-align: center;
        }

        .eh-artist-photo {
          width: 100%;
          max-width: 140px;
          aspect-ratio: 1;
          margin: 0 auto;
          overflow: hidden;
          border: 2px solid var(--line);
          border-radius: 50%;
          background: #211735;
          transition:
            border-color .25s,
            transform .3s,
            box-shadow .3s;
        }

        .eh-artist-photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s;
        }

        .eh-artist:hover .eh-artist-photo {
          border-color: var(--violet);
          transform: translateY(-4px);
          box-shadow: 0 8px 22px #8b5cf640;
        }

        .eh-artist:hover .eh-artist-photo img {
          transform: scale(1.08);
        }

        .eh-artist span {
          display: block;
          margin-top: 12px;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.35;
        }

        .eh-upcoming {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .eh-up-row {
          display: grid;
          grid-template-columns: 92px 1fr auto;
          align-items: center;
          gap: 18px;
          padding: 12px 18px 12px 12px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--surface);
          transition:
            border-color .25s ease,
            transform .25s ease,
            box-shadow .25s ease;
        }

        .eh-up-row:hover {
          border-color: #8b5cf6a0;
          transform: translateY(-3px);
          box-shadow: 0 10px 26px #0005;
        }

        .eh-up-thumb {
          width: 92px;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 12px;
          background: #211735;
        }

        .eh-up-thumb img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s ease;
        }

        .eh-up-row:hover .eh-up-thumb img {
          transform: scale(1.07);
        }

        .eh-up-info {
          min-width: 0;
        }

        .eh-up-info h3 {
          font-size: 18px;
          line-height: 1.25;
          font-weight: 700;
        }

        .eh-up-info p {
          margin: 4px 0 0;
          color: var(--lilac);
          font-size: 13px;
        }

        .eh-up-info span {
          display: block;
          margin-top: 8px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .eh-up-action {
          display: flex;
          align-items: center;
          gap: 18px;
          text-align: right;
        }

        .eh-up-action small {
          display: block;
          color: var(--muted);
          font-size: 11px;
        }

        .eh-up-action strong {
          display: block;
          margin-top: 2px;
          font-size: 17px;
        }

        .eh-cities {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
        }

        .eh-photo-card {
          position: relative;
          display: block;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 14px;
          background: linear-gradient(135deg, #3b1f7a, #14102b);
          transition:
            border-color .25s,
            transform .3s,
            box-shadow .3s;
        }

        .eh-photo-card:hover {
          border-color: var(--violet);
          transform: translateY(-4px);
          box-shadow: 0 10px 25px #0005;
        }

        .eh-city {
          aspect-ratio: 3 / 4;
        }

        .eh-photo-card img,
        .eh-photo-card .eh-photo-fallback {
          position: absolute;
          z-index: -2;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .5s;
        }

        .eh-photo-card:hover img {
          transform: scale(1.06);
        }

        .eh-photo-card-shade {
          position: absolute;
          z-index: -1;
          inset: 0;
          background: linear-gradient(
            0deg,
            rgba(10,7,22,.88),
            rgba(10,7,22,.1) 60%
          );
        }

        .eh-photo-card-text {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 12px;
        }

        .eh-photo-card-text strong {
          display: block;
          font-family: var(--font-outfit), sans-serif;
          font-size: 19px;
          font-weight: 700;
        }

        .eh-photo-card-text span {
          display: block;
          margin-top: 2px;
          color: var(--lilac);
          font-size: 12px;
          font-weight: 600;
        }

        .eh-why {
          position: relative;
          isolation: isolate;
          margin-top: 15px;
          padding: 25px 0 40px;
          border: none;
          border-radius: 0;
          background: transparent;
        }

        .eh-why-content {
          text-align: center;
          animation: ehWhyEnter .8s ease both;
        }

        .eh-why-content h2 {
          font-size: clamp(26px, 3.4vw, 40px);
          line-height: 1.12;
          font-weight: 800;
          letter-spacing: -1px;
          text-shadow: 0 4px 24px #8b5cf630;
        }

        .eh-why-tagline {
          margin: 10px 0 0;
          color: #d4c4f2;
          font-size: 15px;
        }

        @keyframes ehWhyEnter {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .eh-benefits {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 32px;
        }

        .eh-benefit {
          position: relative;
          overflow: hidden;
          padding: 22px 20px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: rgba(21,16,39,.72);
          backdrop-filter: blur(6px);
          text-align: left;
          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease,
            background .3s ease;
        }

        .eh-benefit:hover {
          transform: translateY(-6px);
          border-color: #8b5cf6a0;
          background: rgba(39,25,68,.88);
          box-shadow: 0 12px 28px #0005;
        }

        .eh-benefit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border: 1px solid #a78bfa45;
          border-radius: 12px;
          background: #8b5cf625;
          color: var(--lilac);
          transition: transform .3s ease, background .3s ease;
        }

        .eh-benefit:hover .eh-benefit-icon {
          transform: scale(1.08);
          background: #8b5cf645;
        }

        .eh-benefit h3 {
          margin-top: 14px;
          font-size: 17px;
          font-weight: 700;
        }

        .eh-benefit p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .eh-howto {
          padding: clamp(22px, 3.5vw, 40px);
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--surface);
        }

        .eh-howto .eh-section-head {
          align-items: center;
          margin-bottom: 30px;
        }

        .eh-steps {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .eh-steps li {
          position: relative;
          min-width: 0;
          min-height: 185px;
          padding: 23px;
          border: 1px solid var(--line);
          border-radius: 15px;
          background: rgba(21,16,39,.72);
          transition:
            transform .3s ease,
            border-color .3s ease,
            background .3s ease;
          animation: ehStepEnter .65s ease both;
        }

        .eh-steps li:nth-child(1) { animation-delay: .08s; }
        .eh-steps li:nth-child(2) { animation-delay: .2s; }
        .eh-steps li:nth-child(3) { animation-delay: .32s; }

        .eh-steps li:hover {
          transform: translateY(-5px);
          border-color: #9b7bea;
          background: rgba(39,25,68,.85);
        }

        @keyframes ehStepEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .eh-step-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .eh-step-number {
          color: #a78bfa;
          font-family: var(--font-outfit), sans-serif;
          font-size: 36px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -2px;
        }

        .eh-step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          border: 1px solid #8b5cf650;
          border-radius: 12px;
          background: #8b5cf618;
          color: #c4b5fd;
          transition: background .3s ease, border-color .3s ease;
        }

        .eh-steps li:hover .eh-step-icon {
          background: #8b5cf632;
          border-color: #a78bfa;
        }

        .eh-steps h3 {
          font-size: 17px;
          line-height: 1.4;
          font-weight: 700;
          transition: color .3s ease;
        }

        .eh-steps li:hover h3 {
          color: #d9c8ff;
        }

        .eh-steps p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.75;
        }

        .eh-gallery {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          padding: 44px 0;
          border: 1px solid var(--line);
          border-radius: 20px;
        }

        .eh-gallery-background {
          position: absolute;
          z-index: 0;
          inset: 0;
          background-image: url("/images/bg galeri.jpg");
          background-position: center;
          background-size: cover;
        }

        .eh-gallery-background-overlay {
          position: absolute;
          z-index: 1;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10,7,22,.92),
            rgba(10,7,22,.78) 45%,
            rgba(10,7,22,.94)
          );
        }

        .eh-gallery-head {
          position: relative;
          z-index: 2;
          padding: 0 clamp(16px, 4vw, 40px);
        }

        .eh-marquee-wrap {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .eh-marquee {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
        }

        .eh-marquee-track {
          display: flex;
          width: max-content;
          animation: ehMarquee 50s linear infinite;
          will-change: transform;
        }

        .eh-marquee-track.eh-reverse {
          animation-direction: reverse;
        }

        .eh-marquee:hover .eh-marquee-track {
          animation-play-state: paused;
        }

        .eh-marquee-group {
          display: flex;
          flex: none;
          gap: 12px;
          padding-right: 12px;
        }

        .eh-marquee-item {
          flex: none;
          width: 270px;
          height: 180px;
          overflow: hidden;
          border: 1px solid #49316d;
          border-radius: 12px;
          background: #211735;
        }

        .eh-marquee-item img,
        .eh-marquee-item .eh-photo-fallback {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s;
        }

        .eh-marquee-item:hover img {
          transform: scale(1.06);
        }

        @keyframes ehMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .eh-testimonial-wrapper {
          position: relative;
          padding: 0 48px;
        }

        .eh-testimonials {
          overflow: hidden;
          padding: 5px 2px 15px;
          touch-action: pan-y;
        }

        .eh-testimonials-track {
          display: flex;
          gap: 18px;
          width: 100%;
          will-change: transform;
        }

        .eh-testimonial {
          flex: 0 0 calc((100% - 36px) / 3);
          min-width: 0;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 25px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--surface);
          transition: border-color .3s ease;
        }

        .eh-testimonial:hover {
          border-color: var(--violet);
        }

        .eh-review-person {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .eh-review-avatar {
          display: grid;
          place-items: center;
          flex: 0 0 46px;
          width: 46px;
          height: 46px;
          border: 1px solid #8b5cf670;
          border-radius: 50%;
          background: #8b5cf628;
          color: var(--lilac);
        }

        .eh-review-avatar svg {
          width: 24px;
          height: 24px;
        }

        .eh-review-person-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .eh-review-person-info strong {
          font-size: 14px;
          font-weight: 700;
        }

        .eh-review-person-info > span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
        }

        .eh-stars {
          color: var(--amber);
          font-size: 17px;
          letter-spacing: 3px;
        }

        .eh-testimonial blockquote {
          flex: 1;
          margin: 12px 0 0;
          color: #e6def2;
          font-size: 14px;
          line-height: 1.8;
        }

        .eh-review-arrow {
          position: absolute;
          z-index: 5;
          top: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          padding: 0 0 4px;
          border: 1px solid #8b5cf680;
          border-radius: 50%;
          background: #211735;
          color: white;
          font-size: 29px;
          line-height: 1;
          cursor: pointer;
          transform: translateY(-50%);
          transition:
            background .25s,
            border-color .25s,
            transform .25s;
        }

        .eh-review-arrow:hover {
          background: #8b5cf6;
          border-color: #a78bfa;
          transform: translateY(-50%) scale(1.08);
        }

        .eh-review-left {
          left: 0;
        }

        .eh-review-right {
          right: 0;
        }

        .eh-faq-wrap {
          max-width: 860px;
          margin: 0 auto;
        }

        .eh-faq-head {
          margin-bottom: 24px;
          text-align: center;
        }

        .eh-faq-head h2 {
          font-size: clamp(22px, 2.4vw, 30px);
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .eh-faq {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .eh-faq-item {
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--surface);
          transition: border-color .2s;
        }

        .eh-faq-item[open] {
          border-color: var(--violet);
        }

        .eh-faq-item summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          list-style: none;
        }

        .eh-faq-item summary::-webkit-details-marker {
          display: none;
        }

        .eh-faq-item summary::after {
          content: "+";
          flex: none;
          color: var(--lilac);
          font-size: 22px;
          font-weight: 300;
          line-height: 1;
        }

        .eh-faq-item[open] summary::after {
          content: "−";
        }

        .eh-faq-item p {
          margin: 0;
          padding: 0 20px 18px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.8;
        }

        @media (max-width: 700px) {
          .encore-home-2026 {
            background-position: center center;
            background-size: 100% auto;
            background-repeat: repeat-y;
          }

          .eh-hero {
            height: 44svh;
            min-height: 240px;
          }

          .eh-hero-arrow {
            display: none;
          }

          .eh-section {
            padding: 44px 0;
          }

          .eh-section-tight {
            padding-top: 0;
          }

          .eh-why {
            margin-top: 15px;
            padding: 25px 0 30px;
          }

          .eh-gallery {
            padding: 36px 0;
          }

          .eh-steps {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .eh-steps li {
            min-height: auto;
            padding: 20px;
          }

          .eh-step-top {
            margin-bottom: 16px;
          }

          .eh-slider-controls button {
            display: none;
          }

          .eh-artists {
            display: flex;
            gap: 18px;
            overflow-x: auto;
            padding-bottom: 6px;
            scrollbar-width: none;
          }

          .eh-artists::-webkit-scrollbar {
            display: none;
          }

          .eh-artist {
            flex: 0 0 96px;
          }

          .eh-up-row {
            grid-template-columns: 76px 1fr;
            gap: 12px;
            padding: 10px;
          }

          .eh-up-thumb {
            width: 76px;
          }

          .eh-up-action {
            grid-column: 1 / -1;
            justify-content: space-between;
            text-align: left;
            padding-top: 10px;
            border-top: 1px dashed var(--line);
          }

          .eh-cities {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .eh-city {
            aspect-ratio: 4 / 5;
          }

          .eh-marquee-item {
            width: 200px;
            height: 135px;
          }

          .eh-marquee-track {
            animation-duration: 40s;
          }

          .eh-testimonial-wrapper {
            padding: 0 35px;
          }

          .eh-testimonial {
            flex: 0 0 100%;
            min-height: 190px;
          }

          .eh-review-arrow {
            width: 30px;
            height: 30px;
            font-size: 23px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .eh-hero-photo,
          .eh-why-content,
          .eh-steps li {
            animation: none;
          }

          .eh-slider {
            scroll-behavior: auto;
          }

          .eh-testimonials-track {
            transition-duration: 0.01ms !important;
          }

          .eh-steps li,
          .eh-step-icon,
          .eh-poster,
          .eh-up-row,
          .eh-benefit,
          .eh-testimonial,
          .eh-photo-card,
          .eh-artist-photo {
            transition: none;
          }

          .eh-poster img,
          .eh-marquee-item img,
          .eh-photo-card img {
            transition: none;
          }

          .eh-marquee {
            overflow-x: auto;
          }

          .eh-marquee-track {
            animation: none;
          }

          .eh-marquee-group[aria-hidden="true"] {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}