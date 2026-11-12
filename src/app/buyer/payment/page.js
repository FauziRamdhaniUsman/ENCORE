
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "../../../data/concerts";

const paymentMethods = [
  {
    id: "bank_transfer",
    name: "Transfer Bank",
    description: "BCA, BNI, BRI, Mandiri",
    icon: "🏦",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description: "GoPay, OVO, DANA",
    icon: "📱",
  },
  {
    id: "qris",
    name: "QRIS",
    description: "Scan QR untuk pembayaran",
    icon: "▦",
  },
];

function createTicketCode() {
  return (
    "ENC-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 7).toUpperCase()
  );
}

export default function PaymentPage() {
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("bank_transfer");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      const pendingOrder = JSON.parse(
        localStorage.getItem("encorePendingOrder") || "null"
      );

      if (!currentUser || currentUser.role !== "buyer") {
        router.replace("/login");
        return;
      }

      if (!pendingOrder) {
        setLoading(false);
        setError(
          "Pesanan tidak ditemukan. Silakan lakukan checkout kembali."
        );
        return;
      }

      if (
        pendingOrder.userId &&
        currentUser.id &&
        pendingOrder.userId !== currentUser.id
      ) {
        setLoading(false);
        setError("Pesanan ini bukan milik akun yang sedang login.");
        return;
      }

      setOrder(pendingOrder);
      setLoading(false);
    } catch {
      setLoading(false);
      setError("Terjadi kesalahan saat membaca data pesanan.");
    }
  }, [router]);

  const handlePayment = () => {
    if (!order || processing) return;

    setProcessing(true);
    setError("");

    try {
      const newTicketCode = createTicketCode();

      const paidOrder = {
        ...order,
        status: "paid",
        paymentMethod: selectedMethod,
        paidAt: new Date().toISOString(),
        ticketCode: newTicketCode,
        checkInStatus: "not_checked_in",
      };

      const existingOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      const updatedOrders = [
        ...existingOrders,
        paidOrder,
      ];

      localStorage.setItem(
        "encoreOrders",
        JSON.stringify(updatedOrders)
      );

      localStorage.setItem(
        "encorePendingOrder",
        JSON.stringify(paidOrder)
      );

      setTicketCode(newTicketCode);
      setOrder(paidOrder);
      setSuccess(true);
    } catch {
      setError("Pembayaran gagal diproses. Silakan coba kembali.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="encore-payment">
        <p className="payment-loading">
          Memuat pembayaran...
        </p>
        <PaymentStyles />
      </main>
    );
  }

  if (success && order) {
    return (
      <main className="encore-payment">
        <div className="payment-container">
          <div className="payment-success-card">
            <div className="success-icon">✓</div>

            <span className="payment-eyebrow">
              ENCORE PAYMENT
            </span>

            <h1>Pembayaran Berhasil!</h1>

            <p>
              Terima kasih telah memesan tiket melalui ENCORE.
              Pesananmu sudah dikonfirmasi.
            </p>

            <div className="success-ticket">
              <span>KODE E-TICKET</span>
              <strong>{ticketCode}</strong>
              <small>
                Simpan kode ini untuk proses validasi
                saat memasuki venue konser.
              </small>
            </div>

            <div className="success-order-info">
              <div>
                <span>Konser</span>
                <strong>{order.concertTitle}</strong>
              </div>

              <div>
                <span>Kategori Tiket</span>
                <strong>{order.ticketName}</strong>
              </div>

              <div>
                <span>Jumlah</span>
                <strong>
                  {order.ticketQuantity} tiket/paket
                </strong>
              </div>

              <div>
                <span>Total Pembayaran</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className="paid-status">LUNAS</strong>
              </div>
            </div>

            <button
              type="button"
              className="payment-primary-button"
              onClick={() => router.replace("/")}
            >
              Kembali ke Home
            </button>

            <p className="payment-note">
              Ini merupakan simulasi pembayaran. Tidak ada
              uang sungguhan yang ditransfer.
            </p>
          </div>
        </div>

        <PaymentStyles />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="encore-payment">
        <div className="payment-container">
          <div className="payment-error-card">
            <h2>Pesanan Tidak Tersedia</h2>
            <p>{error}</p>

            <Link
              href="/concerts"
              className="payment-primary-button"
            >
              Cari Konser
            </Link>
          </div>
        </div>

        <PaymentStyles />
      </main>
    );
  }

  return (
    <main className="encore-payment">
      <div className="payment-container">
        <Link
          href="/buyer/checkout"
          className="payment-back"
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
        >
          ← Kembali
        </Link>

        <header className="payment-heading">
          <span className="payment-eyebrow">
            ENCORE TICKETING
          </span>

          <h1>Pembayaran</h1>

          <p>
            Pilih metode pembayaran untuk menyelesaikan
            pemesanan tiket konsermu.
          </p>
        </header>

        <div className="payment-layout">
          <section className="payment-method-card">
            <div className="payment-section-heading">
              <span>01</span>
              <div>
                <h2>Metode Pembayaran</h2>
                <p>Pilih salah satu metode pembayaran.</p>
              </div>
            </div>

            <div className="payment-method-list">
              {paymentMethods.map((method) => (
                <button
                  type="button"
                  key={method.id}
                  className={`payment-method ${
                    selectedMethod === method.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className="method-icon">
                    {method.icon}
                  </span>

                  <span className="method-information">
                    <strong>{method.name}</strong>
                    <small>{method.description}</small>
                  </span>

                  <span className="method-radio">
                    {selectedMethod === method.id ? "●" : "○"}
                  </span>
                </button>
              ))}
            </div>

            <div className="payment-simulation-info">
              <span>ⓘ</span>
              <p>
                ENCORE menggunakan pembayaran simulasi.
                Pilihan metode ini hanya untuk demonstrasi
                alur transaksi, bukan transfer sungguhan.
              </p>
            </div>
          </section>

          <aside className="payment-summary-card">
            <div className="payment-section-heading">
              <span>02</span>
              <div>
                <h2>Ringkasan Pesanan</h2>
                <p>Periksa pesanan sebelum konfirmasi.</p>
              </div>
            </div>

            <div className="payment-event">
              <h3>{order.concertTitle}</h3>
              <p>{order.concertDate}</p>
              <p>{order.concertLocation}</p>
            </div>

            <div className="payment-divider" />

            <div className="payment-summary-row">
              <span>Kategori Tiket</span>
              <strong>{order.ticketName}</strong>
            </div>

            <div className="payment-summary-row">
              <span>Jumlah</span>
              <strong>{order.ticketQuantity}</strong>
            </div>

            <div className="payment-summary-row">
              <span>Pemesan</span>
              <strong>{order.buyerName}</strong>
            </div>

            <div className="payment-summary-row">
              <span>Email</span>
              <strong>{order.buyerEmail}</strong>
            </div>

            <div className="payment-divider" />

            <div className="payment-summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(order.subtotal)}</strong>
            </div>

            <div className="payment-summary-row">
              <span>Biaya Layanan</span>
              <strong>{formatPrice(order.serviceFee)}</strong>
            </div>

            <div className="payment-total">
              <span>Total Pembayaran</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>

            {error && (
              <p className="payment-error">{error}</p>
            )}

            <button
              type="button"
              className="payment-confirm-button"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing
                ? "Memproses..."
                : "Konfirmasi Pembayaran"}
            </button>

            <p className="payment-secure">
              🔒 Pembayaran simulasi ENCORE
            </p>
          </aside>
        </div>
      </div>

      <PaymentStyles />
    </main>
  );
}

function PaymentStyles() {
  return (
    <style jsx global>{`
      .encore-payment {
        min-height: 100vh;
        padding: 45px 6%;
        color: #fff;
        background:
          linear-gradient(
            180deg,
            rgba(9,7,20,.84),
            rgba(9,7,20,.97)
          ),
          url("/images/bg%20konser.jpg") center top / cover fixed;
      }

      .payment-container {
        max-width: 1150px;
        margin: 0 auto;
      }

      .payment-back {
        color: #c4b5fd;
        font-size: 13px;
        text-decoration: none;
      }

      .payment-heading {
        margin: 28px 0;
      }

      .payment-eyebrow {
        color: #a78bfa;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .payment-heading h1 {
        margin: 10px 0;
        font-size: clamp(28px, 4vw, 38px);
      }

      .payment-heading p {
        color: #aaa1bd;
        font-size: 13px;
        line-height: 1.7;
      }

      .payment-layout {
        display: grid;
        grid-template-columns:
          minmax(0, 1.3fr)
          minmax(320px, .9fr);
        gap: 24px;
        align-items: start;
      }

      .payment-method-card,
      .payment-summary-card,
      .payment-success-card,
      .payment-error-card {
        padding: 27px;
        border: 1px solid #49316d;
        border-radius: 17px;
        background: rgba(17,12,32,.97);
        box-shadow: 0 12px 35px #00000035;
      }

      .payment-section-heading {
        display: flex;
        align-items: center;
        gap: 13px;
        margin-bottom: 25px;
      }

      .payment-section-heading > span {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        border-radius: 9px;
        background: #8b5cf625;
        color: #c4b5fd;
        font-weight: 800;
      }

      .payment-section-heading h2 {
        font-size: 18px;
      }

      .payment-section-heading p {
        margin-top: 5px;
        color: #aaa1bd;
        font-size: 12px;
      }

      .payment-method-list {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }

      .payment-method {
        display: flex;
        align-items: center;
        gap: 15px;
        width: 100%;
        padding: 17px;
        border: 1px solid #493d61;
        border-radius: 11px;
        background: #0c0918;
        color: white;
        text-align: left;
        cursor: pointer;
        transition: .2s;
      }

      .payment-method:hover,
      .payment-method.selected {
        border-color: #a78bfa;
        background: #8b5cf619;
      }

      .method-icon {
        display: grid;
        place-items: center;
        width: 43px;
        height: 43px;
        flex-shrink: 0;
        border-radius: 9px;
        background: #8b5cf625;
        font-size: 21px;
      }

      .method-information {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 5px;
      }

      .method-information strong {
        font-size: 13px;
      }

      .method-information small {
        color: #aaa1bd;
        font-size: 11px;
      }

      .method-radio {
        color: #c4b5fd;
        font-size: 19px;
      }

      .payment-simulation-info {
        display: flex;
        gap: 10px;
        margin-top: 22px;
        padding: 14px;
        border-radius: 9px;
        background: #8b5cf619;
        color: #c8b8e4;
        font-size: 11px;
        line-height: 1.7;
      }

      .payment-simulation-info span {
        color: #a78bfa;
      }

      .payment-event h3 {
        font-size: 15px;
      }

      .payment-event p {
        margin-top: 7px;
        color: #aaa1bd;
        font-size: 12px;
      }

      .payment-divider {
        height: 1px;
        margin: 20px 0;
        background: #392e4d;
      }

      .payment-summary-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        margin: 14px 0;
        font-size: 12px;
      }

      .payment-summary-row span {
        color: #aaa1bd;
      }

      .payment-summary-row strong {
        max-width: 60%;
        color: #f5f1fc;
        text-align: right;
        overflow-wrap: anywhere;
      }

      .payment-total {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 22px;
        padding: 20px 0;
        border-top: 1px solid #493d61;
      }

      .payment-total span {
        color: #c5bad8;
        font-size: 12px;
      }

      .payment-total strong {
        color: #c4b5fd;
        font-size: 25px;
      }

      .payment-confirm-button,
      .payment-primary-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 50px;
        margin-top: 10px;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(100deg,#7c3aed,#a855f7);
        color: white;
        font-size: 13px;
        font-weight: 750;
        text-decoration: none;
        cursor: pointer;
        transition: .2s;
      }

      .payment-confirm-button:hover,
      .payment-primary-button:hover {
        filter: brightness(1.12);
        transform: translateY(-2px);
      }

      .payment-confirm-button:disabled {
        cursor: not-allowed;
        opacity: .6;
      }

      .payment-secure,
      .payment-note {
        margin-top: 14px;
        color: #9990aa;
        font-size: 11px;
        text-align: center;
        line-height: 1.7;
      }

      .payment-error {
        margin: 15px 0;
        color: #fca5a5;
        font-size: 12px;
      }

      .payment-loading {
        padding: 100px 0;
        color: #c4b5fd;
        text-align: center;
      }

      .payment-success-card,
      .payment-error-card {
        max-width: 560px;
        margin: 60px auto;
        text-align: center;
      }

      .success-icon {
        display: grid;
        place-items: center;
        width: 75px;
        height: 75px;
        margin: 0 auto 22px;
        border-radius: 50%;
        background: #22c55e20;
        color: #4ade80;
        font-size: 38px;
      }

      .payment-success-card h1 {
        margin: 12px 0;
        font-size: 27px;
      }

      .payment-success-card > p {
        color: #aaa1bd;
        font-size: 13px;
        line-height: 1.7;
      }

      .success-ticket {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 25px 0;
        padding: 22px;
        border: 1px dashed #a78bfa;
        border-radius: 13px;
        background: #8b5cf615;
      }

      .success-ticket span {
        color: #a78bfa;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .success-ticket strong {
        color: #fff;
        font-size: 22px;
        letter-spacing: 1px;
        overflow-wrap: anywhere;
      }

      .success-ticket small {
        color: #aaa1bd;
        font-size: 11px;
        line-height: 1.6;
      }

      .success-order-info {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 20px 0;
        border-top: 1px solid #493d61;
        text-align: left;
      }

      .success-order-info > div {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        font-size: 12px;
      }

      .success-order-info span {
        color: #aaa1bd;
      }

      .success-order-info strong {
        color: #fff;
        text-align: right;
      }

      .success-order-info .paid-status {
        color: #4ade80;
      }

      @media (max-width: 800px) {
        .encore-payment {
          padding: 30px 5%;
          background-attachment: scroll;
        }

        .payment-layout {
          grid-template-columns: 1fr;
        }

        .payment-method-card,
        .payment-summary-card {
          padding: 21px;
        }
      }
    `}</style>
  );
}
