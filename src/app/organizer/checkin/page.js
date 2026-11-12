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

      localStorage.setItem("encoreOrders", JSON.stringify(updatedOrders));

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
      <div className="grid min-h-screen place-items-center bg-[#100b1c] text-white">
        Memeriksa akses ENCORE...
      </div>
    );
  }

  const resultStyles = {
    success: "border-[#367b5a] bg-[#193629]",
    used: "border-[#99743b] bg-[#3b2e19]",
    invalid: "border-[#8b3c49] bg-[#402129]",
  };

  return (
    <main className="box-border min-h-screen bg-[#100b1c] px-5 pb-10 text-[#f7f3ff] max-[550px]:px-3.5 max-[550px]:pb-[25px]">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between border-b border-[#302340] py-[25px] max-[550px]:py-[18px]">
        <Link
          href="/organizer/dashboard"
          className="text-[27px] font-black tracking-[2px] text-white max-[550px]:text-[22px]"
        >
          <span className="text-[#b77aff]">EN</span>CORE
        </Link>

        <Link
          href="/organizer/dashboard"
          className="text-[13px] text-[#c394ff] max-[550px]:text-[11px]"
        >
          ← Kembali ke Dashboard
        </Link>
      </header>

      <section className="mx-auto mt-[45px] max-w-[720px] max-[550px]:mt-[30px]">
        <div className="mb-7 text-center">
          <p className="text-[10px] font-bold tracking-[2px] text-[#b77aff]">
            ENCORE EVENT MANAGEMENT
          </p>
          <h1 className="my-3 font-heading text-[32px] font-bold max-[550px]:text-[25px]">
            QR Ticket Scanner
          </h1>
          <p className="text-[13px] leading-[1.7] text-[#a99ab7]">
            Pindai QR Code e-ticket untuk memvalidasi tiket dan mencatat
            kehadiran pengunjung.
          </p>
        </div>

        <div className="rounded-2xl border border-[#49365b] bg-[#1a1226] p-[27px] max-[550px]:p-[17px]">
          <div className="mb-[22px] flex items-center gap-[13px]">
            <span className="grid size-[45px] place-items-center rounded-[10px] bg-[#382452] text-[22px] text-[#d0a4ff]">
              ▣
            </span>
            <div>
              <h2 className="font-heading text-[17px] font-bold">
                Scan Tiket Pengunjung
              </h2>
              <p className="mt-[5px] text-[11px] text-[#a99ab7]">
                Arahkan QR Code ke kamera scanner.
              </p>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-xl border border-dashed border-[#62447c] bg-[#100b1c] max-[550px]:min-h-[230px]">
            <div
              id="encore-qr-reader"
              className="relative z-[2] w-full [&_button]:m-2 [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:border-0 [&_button]:bg-[#a66be8] [&_button]:px-3 [&_button]:py-2 [&_button]:text-white [&_img]:max-w-full [&_select]:max-w-full [&_select]:rounded-md [&_select]:p-2 [&_video]:!w-full [&_video]:object-cover"
            />

            {!scannerActive && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-[#a99ab7]">
                <span className="text-[55px] text-[#b77aff]">▦</span>
                <p className="mt-3 text-sm">Kamera scanner belum aktif</p>
                <small className="mt-[7px] text-[11px]">
                  Tekan tombol di bawah untuk memulai scan.
                </small>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-[13px] rounded-lg bg-[#49242c] p-3 text-xs leading-[1.6] text-[#ffb4be]">
              {cameraError}
            </div>
          )}

          <div className="mt-[17px]">
            {!scannerActive ? (
              <button
                type="button"
                className="w-full cursor-pointer rounded-lg border-0 bg-[#a66be8] p-[13px] text-[13px] font-bold text-white disabled:cursor-wait disabled:opacity-60"
                onClick={startScanner}
                disabled={loading}
              >
                {loading ? "Membuka Kamera..." : "Aktifkan Kamera"}
              </button>
            ) : (
              <button
                type="button"
                className="w-full cursor-pointer rounded-lg border-0 bg-[#49334e] p-[13px] text-[13px] font-bold text-white"
                onClick={stopScanner}
              >
                Hentikan Scanner
              </button>
            )}
          </div>

          <div className="my-6 flex items-center gap-[15px] text-[10px] text-[#82728f] before:h-px before:flex-1 before:bg-[#49365b] before:content-[''] after:h-px after:flex-1 after:bg-[#49365b] after:content-['']">
            <span>ATAU</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="ticketCode"
              className="mb-2.5 block text-xs font-bold"
            >
              Masukkan Kode Tiket Manual
            </label>

            <input
              id="ticketCode"
              type="text"
              placeholder="Contoh: ENCORE-123456"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-lg border border-[#49365b] bg-[#100b1c] p-[13px] text-[13px] text-white outline-none placeholder:text-[#81738e] focus:border-[#b77aff]"
            />

            <button
              type="submit"
              className="mt-3 w-full cursor-pointer rounded-lg border-0 bg-[#a66be8] p-[13px] text-[13px] font-bold text-white"
            >
              Validasi Tiket
            </button>
          </form>

          {result && (
            <div
              className={`mt-[22px] rounded-xl border p-5 text-center ${
                resultStyles[result.type] || resultStyles.invalid
              }`}
              role="status"
            >
              <div className="mx-auto mb-3 grid size-[42px] place-items-center rounded-full bg-white/10 text-2xl font-bold">
                {result.type === "success"
                  ? "✓"
                  : result.type === "used"
                    ? "!"
                    : "×"}
              </div>

              <h3 className="font-heading text-[17px] font-bold">
                {result.type === "success"
                  ? "Tiket Valid"
                  : result.type === "used"
                    ? "Tiket Sudah Digunakan"
                    : "Validasi Gagal"}
              </h3>

              <p className="mt-2 text-xs leading-[1.6]">{result.message}</p>

              {result.ticket && (
                <div className="mt-[18px] grid gap-3 border-t border-white/20 pt-[15px] text-left">
                  <div>
                    <span className="mb-[5px] block text-[10px] opacity-70">
                      Kode Tiket
                    </span>
                    <strong className="block text-xs [overflow-wrap:anywhere]">
                      {result.ticket.ticketCode}
                    </strong>
                  </div>

                  <div>
                    <span className="mb-[5px] block text-[10px] opacity-70">
                      Nama Pemesan
                    </span>
                    <strong className="block text-xs [overflow-wrap:anywhere]">
                      {result.ticket.buyerName ||
                        result.ticket.name ||
                        result.ticket.buyerEmail ||
                        "-"}
                    </strong>
                  </div>

                  <div>
                    <span className="mb-[5px] block text-[10px] opacity-70">
                      Jumlah Tiket
                    </span>
                    <strong className="block text-xs [overflow-wrap:anywhere]">
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

        <div className="mt-[25px] rounded-xl border border-[#302340] bg-[#171025] p-[22px]">
          <h3 className="mb-[15px] font-heading text-[15px] font-bold">
            Petunjuk Check-in
          </h3>
          <ol className="list-decimal pl-5 text-xs leading-[2] text-[#b8acc7]">
            <li>Aktifkan kamera scanner.</li>
            <li>Pindai QR Code pada e-ticket pengunjung.</li>
            <li>Tunggu sistem memeriksa pembayaran dan status tiket.</li>
            <li>Jika valid, sistem otomatis mencatat check-in.</li>
            <li>Tiket yang sudah digunakan tidak bisa check-in lagi.</li>
          </ol>
        </div>

        <footer className="mt-[35px] border-t border-[#302340] pt-5 text-center text-[11px] text-[#81738e]">
          © 2026 ENCORE. All rights reserved.
        </footer>
      </section>
    </main>
  );
}