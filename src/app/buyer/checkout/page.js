
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { concerts, formatPrice } from "../../../data/concerts";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const concertId = searchParams.get("concertId");
  const ticketIndex = Number(searchParams.get("ticketIndex") || 0);
  const quantity = Math.min(
    4,
    Math.max(1, Number(searchParams.get("quantity") || 1))
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sameAsAccount, setSameAsAccount] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // Data konser bawaan dan event Organizer
  const [allConcerts, setAllConcerts] = useState(concerts);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  // Ambil event dari localStorage
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

  const concert = useMemo(
    () =>
      allConcerts.find(
        (item) => String(item.id) === String(concertId)
      ),
    [allConcerts, concertId]
  );

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

  const selectedTicket = tickets[ticketIndex] || tickets[0];

  const subtotal = selectedTicket
    ? selectedTicket.price * quantity
    : 0;

  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  // ======================================
  // CEK LOGIN BUYER
  // ======================================

  useEffect(() => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      if (!currentUser) {
        const returnUrl =
          window.location.pathname + window.location.search;

        router.replace(
          `/login?redirect=${encodeURIComponent(returnUrl)}`
        );
        return;
      }

      if (currentUser.role !== "buyer") {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setLoading(false);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  // ======================================
  // DATA SAMA DENGAN AKUN
  // ======================================

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

  // ======================================
  // SIMPAN PESANAN
  // ======================================

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

    // Simpan data event dan pemilik event
    const order = {
      id: `ENC-${Date.now()}`,
      userId: user?.id || null,

      buyerName: name.trim(),
      buyerEmail: email.trim(),
      buyerPhone: phone.trim(),

      concertId: concert.id,
      concertTitle: concert.title,
      concertDate: concert.date,
      concertLocation: concert.location,

      // Informasi Organizer pemilik event
      organizerId: concert.organizerId || null,
      organizer: concert.organizer || null,

      ticketName: selectedTicket.name,
      ticketPrice: selectedTicket.price,
      ticketQuantity: quantity,
      personsPerPackage: selectedTicket.persons || 1,
      totalPersons: (selectedTicket.persons || 1) * quantity,

      subtotal,
      serviceFee,
      total,

      status: "waiting_payment",
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "encorePendingOrder",
        JSON.stringify(order)
      );

      router.push("/buyer/payment");
    } catch {
      setError("Pesanan gagal disimpan. Silakan coba kembali.");
    }
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading || !eventsLoaded) {
    return (
      <main className="encore-checkout">
        <p className="checkout-loading">Memuat checkout...</p>
      </main>
    );
  }

  // ======================================
  // DATA KONSER TIDAK DITEMUKAN
  // ======================================

  if (!concert || !selectedTicket) {
    return (
      <main className="encore-checkout">
        <div className="checkout-empty">
          <h2>Pesanan tidak ditemukan</h2>
          <p>Silakan pilih konser terlebih dahulu.</p>
          <Link href="/concerts">
            Kembali ke daftar konser
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="encore-checkout">
      <div className="checkout-container">

        <Link
          href={`/concerts/${concert.id}`}
          className="checkout-back"
        >
          ← Kembali ke detail konser
        </Link>

        <header className="checkout-heading">
          <span>ENCORE TICKETING</span>
          <h1>Data Pemesan</h1>
          <p>
            Pastikan data pemesan sudah benar untuk
            kelancaran proses pemesanan tiket.
          </p>
        </header>

        <form
          className="checkout-layout"
          onSubmit={handleSubmit}
        >

          {/* FORM DATA PEMESAN */}
          <section className="checkout-form-card">

            <div className="checkout-section-title">
              <div>
                <span>01</span>
                <h2>Informasi Pemesan</h2>
              </div>
              <p>Lengkapi informasi kontak kamu.</p>
            </div>

            <label className="same-account">
              <input
                type="checkbox"
                checked={sameAsAccount}
                onChange={(e) =>
                  handleSameAsAccount(e.target.checked)
                }
              />
              <span className="custom-check">✓</span>
              <span>Sama dengan data akun</span>
            </label>

            <div className="checkout-info">
              <span>ⓘ</span>
              Data ini digunakan untuk konfirmasi pesanan
              dan pengiriman e-ticket.
            </div>

            <div className="checkout-fields">

              <div className="checkout-field">
                <label htmlFor="buyer-name">
                  Nama Lengkap
                </label>
                <input
                  id="buyer-name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="buyer-phone">
                  Nomor HP
                </label>

                <div className="phone-input">
                  <span className="phone-code">
                    🇮🇩 +62
                  </span>

                  <input
                    id="buyer-phone"
                    type="tel"
                    placeholder="Masukkan nomor HP"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="buyer-email">
                  Email
                </label>

                <input
                  id="buyer-email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <small>
                  E-ticket dan informasi pesanan akan
                  dikirim ke email ini.
                </small>
              </div>

            </div>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

          </section>

          {/* RINGKASAN PESANAN */}
          <aside className="checkout-summary">

            <div className="summary-event">
              <img
                src={concert.image || "/images/default-concert.jpg"}
                alt={concert.title}
              />

              <div className="summary-event-info">
                <h3>{concert.title}</h3>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/concerts/${concert.id}`)
                  }
                >
                  Detail
                </button>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-category">
              <strong>{selectedTicket.name}</strong>
            </div>

            <div className="summary-ticket-count">
              {quantity} {selectedTicket.persons ? "Paket" : "Tiket"}
              <span>•</span>
              {selectedTicket.persons
                ? `Peserta ${selectedTicket.persons * quantity}`
                : `Pax ${quantity}`}
            </div>

            <div className="summary-divider" />

            <div className="summary-date">
              <span>Selected Date</span>
              <strong>{concert.date}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-benefits">

              <div>
                <span>🚫</span>
                <p>Refund not allowed</p>
              </div>

              <div>
                <span>⚡</span>
                <p>Instant Confirmation</p>
              </div>

              <div>
                <span>💺</span>
                <p>
                  Seat assigned automatically
                  <small>
                    Informasi tempat duduk mengikuti
                    ketentuan penyelenggara.
                  </small>
                </p>
              </div>

              <div>
                <span>⌛</span>
                <p>
                  Valid on <strong>{concert.date}</strong>
                </p>
              </div>

            </div>

            {/* TOTAL PAYMENT */}
            <div className="summary-payment">
              <details>
                <summary>
                  <span>Total Payment</span>
                  <strong>{formatPrice(total)}</strong>
                  <span className="summary-arrow">⌄</span>
                </summary>

                <div className="summary-payment-detail">

                  <div>
                    <span>Harga Tiket</span>
                    <strong>
                      {formatPrice(selectedTicket.price)}
                    </strong>
                  </div>

                  <div>
                    <span>Jumlah</span>
                    <strong>{quantity}</strong>
                  </div>

                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>

                  <div>
                    <span>Biaya Layanan</span>
                    <strong>{formatPrice(serviceFee)}</strong>
                  </div>

                  <div className="summary-final-total">
                    <span>Total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>

                </div>
              </details>
            </div>

            <button
              type="submit"
              className="checkout-submit"
            >
              Lanjutkan ke Pembayaran →
            </button>

            <p className="checkout-secure">
              🔒 Transaksi simulasi ENCORE
            </p>

          </aside>

        </form>
      </div>

      <style>{`

        .encore-checkout {
          min-height: 100vh;
          padding: 45px 6%;
          color: #fff;
          background:
            linear-gradient(
              180deg,
              rgba(9,7,20,.82),
              rgba(9,7,20,.97)
            ),
            url("/images/bg%20konser.jpg") center top / cover fixed;
        }

        .checkout-container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .checkout-back {
          color: #c4b5fd;
          font-size: 13px;
          text-decoration: none;
        }

        .checkout-heading {
          margin: 28px 0;
        }

        .checkout-heading > span {
          color: #a78bfa;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .checkout-heading h1 {
          margin: 9px 0;
          font-size: clamp(28px, 4vw, 38px);
        }

        .checkout-heading p {
          color: #aaa1bd;
          font-size: 14px;
          line-height: 1.7;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1.55fr)
            minmax(320px, .85fr);
          align-items: start;
          gap: 24px;
        }

        .checkout-form-card,
        .checkout-summary {
          padding: 27px;
          border: 1px solid #49316d;
          border-radius: 17px;
          background: rgba(17,12,32,.96);
          box-shadow: 0 12px 35px #00000035;
        }

        .checkout-section-title {
          margin-bottom: 24px;
        }

        .checkout-section-title > div {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .checkout-section-title > div span {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          border-radius: 9px;
          background: #8b5cf625;
          color: #c4b5fd;
          font-weight: 800;
        }

        .checkout-section-title h2 {
          font-size: 20px;
        }

        .checkout-section-title p {
          margin: 9px 0 0 48px;
          color: #aaa1bd;
          font-size: 12px;
        }

        .same-account {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 19px;
          cursor: pointer;
          color: #e8e0f5;
          font-size: 13px;
        }

        .same-account input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-check {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border: 1px solid #625278;
          border-radius: 50%;
          color: transparent;
          font-size: 12px;
        }

        .same-account input:checked + .custom-check {
          border-color: #a78bfa;
          background: #8b5cf6;
          color: white;
        }

        .checkout-info {
          display: flex;
          gap: 10px;
          padding: 13px 15px;
          border-radius: 9px;
          background: #8b5cf619;
          color: #c8b8e4;
          font-size: 11px;
          line-height: 1.6;
        }

        .checkout-info span {
          color: #a78bfa;
        }

        .checkout-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 25px;
        }

        .checkout-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .checkout-field label {
          color: #eee9f8;
          font-size: 13px;
          font-weight: 650;
        }

        .checkout-field input {
          width: 100%;
          height: 54px;
          padding: 0 17px;
          border: 1px solid #493d61;
          border-radius: 10px;
          outline: none;
          background: #0c0918;
          color: white;
          font: inherit;
          font-size: 13px;
        }

        .checkout-field input:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 3px #8b5cf620;
        }

        .checkout-field input::placeholder {
          color: #827990;
        }

        .checkout-field small {
          color: #9990aa;
          font-size: 11px;
        }

        .phone-input {
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #493d61;
          border-radius: 10px;
          background: #0c0918;
        }

        .phone-code {
          padding: 0 14px;
          color: #d8c4ff;
          font-size: 13px;
          white-space: nowrap;
          border-right: 1px solid #493d61;
        }

        .phone-input input {
          border: none;
          border-radius: 0;
          background: transparent;
        }

        .phone-input:focus-within {
          border-color: #a78bfa;
        }

        /* RINGKASAN PESANAN */

        .summary-event {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .summary-event img {
          width: 65px;
          height: 75px;
          flex-shrink: 0;
          border-radius: 9px;
          object-fit: cover;
        }

        .summary-event-info {
          display: flex;
          flex: 1;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .summary-event-info h3 {
          font-size: 14px;
          line-height: 1.5;
        }

        .summary-event-info button {
          flex-shrink: 0;
          border: none;
          background: transparent;
          color: #a78bfa;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .summary-divider {
          height: 1px;
          margin: 20px 0;
          background: #392e4d;
        }

        .summary-category strong {
          color: #f5f1fc;
          font-size: 14px;
        }

        .summary-ticket-count {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 15px;
          color: #f5f1fc;
          font-size: 13px;
        }

        .summary-ticket-count span {
          color: #827990;
        }

        .summary-date {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .summary-date span {
          color: #aaa1bd;
          font-size: 12px;
        }

        .summary-date strong {
          color: #f5f1fc;
          font-size: 14px;
        }

        .summary-benefits {
          display: flex;
          flex-direction: column;
          gap: 19px;
          margin: 22px 0;
        }

        .summary-benefits > div {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .summary-benefits > div > span {
          width: 23px;
          flex-shrink: 0;
          color: #a78bfa;
          font-size: 18px;
        }

        .summary-benefits p {
          color: #eee9f8;
          font-size: 13px;
          line-height: 1.6;
        }

        .summary-benefits small {
          display: block;
          margin-top: 4px;
          color: #aaa1bd;
          font-size: 11px;
          line-height: 1.6;
        }

        /* TOTAL PAYMENT */

        .summary-payment {
          margin: 20px -27px 0;
          padding: 18px 27px;
          border-top: 8px solid #241b35;
          border-radius: 0 0 15px 15px;
          background: #100b20;
        }

        .summary-payment details summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          list-style: none;
        }

        .summary-payment details summary::-webkit-details-marker {
          display: none;
        }

        .summary-payment summary > span:first-child {
          color: #c5bad8;
          font-size: 12px;
        }

        .summary-payment summary > strong {
          color: #c4b5fd;
          font-size: 17px;
          text-align: right;
        }

        .summary-arrow {
          color: #c4b5fd;
          font-size: 21px;
          transition: transform .2s;
        }

        .summary-payment details[open] .summary-arrow {
          transform: rotate(180deg);
        }

        .summary-payment-detail {
          display: flex;
          flex-direction: column;
          gap: 13px;
          padding-top: 20px;
        }

        .summary-payment-detail > div {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
        }

        .summary-payment-detail span {
          color: #aaa1bd;
        }

        .summary-payment-detail strong {
          color: white;
        }

        .summary-final-total {
          padding-top: 13px;
          border-top: 1px solid #493d61;
        }

        .summary-final-total strong {
          color: #c4b5fd;
        }

        /* BUTTON */

        .checkout-submit {
          width: 100%;
          min-height: 50px;
          margin-top: 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(100deg,#7c3aed,#a855f7);
          color: white;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          transition: .2s;
        }

        .checkout-submit:hover {
          filter: brightness(1.12);
          transform: translateY(-2px);
        }

        .checkout-secure {
          margin-top: 14px;
          color: #9990aa;
          font-size: 11px;
          text-align: center;
        }

        .checkout-error {
          margin-top: 18px;
          color: #fca5a5;
          font-size: 12px;
        }

        .checkout-loading {
          padding: 100px 0;
          color: #c4b5fd;
          text-align: center;
        }

        .checkout-empty {
          max-width: 500px;
          margin: 100px auto;
          padding: 30px;
          border: 1px solid #49316d;
          border-radius: 15px;
          background: #110c20;
          text-align: center;
        }

        .checkout-empty p {
          margin: 15px 0;
          color: #aaa1bd;
        }

        .checkout-empty a {
          color: #c4b5fd;
        }

        @media (max-width: 800px) {
          .encore-checkout {
            padding: 30px 5%;
            background-attachment: scroll;
          }

          .checkout-layout {
            grid-template-columns: 1fr;
          }

          .checkout-form-card,
          .checkout-summary {
            padding: 21px;
          }

          .summary-payment {
            margin-right: -21px;
            margin-left: -21px;
            padding-right: 21px;
            padding-left: 21px;
          }
        }

      `}</style>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="encore-checkout">
          <p className="checkout-loading">
            Memuat checkout...
          </p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
