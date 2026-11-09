
"use client";

import { useState } from "react";
import Link from "next/link";

const SUPPORT_EMAIL = "";

const contactOptions = [
  {
    icon: "✉",
    title: "Email Support",
    description: "Bantuan seputar tiket dan pemesanan.",
  },
  {
    icon: "♫",
    title: "Live Support",
    description: "Informasi konser dan penggunaan ENCORE.",
  },
  {
    icon: "✦",
    title: "Partnership",
    description: "Peluang kerja sama dan acara musik.",
  },
];

const categories = [
  "Pertanyaan Tiket",
  "Pembayaran",
  "Informasi Konser",
  "Akun Pengguna",
  "Kerja Sama",
  "Lainnya",
];

const faqs = [
  {
    question: "Bagaimana cara membeli tiket di ENCORE?",
    answer:
      "Pilih konser di halaman Concerts, tentukan kategori dan jumlah tiket, lalu ikuti proses pemesanan. Saat ini checkout masih berupa simulasi.",
  },
  {
    question: "Bagaimana cara mendapatkan e-ticket?",
    answer:
      "Fitur e-ticket akan tersedia setelah sistem pembayaran dan pemesanan ENCORE diaktifkan.",
  },
  {
    question: "Apakah tiket bisa dikembalikan?",
    answer:
      "Ketentuan refund mengikuti kebijakan penyelenggara konser dan syarat pembelian yang berlaku.",
  },
  {
    question: "Bagaimana jika terjadi kendala pembayaran?",
    answer:
      "Hubungi tim bantuan dengan menyertakan informasi pemesanan dan kendala yang dialami. Jangan membagikan kata sandi atau OTP.",
  },
  {
    question: "Apakah tersedia tiket VIP?",
    answer:
      "Beberapa konser menyediakan kategori VIP atau paket khusus. Informasi benefit dapat dilihat pada halaman detail konser.",
  },
  {
    question: "Bagaimana cara bekerja sama dengan ENCORE?",
    answer:
      "Pilih kategori Kerja Sama pada formulir Contact dan jelaskan kebutuhan serta rencana kerja sama kamu.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

  const [openFAQ, setOpenFAQ] = useState(null);
  const [notification, setNotification] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setNotification("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.category ||
      !formData.message.trim()
    ) {
      setNotification("Lengkapi semua kolom terlebih dahulu.");
      return;
    }

    if (!SUPPORT_EMAIL) {
      setNotification("Email tujuan ENCORE belum dikonfigurasi.");
      return;
    }

    const subject = encodeURIComponent(
      `[ENCORE] ${formData.category}`
    );

    const body = encodeURIComponent(
      `Halo Tim ENCORE,\n\n` +
      `Nama: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Kategori: ${formData.category}\n\n` +
      `Pesan:\n${formData.message}`
    );

    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    setNotification(
      "Aplikasi email akan dibuka. Silakan kirim pesanmu."
    );
  };

  return (
    <main className="encore-contact-page">

      {/* FULL PAGE BACKGROUND */}

      <div className="contact-background" />
      <div className="contact-background-overlay" />

      {/* CONTACT HERO */}

      <section className="contact-hero">
        <div className="contact-hero-content">

          <h1>
            Let's Talk <span>with Us</span>
          </h1>

          <p>
            Ada pertanyaan atau ingin bekerja sama?
            Kami siap membantu.
          </p>

        </div>
      </section>

      {/* CONTACT OPTIONS */}

      <section className="contact-options-section">

        <div className="contact-options">

          {contactOptions.map((item) => (
            <div className="contact-option" key={item.title}>

              <div className="contact-option-icon">
                {item.icon}
              </div>

              <div className="contact-option-content">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* SEND MESSAGE */}

      <section
        className="contact-form-section"
        id="contact-form"
      >

        <div className="contact-form-card">

          <div className="contact-form-heading">
            <h2>Send a Message</h2>

            <p>
              Sampaikan pertanyaan atau pesanmu kepada tim ENCORE.
            </p>
          </div>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <div className="contact-field">
              <label htmlFor="contact-name">
                Nama Lengkap *
              </label>

              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">
                Email *
              </label>

              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-category">
                Kategori *
              </label>

              <select
                id="contact-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Pilih kategori
                </option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="contact-field contact-message-field">
              <label htmlFor="contact-message">
                Pesan *
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="Tuliskan pesanmu di sini..."
                value={formData.message}
                onChange={handleChange}
                maxLength={2000}
                required
              />

              <small>
                {formData.message.length}/2000
              </small>
            </div>

            {notification && (
              <p className="contact-notification" role="status">
                {notification}
              </p>
            )}

            <button
              type="submit"
              className="contact-submit-btn"
            >
              Send Message <span>›</span>
            </button>

          </form>

        </div>

      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}

      <section className="contact-faq-section">

        <div className="contact-faq-heading">

          <h2>Frequently Asked Questions</h2>

          <p>
            Temukan jawaban atas pertanyaan seputar ENCORE.
          </p>

        </div>

        <div className="contact-faq-list">

          {faqs.map((faq, index) => {
            const isOpen = openFAQ === index;

            return (
              <article
                className={`contact-faq-item ${
                  isOpen ? "open" : ""
                }`}
                key={faq.question}
              >

                <button
                  type="button"
                  className="contact-faq-question"
                  onClick={() =>
                    setOpenFAQ(isOpen ? null : index)
                  }
                  aria-expanded={isOpen}
                >

                  <strong>{faq.question}</strong>

                  <span className="contact-faq-toggle">
                    {isOpen ? "‹" : "›"}
                  </span>

                </button>

                {isOpen && (
                  <div className="contact-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}

              </article>
            );
          })}

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">
        <Link href="/" className="logo">
          EN<span>CORE</span>
        </Link>

        <p>Temukan pengalaman. Ciptakan kenangan.</p>

        <small>© 2026 ENCORE</small>
      </footer>

      {/* CONTACT PAGE CSS */}

      <style jsx global>{`

        /* =====================================
           MAIN PAGE
        ===================================== */

        .encore-contact-page {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #090714;
          color: #ffffff;
          font-family: inherit;
        }

        .encore-contact-page * {
          box-sizing: border-box;
        }

        /* =====================================
           FULL PAGE BACKGROUND
        ===================================== */

        .contact-background {
          position: absolute;
          z-index: -2;
          inset: 0;

          background-image: url("/images/bg%20concerts.jpg");
          background-position: center top;
          background-size: cover;
          background-repeat: no-repeat;

          pointer-events: none;
        }

        .contact-background-overlay {
          position: absolute;
          z-index: -1;
          inset: 0;

          background: linear-gradient(
            180deg,
            rgba(9, 7, 20, 0.58) 0%,
            rgba(9, 7, 20, 0.72) 30%,
            rgba(9, 7, 20, 0.82) 65%,
            rgba(9, 7, 20, 0.93) 100%
          );

          pointer-events: none;
        }

        /* =====================================
           SECTION BACKGROUND
           SEMUA SECTION TRANSPARAN
        ===================================== */

        .encore-contact-page .contact-hero,
        .encore-contact-page .contact-options-section,
        .encore-contact-page .contact-form-section,
        .encore-contact-page .contact-faq-section {
          position: relative;
          z-index: 1;
          background: transparent !important;
        }

        /* =====================================
           HERO
        ===================================== */

        .contact-hero {
          display: flex;
          justify-content: center;
          align-items: center;

          min-height: 245px;
          padding: 55px 7% 30px;

          text-align: center;
        }

        .contact-hero h1 {
          margin: 0;
          font-size: clamp(34px, 4.5vw, 49px);
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -1.5px;
        }

        .contact-hero h1 span {
          color: #a78bfa;
        }

        .contact-hero p {
          margin: 12px auto 0;
          color: #d0c8df;
          font-size: 13px;
          line-height: 1.8;
        }

        /* =====================================
           CONTACT OPTIONS
        ===================================== */

        .contact-options-section {
          padding: 15px 7% 55px;
        }

        .contact-options {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 35px;

          max-width: 1050px;
          margin: 0 auto;
        }

        .contact-option {
          display: flex;
          align-items: flex-start;
          gap: 15px;

          padding: 10px 0;

          background: transparent;
          border: none;
        }

        .contact-option-icon {
          flex-shrink: 0;
          color: #b69aff;
          font-size: 27px;
          line-height: 1.3;
        }

        .contact-option-content h2 {
          margin: 0 0 7px;
          font-size: 16px;
          font-weight: 700;
        }

        .contact-option-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 12px;
          line-height: 1.8;
        }

        /* =====================================
           SEND MESSAGE
        ===================================== */

        .contact-form-section {
          padding: 45px 7% 60px;
        }

        .contact-form-card {
          width: 100%;
          max-width: 1050px;

          margin: 0 auto;
          padding: 32px 42px;

          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 13px;

          background: rgba(17, 12, 32, 0.84);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .contact-form-heading {
          margin-bottom: 23px;
        }

        .contact-form-heading h2 {
          margin: 0;
          font-size: 27px;
          font-weight: 800;
        }

        .contact-form-heading p {
          margin-top: 7px;
          color: #c0b8d0;
          font-size: 12px;
        }

        .contact-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px 22px;
        }

        .contact-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .contact-field label {
          color: #eee8f8;
          font-size: 12px;
          font-weight: 600;
        }

        .contact-field input,
        .contact-field select,
        .contact-field textarea {
          width: 100%;
          padding: 12px 14px;

          border: 1px solid #493d60;
          border-radius: 7px;
          outline: none;

          background: rgba(9, 7, 20, 0.88);
          color: white;

          font: inherit;
          font-size: 12px;
        }

        .contact-field input,
        .contact-field select {
          min-height: 44px;
        }

        .contact-field textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.7;
        }

        .contact-field input::placeholder,
        .contact-field textarea::placeholder {
          color: #91889f;
        }

        .contact-field input:focus,
        .contact-field select:focus,
        .contact-field textarea:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px #8b5cf620;
        }

        .contact-field select option {
          background: #151126;
          color: white;
        }

        .contact-field small {
          align-self: flex-end;
          color: #aaa2bd;
          font-size: 10px;
        }

        .contact-message-field {
          grid-column: 1 / -1;
        }

        .contact-notification {
          grid-column: 1 / -1;
          padding: 11px 13px;
          border-radius: 7px;
          background: #8b5cf625;
          color: #e0d5ff;
          font-size: 12px;
          line-height: 1.7;
        }

        .contact-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 13px;

          grid-column: 1 / -1;
          width: 100%;
          min-height: 45px;

          border: none;
          border-radius: 7px;

          background: #8b5cf6;
          color: white;

          font: inherit;
          font-size: 12px;
          font-weight: 700;

          cursor: pointer;
          transition: 0.25s;
        }

        .contact-submit-btn:hover {
          background: #7042d4;
        }

        .contact-submit-btn span {
          font-size: 20px;
        }

        /* =====================================
           FAQ
        ===================================== */

        .contact-faq-section {
          padding: 50px 7% 70px;
        }

        .contact-faq-heading {
          max-width: 700px;
          margin: 0 auto 28px;
          text-align: center;
        }

        .contact-faq-heading h2 {
          margin: 0;
          font-size: clamp(25px, 3.5vw, 35px);
          font-weight: 800;
        }

        .contact-faq-heading p {
          margin-top: 9px;
          color: #c0b8d0;
          font-size: 12px;
        }

        .contact-faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;

          max-width: 850px;
          margin: 0 auto;
        }

        .contact-faq-item {
          overflow: hidden;

          border: 1px solid rgba(167, 139, 250, 0.25);
          border-radius: 8px;

          background: rgba(17, 12, 32, 0.84);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .contact-faq-item.open {
          border-color: #8b5cf6;
        }

        .contact-faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;

          width: 100%;
          min-height: 58px;
          padding: 15px 19px;

          border: none;
          background: transparent;
          color: white;

          text-align: left;
          cursor: pointer;
        }

        .contact-faq-question strong {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.6;
        }

        .contact-faq-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          width: 26px;
          height: 26px;

          border-radius: 6px;
          background: #8b5cf625;
          color: #c4b5fd;

          font-size: 21px;
        }

        .contact-faq-answer {
          padding: 0 48px 16px 19px;
        }

        .contact-faq-answer p {
          margin: 0;
          color: #c0b8d0;
          font-size: 12px;
          line-height: 1.8;
        }

        /* =====================================
           FOOTER
        ===================================== */

        .encore-contact-page .footer {
          position: relative;
          z-index: 1;
          background: transparent !important;
        }

        /* =====================================
           TABLET & MOBILE
        ===================================== */

        @media (max-width: 760px) {

          .contact-hero {
            min-height: 220px;
            padding: 50px 6% 25px;
          }

          .contact-hero h1 {
            font-size: 35px;
          }

          .contact-options-section {
            padding: 10px 7% 40px;
          }

          .contact-options {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .contact-form-section {
            padding: 35px 5% 45px;
          }

          .contact-form-card {
            padding: 24px 18px;
          }

          .contact-form-heading h2 {
            font-size: 24px;
          }

          .contact-form {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .contact-message-field,
          .contact-notification,
          .contact-submit-btn {
            grid-column: auto;
          }

          .contact-faq-section {
            padding: 40px 6% 55px;
          }

          .contact-faq-heading h2 {
            font-size: 25px;
          }

          .contact-faq-question {
            padding: 14px;
          }

          .contact-faq-question strong {
            font-size: 12px;
          }

          .contact-faq-answer {
            padding: 0 14px 15px;
          }

        }

      `}</style>

    </main>
  );
}
