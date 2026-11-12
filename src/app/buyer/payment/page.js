"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "../../../data/concerts";
import { supabase } from "../../../lib/supabase";

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

function createTicketCode(index = 0) {
  return (
    "ENC-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    (index + 1) +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

const pageWrapperClass =
  "min-h-screen bg-[linear-gradient(180deg,rgba(9,7,20,0.84),rgba(9,7,20,0.97)),url('/images/bg%20konser.jpg')] bg-cover bg-fixed bg-top px-[6%] py-[45px] text-white max-[800px]:bg-scroll max-[800px]:px-[5%] max-[800px]:py-[30px]";

const primaryBtnClass =
  "mt-2.5 flex min-h-[50px] w-full cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[linear-gradient(100deg,#7c3aed,#a855f7)] p-3 text-[13px] font-bold text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

export default function PaymentPage() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("bank_transfer");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [issuedCodes, setIssuedCodes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const initPayment = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "buyer") {
          router.replace("/login");
          return;
        }

        setAuthUser(profile);

        const pendingOrder = JSON.parse(
          localStorage.getItem("encorePendingOrder") || "null"
        );

        if (!pendingOrder) {
          setLoading(false);
          setError(
            "Pesanan tidak ditemukan. Silakan lakukan checkout kembali."
          );
          return;
        }

        if (pendingOrder.userId && pendingOrder.userId !== user.id) {
          setLoading(false);
          setError("Pesanan ini bukan milik akun yang sedang login.");
          return;
        }

        setOrder(pendingOrder);
      } catch {
        setError("Terjadi kesalahan saat membaca data pesanan.");
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [router]);

  const handlePayment = async () => {
    if (!order || !authUser || processing) return;

    setProcessing(true);
    setError("");

    try {
      const qty = Math.max(1, Number(order.ticketQuantity || order.quantity || 1));

      // 1. Pastikan event & ticket_type tersedia di Supabase (mendukung event dinamis & katalog bawaan)
      let targetEventId = order.isSupabaseEvent ? order.concertId : null;
      let targetTicketTypeId = order.ticketTypeId || null;

      if (!targetEventId) {
        // Cek apakah event katalog bawaan sudah pernah disinkronkan ke tabel 'events' berdasarkan judul
        const { data: existingEvent } = await supabase
          .from("events")
          .select("id")
          .eq("title", order.concertTitle)
          .maybeSingle();

        if (existingEvent) {
          targetEventId = existingEvent.id;
        } else {
          const { data: createdEv, error: createEvErr } = await supabase
            .from("events")
            .insert([
              {
                title: order.concertTitle,
                location: order.concertLocation || "Indonesia",
                venue: order.concertLocation || "Indonesia",
                image_url: order.concertImage || null,
              },
            ])
            .select("id")
            .single();

          if (createEvErr) throw new Error(createEvErr.message);
          targetEventId = createdEv.id;
        }
      }

      if (!targetTicketTypeId && targetEventId) {
        const { data: existingType } = await supabase
          .from("ticket_types")
          .select("id")
          .eq("event_id", targetEventId)
          .eq("name", order.ticketName)
          .maybeSingle();

        if (existingType) {
          targetTicketTypeId = existingType.id;
        } else {
          const { data: createdType, error: createTypeErr } = await supabase
            .from("ticket_types")
            .insert([
              {
                event_id: targetEventId,
                name: order.ticketName,
                price: Number(order.ticketPrice || 0),
                quota: 1000,
              },
            ])
            .select("id")
            .single();

          if (createTypeErr) throw new Error(createTypeErr.message);
          targetTicketTypeId = createdType.id;
        }
      }

      // 2. Simpan pesanan lunas ke tabel 'orders'
      const { data: createdOrder, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            buyer_id: authUser.id,
            buyer_name: order.buyerName,
            buyer_email: order.buyerEmail,
            buyer_phone: order.buyerPhone,
            subtotal: Number(order.subtotal || 0),
            service_fee: Number(order.serviceFee || 0),
            total: Number(order.total || 0),
            payment_method: selectedMethod,
            payment_status: "paid",
          },
        ])
        .select()
        .single();

      if (orderError || !createdOrder) {
        throw new Error(orderError?.message || "Gagal menyimpan transaksi.");
      }

      // 3. Terbitkan e-ticket sebanyak quantity ke tabel 'tickets'
      const generatedCodes = Array.from({ length: qty }, (_, idx) =>
        createTicketCode(idx)
      );

      const ticketsToInsert = generatedCodes.map((code) => ({
        order_id: createdOrder.id,
        event_id: targetEventId,
        ticket_type_id: targetTicketTypeId,
        ticket_code: code,
        holder_name: order.buyerName,
        checked_in: false,
      }));

      const { error: ticketsError } = await supabase
        .from("tickets")
        .insert(ticketsToInsert);

      if (ticketsError) {
        throw new Error(
          "Order tersimpan, namun gagal menerbitkan tiket: " +
            ticketsError.message
        );
      }

      // 4. Kurangi kuota tiket di tabel 'ticket_types' jika tersedia
      if (targetTicketTypeId) {
        const { data: currentType } = await supabase
          .from("ticket_types")
          .select("quota")
          .eq("id", targetTicketTypeId)
          .maybeSingle();

        if (currentType && typeof currentType.quota === "number") {
          const updatedQuota = Math.max(0, currentType.quota - qty);
          await supabase
            .from("ticket_types")
            .update({ quota: updatedQuota })
            .eq("id", targetTicketTypeId);
        }
      }

      localStorage.removeItem("encorePendingOrder");

      setIssuedCodes(generatedCodes);
      setOrder({
        ...order,
        status: "paid",
        paymentMethod: selectedMethod,
        ticketCode: generatedCodes[0],
      });
      setSuccess(true);
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.message || "Pembayaran gagal diproses. Silakan coba kembali."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className={pageWrapperClass}>
        <p className="py-[100px] text-center text-[#c4b5fd]">
          Memuat pembayaran...
        </p>
      </main>
    );
  }

  if (success && order) {
    return (
      <main className={pageWrapperClass}>
        <div className="mx-auto max-w-[1150px]">
          <div className="mx-auto my-[60px] max-w-[560px] rounded-[17px] border border-[#49316d] bg-[#110c20f7] p-[27px] text-center shadow-[0_12px_35px_#00000035]">
            <div className="mx-auto mb-[22px] grid size-[75px] place-items-center rounded-full bg-[#22c55e20] text-[38px] text-[#4ade80]">
              ✓
            </div>

            <span className="text-[11px] font-extrabold tracking-[2px] text-primary-light">
              ENCORE PAYMENT
            </span>

            <h1 className="my-3 font-heading text-[27px] font-bold">
              Pembayaran Berhasil!
            </h1>

            <p className="text-[13px] leading-[1.7] text-[#aaa1bd]">
              Terima kasih telah memesan tiket melalui ENCORE. E-ticket kamu
              sudah diterbitkan di database.
            </p>

            <div className="my-[25px] flex flex-col gap-2.5 rounded-[13px] border border-dashed border-primary-light bg-[#8b5cf615] p-[22px]">
              <span className="text-[10px] font-extrabold tracking-[2px] text-primary-light">
                KODE E-TICKET ({issuedCodes.length} TIKET)
              </span>

              <div className="flex flex-col gap-2">
                {issuedCodes.map((code) => (
                  <strong
                    key={code}
                    className="text-[20px] tracking-[1px] [overflow-wrap:anywhere] text-white"
                  >
                    {code}
                  </strong>
                ))}
              </div>

              <small className="text-[11px] leading-[1.6] text-[#aaa1bd]">
                Tunjukkan kode QR / kode tiket ini pada petugas saat memasuki
                venue konser.
              </small>
            </div>

            <div className="flex flex-col gap-3.5 border-t border-[#493d61] py-5 text-left">
              <div className="flex justify-between gap-[15px] text-xs">
                <span className="text-[#aaa1bd]">Konser</span>
                <strong className="text-right text-white">
                  {order.concertTitle}
                </strong>
              </div>

              <div className="flex justify-between gap-[15px] text-xs">
                <span className="text-[#aaa1bd]">Kategori Tiket</span>
                <strong className="text-right text-white">
                  {order.ticketName}
                </strong>
              </div>

              <div className="flex justify-between gap-[15px] text-xs">
                <span className="text-[#aaa1bd]">Jumlah</span>
                <strong className="text-right text-white">
                  {order.ticketQuantity} tiket
                </strong>
              </div>

              <div className="flex justify-between gap-[15px] text-xs">
                <span className="text-[#aaa1bd]">Total Pembayaran</span>
                <strong className="text-right text-white">
                  {formatPrice(order.total)}
                </strong>
              </div>

              <div className="flex justify-between gap-[15px] text-xs">
                <span className="text-[#aaa1bd]">Status</span>
                <strong className="text-right text-[#4ade80]">LUNAS</strong>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                className={primaryBtnClass}
                onClick={() => router.replace("/buyer/dashboard")}
              >
                Lihat Tiket Saya →
              </button>

              <button
                type="button"
                className="flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#49316d] bg-transparent p-3 text-[13px] font-semibold text-[#c4b5fd] transition hover:border-primary-light hover:text-white"
                onClick={() => router.replace("/")}
              >
                Kembali ke Home
              </button>
            </div>

            <p className="mt-3.5 text-center text-[11px] leading-[1.7] text-[#9990aa]">
              Ini merupakan simulasi pembayaran. Tidak ada uang sungguhan yang
              ditransfer.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className={pageWrapperClass}>
        <div className="mx-auto max-w-[1150px]">
          <div className="mx-auto my-[60px] max-w-[560px] rounded-[17px] border border-[#49316d] bg-[#110c20f7] p-[27px] text-center shadow-[0_12px_35px_#00000035]">
            <h2 className="font-heading text-xl font-bold">
              Pesanan Tidak Tersedia
            </h2>
            <p className="my-4 text-[13px] leading-[1.7] text-[#aaa1bd]">
              {error}
            </p>

            <Link href="/concerts" className={primaryBtnClass}>
              Cari Konser
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={pageWrapperClass}>
      <div className="mx-auto max-w-[1150px]">
        <Link
          href="/buyer/checkout"
          className="text-[13px] text-[#c4b5fd] no-underline hover:text-white"
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
        >
          ← Kembali
        </Link>

        <header className="my-7">
          <span className="text-[11px] font-extrabold tracking-[2px] text-primary-light">
            ENCORE TICKETING
          </span>

          <h1 className="my-2.5 font-heading text-[clamp(28px,4vw,38px)] font-bold">
            Pembayaran
          </h1>

          <p className="text-[13px] leading-[1.7] text-[#aaa1bd]">
            Pilih metode pembayaran untuk menyelesaikan pemesanan tiket
            konsermu.
          </p>
        </header>

        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] items-start gap-6 max-[800px]:grid-cols-1">
          <section className="rounded-[17px] border border-[#49316d] bg-[#110c20f7] p-[27px] shadow-[0_12px_35px_#00000035] max-[800px]:p-[21px]">
            <div className="mb-[25px] flex items-center gap-[13px]">
              <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#8b5cf625] font-extrabold text-[#c4b5fd]">
                01
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Metode Pembayaran
                </h2>
                <p className="mt-[5px] text-xs text-[#aaa1bd]">
                  Pilih salah satu metode pembayaran.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-[13px]">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;

                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex w-full cursor-pointer items-center gap-[15px] rounded-[11px] border p-[17px] text-left text-white transition duration-200 ${
                      isSelected
                        ? "border-primary-light bg-[#8b5cf619]"
                        : "border-[#493d61] bg-[#0c0918] hover:border-primary-light hover:bg-[#8b5cf619]"
                    }`}
                  >
                    <span className="grid size-[43px] shrink-0 place-items-center rounded-[9px] bg-[#8b5cf625] text-[21px]">
                      {method.icon}
                    </span>

                    <span className="flex flex-1 flex-col gap-[5px]">
                      <strong className="text-[13px]">{method.name}</strong>
                      <small className="text-[11px] text-[#aaa1bd]">
                        {method.description}
                      </small>
                    </span>

                    <span className="text-[19px] text-[#c4b5fd]">
                      {isSelected ? "●" : "○"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-[22px] flex gap-2.5 rounded-[9px] bg-[#8b5cf619] p-3.5 text-[11px] leading-[1.7] text-[#c8b8e4]">
              <span className="text-primary-light">ⓘ</span>
              <p>
                ENCORE menggunakan pembayaran simulasi. Pilihan metode ini hanya
                untuk demonstrasi alur transaksi, bukan transfer sungguhan.
              </p>
            </div>
          </section>

          <aside className="rounded-[17px] border border-[#49316d] bg-[#110c20f7] p-[27px] shadow-[0_12px_35px_#00000035] max-[800px]:p-[21px]">
            <div className="mb-[25px] flex items-center gap-[13px]">
              <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#8b5cf625] font-extrabold text-[#c4b5fd]">
                02
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Ringkasan Pesanan
                </h2>
                <p className="mt-[5px] text-xs text-[#aaa1bd]">
                  Periksa pesanan sebelum konfirmasi.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-heading text-[15px] font-bold">
                {order.concertTitle}
              </h3>
              <p className="mt-[7px] text-xs text-[#aaa1bd]">
                {order.concertDate}
              </p>
              <p className="mt-[7px] text-xs text-[#aaa1bd]">
                {order.concertLocation}
              </p>
            </div>

            <div className="my-5 h-px bg-[#392e4d]" />

            <div className="my-3.5 flex justify-between gap-3.5 text-xs">
              <span className="text-[#aaa1bd]">Kategori Tiket</span>
              <strong className="max-w-[60%] text-right [overflow-wrap:anywhere] text-[#f5f1fc]">
                {order.ticketName}
              </strong>
            </div>

            <div className="my-3.5 flex justify-between gap-3.5 text-xs">
              <span className="text-[#aaa1bd]">Jumlah</span>
              <strong className="max-w-[60%] text-right [overflow-wrap:anywhere] text-[#f5f1fc]">
                {order.ticketQuantity}
              </strong>
            </div>

            <div className="my-3.5 flex justify-between gap-3.5 text-xs">
              <span className="text-[#aaa1bd]">Pemesan</span>
              <strong className="max-w-[60%] text-right [overflow-wrap:anywhere] text-[#f5f1fc]">
                {order.buyerName}
              </strong>
            </div>

            <div className="my-3.5 flex justify-between gap-3.5 text-xs">
              <span className="text-[#aaa1bd]">Email</span>
              <strong className="max-w-[60%] text-right [overflow-wrap:anywhere] text-[#f5f1fc]">
                {order.buyerEmail}
              </strong>
            </div>

            <div className="my-5 h-px bg-[#392e4d]" />

            <div className="my-3.5 flex justify-between gap-3.5 text-xs">
              <span className="text-[#aaa1bd]">Subtotal</span>
              <strong className="max-w-[60%] text-right [overflow-wrap:anywhere] text-[#f5f1fc]">
                {formatPrice(order.subtotal)}
              </strong>
            </div>

            <div className="my-3.5 flex justify-between gap-3.5 text-xs">
              <span className="text-[#aaa1bd]">Biaya Layanan</span>
              <strong className="max-w-[60%] text-right [overflow-wrap:anywhere] text-[#f5f1fc]">
                {formatPrice(order.serviceFee)}
              </strong>
            </div>

            <div className="mt-[22px] flex flex-col gap-2.5 border-t border-[#493d61] py-5">
              <span className="text-xs text-[#c5bad8]">Total Pembayaran</span>
              <strong className="text-[25px] text-[#c4b5fd]">
                {formatPrice(order.total)}
              </strong>
            </div>

            {error && (
              <p className="my-[15px] text-xs text-[#fca5a5]">{error}</p>
            )}

            <button
              type="button"
              className={primaryBtnClass}
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? "Memproses..." : "Konfirmasi Pembayaran"}
            </button>

            <p className="mt-3.5 text-center text-[11px] leading-[1.7] text-[#9990aa]">
              🔒 Pembayaran simulasi ENCORE
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}