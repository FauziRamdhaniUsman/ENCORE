"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckinPage() {
  const router = useRouter();

  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [ready, setReady] = useState(false);
  const [accessAllowed, setAccessAllowed] = useState(false);

  // MEMERIKSA LOGIN DAN ROLE PENGGUNA
  useEffect(() => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      if (!currentUser) {
        router.replace("/login?redirect=/organizer/checkin");
        return;
      }

      const allowedRoles = ["admin", "organizer", "checkin"];

      if (!allowedRoles.includes(currentUser.role)) {
        if (currentUser.role === "buyer") {
          router.replace("/buyer/dashboard");
        } else {
          router.replace("/login");
        }
        return;
      }

      setAccessAllowed(true);
      setReady(true);
    } catch (error) {
      localStorage.removeItem("encoreCurrentUser");
      router.replace("/login");
    }
  }, [router]);

  // MEMBERSIHKAN SCANNER SAAT KELUAR HALAMAN
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        scanner.stop().catch(() => {});
        scanner.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  function validateTicket(ticketCode) {
    const cleanCode = ticketCode.trim();

    if (!cleanCode) {
      setResult({
        type: "invalid",
        message: "Masukkan kode tiket terlebih dahulu.",
      });
      return;
    }

    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      const orderIndex = savedOrders.findIndex(
        (order) =>
          String(order.ticketCode || "").toLowerCase() ===
          cleanCode.toLowerCase()
      );

      if (orderIndex === -1) {
        setResult({
          type: "invalid",
          message: "Kode tiket tidak ditemukan.",
        });
        return;
      }

      const order = savedOrders[orderIndex];

      if (order.status !== "paid") {
        setResult({
          type: "invalid",
          message: "Pembayaran tiket belum berhasil.",
        });
        return;
      }

      if (order.checkInStatus === "checked_in") {
        setResult({
          type: "used",
          message: "Tiket ini sudah pernah digunakan untuk check-in.",
          ticket: order,
        });
        return;
      }

      const updatedOrder = {
        ...order,
        checkInStatus: "checked_in",
        checkInAt: new Date().toISOString(),
      };

      const updatedOrders = [...savedOrders];
      updatedOrders[orderIndex] = updatedOrder;

      localStorage.setItem(
        "encoreOrders",
        JSON.stringify(updatedOrders)
      );

      setResult({
        type: "success",
        message: "Check-in berhasil! Selamat menikmati konser.",
        ticket: updatedOrder,
      });

      setCode("");
    } catch (error) {
      console.error("Gagal memvalidasi tiket:", error);

      setResult({
        type: "invalid",
        message: "Terjadi kesalahan saat membaca data tiket.",
      });
    }
  }

  async function startScanner() {
    if (scannerRef.current || loading) return;

    setLoading(true);
    setCameraError("");
    setResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("encore-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 230, height: 230 },
        },
        async (decodedText) => {
          if (processingRef.current) return;

          processingRef.current = true;
          setCode(decodedText);

          try {
            await stopScanner();
            validateTicket(decodedText);
          } finally {
            processingRef.current = false;
          }
        },
        () => {}
      );

      setScannerActive(true);
    } catch (error) {
      console.error("Kamera gagal dibuka:", error);

      scannerRef.current = null;
      setScannerActive(false);

      setCameraError(
        "Kamera tidak dapat dibuka. Izinkan akses kamera di browser atau gunakan input kode tiket manual."
      );
    } finally {
      setLoading(false);
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) return;

    try {
      await scanner.stop();
      scanner.clear();
    } catch (error) {
      console.error("Gagal menghentikan scanner:", error);
    }

    scannerRef.current = null;
    setScannerActive(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    validateTicket(code);
  }

  if (!ready || !accessAllowed) {
    return (
      <div className="checkin-loading">
        Memeriksa akses ENCORE...
      </div>
    );
  }

  return (
    <main className="checkin-page">
      <header className="checkin-header">
        <Link href="/buyer/dashboard" className="checkin-logo">
          <span>EN</span>CORE
        </Link>

        <Link href="/buyer/dashboard" className="checkin-back">
          ← Kembali ke Dashboard
        </Link>
      </header>

      <section className="checkin-container">
        <div className="checkin-heading">
          <p className="checkin-eyebrow">ENCORE EVENT MANAGEMENT</p>
          <h1>QR Ticket Scanner</h1>
          <p>
            Pindai QR Code e-ticket untuk memvalidasi tiket
            dan mencatat kehadiran pengunjung.
          </p>
        </div>

        <div className="checkin-card">
          <div className="checkin-card-heading">
            <span className="checkin-camera-icon">▣</span>
            <div>
              <h2>Scan Tiket Pengunjung</h2>
              <p>Arahkan QR Code ke kamera scanner.</p>
            </div>
          </div>

          <div className="checkin-camera">
            <div id="encore-qr-reader" />

            {!scannerActive && (
              <div className="checkin-camera-placeholder">
                <span>▦</span>
                <p>Kamera scanner belum aktif</p>
                <small>
                  Tekan tombol di bawah untuk memulai scan.
                </small>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="checkin-camera-error">
              {cameraError}
            </div>
          )}

          <div className="checkin-camera-actions">
            {!scannerActive ? (
              <button
                type="button"
                className="checkin-start-button"
                onClick={startScanner}
                disabled={loading}
              >
                {loading ? "Membuka Kamera..." : "Aktifkan Kamera"}
              </button>
            ) : (
              <button
                type="button"
                className="checkin-stop-button"
                onClick={stopScanner}
              >
                Hentikan Scanner
              </button>
            )}
          </div>

          <div className="checkin-divider">
            <span>ATAU</span>
          </div>

          <form onSubmit={handleSubmit} className="checkin-form">
            <label htmlFor="ticketCode">
              Masukkan Kode Tiket Manual
            </label>

            <input
              id="ticketCode"
              type="text"
              placeholder="Contoh: ENCORE-123456"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />

            <button
              type="submit"
              className="checkin-submit-button"
            >
              Validasi Tiket
            </button>
          </form>

          {result && (
            <div
              className={`checkin-result ${result.type}`}
              role="status"
            >
              <div className="checkin-result-icon">
                {result.type === "success"
                  ? "✓"
                  : result.type === "used"
                    ? "!"
                    : "×"}
              </div>

              <h3>
                {result.type === "success"
                  ? "Tiket Valid"
                  : result.type === "used"
                    ? "Tiket Sudah Digunakan"
                    : "Validasi Gagal"}
              </h3>

              <p>{result.message}</p>

              {result.ticket && (
                <div className="checkin-ticket-info">
                  <div>
                    <span>Kode Tiket</span>
                    <strong>{result.ticket.ticketCode}</strong>
                  </div>

                  <div>
                    <span>Nama Pemesan</span>
                    <strong>
                      {result.ticket.buyerName ||
                        result.ticket.name ||
                        result.ticket.buyerEmail ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Jumlah Tiket</span>
                    <strong>
                      {result.ticket.ticketQuantity ||
                        result.ticket.quantity ||
                        result.ticket.totalPersons ||
                        1}{" "}
                      tiket
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="checkin-instructions">
          <h3>Petunjuk Check-in</h3>
          <ol>
            <li>Aktifkan kamera scanner.</li>
            <li>Pindai QR Code pada e-ticket pengunjung.</li>
            <li>
              Tunggu sistem memeriksa pembayaran dan status tiket.
            </li>
            <li>
              Jika valid, sistem otomatis mencatat check-in.
            </li>
            <li>
              Tiket yang sudah digunakan tidak bisa check-in lagi.
            </li>
          </ol>
        </div>

        <footer className="checkin-footer">
          © 2026 ENCORE. All rights reserved.
        </footer>
      </section>

      <style>{`
        .checkin-page {
          min-height: 100vh;
          padding: 0 20px 40px;
          background: #100b1c;
          color: #f7f3ff;
          font-family: Arial, sans-serif;
        }

        .checkin-page * {
          box-sizing: border-box;
        }

        .checkin-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #100b1c;
          color: white;
        }

        .checkin-header {
          max-width: 1100px;
          margin: auto;
          padding: 25px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #302340;
        }

        .checkin-logo {
          color: white;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: 2px;
          text-decoration: none;
        }

        .checkin-logo span {
          color: #b77aff;
        }

        .checkin-back {
          color: #c394ff;
          font-size: 13px;
          text-decoration: none;
        }

        .checkin-container {
          max-width: 720px;
          margin: 45px auto 0;
        }

        .checkin-heading {
          margin-bottom: 28px;
          text-align: center;
        }

        .checkin-eyebrow {
          color: #b77aff;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .checkin-heading h1 {
          margin: 12px 0;
          font-size: 32px;
        }

        .checkin-heading > p:last-child {
          color: #a99ab7;
          font-size: 13px;
          line-height: 1.7;
        }

        .checkin-card {
          padding: 27px;
          border: 1px solid #49365b;
          border-radius: 16px;
          background: #1a1226;
        }

        .checkin-card-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 22px;
        }

        .checkin-camera-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #382452;
          color: #d0a4ff;
          font-size: 22px;
        }

        .checkin-card-heading h2 {
          font-size: 17px;
        }

        .checkin-card-heading p {
          margin-top: 5px;
          color: #a99ab7;
          font-size: 11px;
        }

        .checkin-camera {
          position: relative;
          min-height: 280px;
          overflow: hidden;
          border: 1px dashed #62447c;
          border-radius: 12px;
          background: #100b1c;
        }

        #encore-qr-reader {
          width: 100%;
          position: relative;
          z-index: 2;
        }

        #encore-qr-reader video {
          width: 100% !important;
          object-fit: cover;
        }

        #encore-qr-reader img {
          max-width: 100%;
        }

        #encore-qr-reader button {
          margin: 8px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: #a66be8;
          color: white;
          cursor: pointer;
        }

        #encore-qr-reader select {
          max-width: 100%;
          padding: 8px;
          border-radius: 6px;
        }

        .checkin-camera-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #a99ab7;
          text-align: center;
          pointer-events: none;
        }

        .checkin-camera-placeholder span {
          color: #b77aff;
          font-size: 55px;
        }

        .checkin-camera-placeholder p {
          margin-top: 12px;
          font-size: 14px;
        }

        .checkin-camera-placeholder small {
          margin-top: 7px;
          font-size: 11px;
        }

        .checkin-camera-error {
          margin-top: 13px;
          padding: 12px;
          border-radius: 8px;
          background: #49242c;
          color: #ffb4be;
          font-size: 12px;
          line-height: 1.6;
        }

        .checkin-camera-actions {
          margin-top: 17px;
        }

        .checkin-start-button,
        .checkin-stop-button,
        .checkin-submit-button {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 8px;
          background: #a66be8;
          color: white;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
        }

        .checkin-start-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .checkin-stop-button {
          background: #49334e;
        }

        .checkin-divider {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 24px 0;
          color: #82728f;
          font-size: 10px;
        }

        .checkin-divider::before,
        .checkin-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: #49365b;
        }

        .checkin-form label {
          display: block;
          margin-bottom: 10px;
          font-size: 12px;
          font-weight: bold;
        }

        .checkin-form input {
          width: 100%;
          padding: 13px;
          border: 1px solid #49365b;
          border-radius: 8px;
          outline: none;
          background: #100b1c;
          color: white;
          font-size: 13px;
        }

        .checkin-form input:focus {
          border-color: #b77aff;
        }

        .checkin-form input::placeholder {
          color: #81738e;
        }

        .checkin-submit-button {
          margin-top: 12px;
        }

        .checkin-result {
          margin-top: 22px;
          padding: 20px;
          border: 1px solid;
          border-radius: 12px;
          text-align: center;
        }

        .checkin-result.success {
          border-color: #367b5a;
          background: #193629;
        }

        .checkin-result.used {
          border-color: #99743b;
          background: #3b2e19;
        }

        .checkin-result.invalid {
          border-color: #8b3c49;
          background: #402129;
        }

        .checkin-result-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin: auto auto 12px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          font-size: 24px;
          font-weight: bold;
        }

        .checkin-result h3 {
          font-size: 17px;
        }

        .checkin-result p {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.6;
        }

        .checkin-ticket-info {
          display: grid;
          gap: 12px;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.2);
          text-align: left;
        }

        .checkin-ticket-info span,
        .checkin-ticket-info strong {
          display: block;
          overflow-wrap: anywhere;
        }

        .checkin-ticket-info span {
          margin-bottom: 5px;
          font-size: 10px;
          opacity: 0.7;
        }

        .checkin-ticket-info strong {
          font-size: 12px;
        }

        .checkin-instructions {
          margin-top: 25px;
          padding: 22px;
          border: 1px solid #302340;
          border-radius: 12px;
          background: #171025;
        }

        .checkin-instructions h3 {
          margin-bottom: 15px;
          font-size: 15px;
        }

        .checkin-instructions ol {
          padding-left: 20px;
          color: #b8acc7;
          font-size: 12px;
          line-height: 2;
        }

        .checkin-footer {
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #302340;
          color: #81738e;
          font-size: 11px;
          text-align: center;
        }

        @media (max-width: 550px) {
          .checkin-page {
            padding: 0 14px 25px;
          }

          .checkin-header {
            padding: 18px 0;
          }

          .checkin-logo {
            font-size: 22px;
          }

          .checkin-back {
            font-size: 11px;
          }

          .checkin-container {
            margin-top: 30px;
          }

          .checkin-heading h1 {
            font-size: 25px;
          }

          .checkin-card {
            padding: 17px;
          }

          .checkin-camera {
            min-height: 230px;
          }
        }
      `}</style>
    </main>
  );
}