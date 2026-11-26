"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "../../../data/concerts";
import { supabase } from "../../../lib/supabase";

const paymentCategories = [
  {
    id: "bank_transfer",
    name: "Transfer Bank",
    description: "BCA, BNI, BRI, Mandiri Virtual Account",
    icon: "🏦",
    providers: [
      { id: "bca", name: "BCA", paymentType: "bank_transfer", bank: "bca" },
      { id: "bni", name: "BNI", paymentType: "bank_transfer", bank: "bni" },
      { id: "bri", name: "BRI", paymentType: "bank_transfer", bank: "bri" },
      { id: "mandiri", name: "Mandiri", paymentType: "echannel", bank: "mandiri" },
    ],
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description: "GoPay, ShopeePay, OVO, DANA",
    icon: "📱",
    providers: [
      { id: "gopay", name: "GoPay", paymentType: "gopay", bank: null },
      { id: "shopeepay", name: "ShopeePay", paymentType: "qris", bank: null },
      { id: "ovo", name: "OVO", paymentType: "qris", bank: null },
      { id: "dana", name: "DANA", paymentType: "qris", bank: null },
    ],
  },
  {
    id: "qris",
    name: "QRIS",
    description: "Scan QR untuk semua aplikasi pembayaran",
    icon: "▦",
    providers: [],
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

  const [selectedCategoryId, setSelectedCategoryId] = useState("bank_transfer");
  const [selectedProviderId, setSelectedProviderId] = useState("bca");

  const [processing, setProcessing] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentInstruction, setPaymentInstruction] = useState(null);
  const [copiedText, setCopiedText] = useState("");
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

  const handleSelectCategory = (category) => {
    setSelectedCategoryId(category.id);
    if (category.providers && category.providers.length > 0) {
      setSelectedProviderId(category.providers[0].id);
    } else {
      setSelectedProviderId("");
    }
  };

  const activeCategory =
    paymentCategories.find((c) => c.id === selectedCategoryId) ||
    paymentCategories[0];

  const activeProvider =
    activeCategory.providers.find((p) => p.id === selectedProviderId) ||
    activeCategory.providers[0] ||
    null;

  const getFormattedPaymentLabel = () => {
    if (activeProvider) {
      return `${activeCategory.name} - ${activeProvider.name}`;
    }
    return activeCategory.name;
  };

  // Simpan transaksi lunas & terbitkan e-ticket ke Supabase
  const finalizeOrderInSupabase = useCallback(async () => {
    if (!order || !authUser) return;

    const qty = Math.max(
      1,
      Number(order.ticketQuantity || order.quantity || 1)
    );
    const paymentMethodLabel = getFormattedPaymentLabel();

    let targetEventId = order.isSupabaseEvent ? order.concertId : null;
    let targetTicketTypeId = order.ticketTypeId || null;

    if (!targetEventId) {
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
          payment_method: paymentMethodLabel,
          payment_status: "paid",
        },
      ])
      .select()
      .single();

    if (orderError || !createdOrder) {
      throw new Error(orderError?.message || "Gagal menyimpan transaksi.");
    }

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
      paymentMethod: paymentMethodLabel,
      ticketCode: generatedCodes[0],
    });
    setPaymentInstruction(null);
    setSuccess(true);
  }, [order, authUser, activeCategory, activeProvider]);

  // 1. Kirim request charge ke Midtrans Core API
  const handleCreatePaymentCode = async () => {
    if (!order || !authUser || processing) return;

    setProcessing(true);
    setError("");

    try {
      const uniqueOrderId = `ENC-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      const targetPaymentType = activeProvider
        ? activeProvider.paymentType
        : "qris";
      const targetBank = activeProvider ? activeProvider.bank : null;

      const res = await fetch("/api/midtrans/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: uniqueOrderId,
          grossAmount: Number(order.total || 0),
          paymentType: targetPaymentType,
          bank: targetBank,
          customerName: order.buyerName,
          customerEmail: order.buyerEmail,
          customerPhone: order.buyerPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat kode pembayaran.");
      }

      const vaNumber = data.va_numbers?.[0]?.va_number || null;
      const qrAction = data.actions?.find((a) => a.name === "generate-qr-code");
      const deeplinkAction = data.actions?.find(
        (a) => a.name === "deeplink-redirect"
      );

      setPaymentInstruction({
        midtransOrderId: data.order_id || uniqueOrderId,
        paymentType: targetPaymentType,
        methodLabel: getFormattedPaymentLabel(),
        vaNumber,
        billerCode: data.biller_code || null,
        billKey: data.bill_key || null,
        qrUrl: qrAction?.url || null,
        deeplinkUrl: deeplinkAction?.url || null,
      });
    } catch (err) {
      setError(err.message || "Gagal memproses pembayaran.");
    } finally {
      setProcessing(false);
    }
  };

  // 2. Cek status pembayaran di Midtrans
  const handleCheckPaymentStatus = useCallback(
    async (silent = false) => {
      if (!paymentInstruction?.midtransOrderId || checkingStatus || success)
        return;

      if (!silent) setCheckingStatus(true);
      try {
        const res = await fetch(
          `/api/midtrans/status?orderId=${encodeURIComponent(
            paymentInstruction.midtransOrderId
          )}`
        );
        const data = await res.json();
        const txStatus = (data.transaction_status || "").toLowerCase();

        if (txStatus === "settlement" || txStatus === "capture") {
          await finalizeOrderInSupabase();
        } else if (!silent) {
          setError(
            `Status saat ini: "${
              txStatus || "pending"
            }". Selesaikan pembayaran di Midtrans Simulator lalu klik cek status lagi.`
          );
        }
      } catch (err) {
        if (!silent) setError(err.message);
      } finally {
        if (!silent) setCheckingStatus(false);
      }
    },
    [paymentInstruction, checkingStatus, success, finalizeOrderInSupabase]
  );

  // Polling otomatis setiap 4 detik saat menunggu pembayaran
  useEffect(() => {
    if (!paymentInstruction || success) return;

    const interval = setInterval(() => {
      handleCheckPaymentStatus(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [paymentInstruction, success, handleCheckPaymentStatus]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(""), 2000);
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
              ENCORE × MIDTRANS
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
                <span className="text-[#aaa1bd]">Metode Pembayaran</span>
                <strong className="text-right text-[#c4b5fd]">
                  {order.paymentMethod}
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
            Pilih kategori metode pembayaran beserta bank atau penyedia e-wallet
            untuk mendapatkan kode pembayaran.
          </p>
        </header>

        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] items-start gap-6 max-[800px]:grid-cols-1">
          {/* KOLOM KIRI: KATEGORI BANK / E-WALLET / QRIS ATAU INSTRUKSI BAYAR */}
          <section className="rounded-[17px] border border-[#49316d] bg-[#110c20f7] p-[27px] shadow-[0_12px_35px_#00000035] max-[800px]:p-[21px]">
            {!paymentInstruction ? (
              <>
                <div className="mb-[25px] flex items-center gap-[13px]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[#8b5cf625] font-extrabold text-[#c4b5fd]">
                    01
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-bold">
                      Metode Pembayaran
                    </h2>
                    <p className="mt-[5px] text-xs text-[#aaa1bd]">
                      Pilih Transfer Bank, E-Wallet, atau QRIS.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-[13px]">
                  {paymentCategories.map((category) => {
                    const isSelected = selectedCategoryId === category.id;

                    return (
                      <div key={category.id} className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(category)}
                          className={`flex w-full cursor-pointer items-center gap-[15px] rounded-[11px] border p-[17px] text-left text-white transition duration-200 ${
                            isSelected
                              ? "border-primary-light bg-[#8b5cf619]"
                              : "border-[#493d61] bg-[#0c0918] hover:border-primary-light hover:bg-[#8b5cf619]"
                          }`}
                        >
                          <span className="grid size-[43px] shrink-0 place-items-center rounded-[9px] bg-[#8b5cf625] text-[21px]">
                            {category.icon}
                          </span>

                          <span className="flex flex-1 flex-col gap-[5px]">
                            <strong className="text-[13px]">
                              {category.name}
                            </strong>
                            <small className="text-[11px] text-[#aaa1bd]">
                              {category.description}
                            </small>
                          </span>

                          <span className="text-[19px] text-[#c4b5fd]">
                            {isSelected ? "●" : "○"}
                          </span>
                        </button>

                        {/* SUB-PILIHAN BANK ATAU E-WALLET */}
                        {isSelected && category.providers.length > 0 && (
                          <div className="ml-2 rounded-[10px] border border-[#392e4d] bg-[#0c0918]/90 p-3.5">
                            <p className="mb-2.5 text-[11px] font-semibold text-[#c4b5fd]">
                              Pilih{" "}
                              {category.id === "bank_transfer"
                                ? "Bank"
                                : "E-Wallet"}
                              :
                            </p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {category.providers.map((provider) => {
                                const isProvActive =
                                  selectedProviderId === provider.id;

                                return (
                                  <button
                                    key={provider.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedProviderId(provider.id)
                                    }
                                    className={`cursor-pointer rounded-[8px] border px-3 py-2.5 text-xs font-bold transition ${
                                      isProvActive
                                        ? "border-primary-light bg-[#8b5cf633] text-white"
                                        : "border-[#493d61] bg-[#140e26] text-[#aaa1bd] hover:border-primary-light hover:text-white"
                                    }`}
                                  >
                                    {provider.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div>
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#392e4d] pb-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-[1.5px] text-primary-light">
                      MENUNGGU PEMBAYARAN
                    </span>
                    <h2 className="mt-1 font-heading text-lg font-bold text-white">
                      {paymentInstruction.methodLabel}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentInstruction(null);
                      setError("");
                    }}
                    className="cursor-pointer rounded-lg border border-[#493d61] px-3 py-1.5 text-xs text-[#c4b5fd] hover:border-primary-light hover:text-white"
                  >
                    Ganti Metode
                  </button>
                </div>

                {/* TAMPILAN VA BCA / BNI / BRI */}
                {paymentInstruction.vaNumber && (
                  <div className="rounded-xl border border-primary-light/50 bg-[#0c0918] p-5">
                    <p className="text-xs text-[#aaa1bd]">
                      Nomor Virtual Account
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <strong className="font-mono text-2xl tracking-wider text-white">
                        {paymentInstruction.vaNumber}
                      </strong>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(paymentInstruction.vaNumber, "va")
                        }
                        className="cursor-pointer rounded-lg bg-[#8b5cf633] px-3.5 py-2 text-xs font-bold text-[#c4b5fd] hover:bg-[#8b5cf655] hover:text-white"
                      >
                        {copiedText === "va" ? "Tersalin ✓" : "Salin VA"}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAMPILAN MANDIRI BILL */}
                {paymentInstruction.billerCode && (
                  <div className="flex flex-col gap-3 rounded-xl border border-primary-light/50 bg-[#0c0918] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#aaa1bd]">
                          Kode Perusahaan (Biller Code)
                        </p>
                        <strong className="font-mono text-xl text-white">
                          {paymentInstruction.billerCode}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(paymentInstruction.billerCode, "biller")
                        }
                        className="cursor-pointer rounded-lg bg-[#8b5cf633] px-3 py-1.5 text-xs font-bold text-[#c4b5fd]"
                      >
                        {copiedText === "biller" ? "Tersalin ✓" : "Salin"}
                      </button>
                    </div>

                    <div className="h-px bg-[#392e4d]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#aaa1bd]">
                          Kode Bayar (Bill Key)
                        </p>
                        <strong className="font-mono text-xl text-white">
                          {paymentInstruction.billKey}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(paymentInstruction.billKey, "billkey")
                        }
                        className="cursor-pointer rounded-lg bg-[#8b5cf633] px-3 py-1.5 text-xs font-bold text-[#c4b5fd]"
                      >
                        {copiedText === "billkey" ? "Tersalin ✓" : "Salin"}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAMPILAN QRIS / GOPAY / E-WALLET */}
                {paymentInstruction.qrUrl && (
                  <div className="flex flex-col items-center rounded-xl border border-primary-light/50 bg-[#0c0918] p-5 text-center">
                    <p className="mb-3 text-xs text-[#aaa1bd]">
                      Scan QR Code di bawah ini atau salin URL QR untuk Midtrans
                      Simulator
                    </p>
                    <img
                      src={paymentInstruction.qrUrl}
                      alt="QR Code Pembayaran"
                      className="size-[210px] rounded-xl bg-white p-2.5"
                    />
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(paymentInstruction.qrUrl, "qr")
                        }
                        className="cursor-pointer rounded-lg bg-[#8b5cf633] px-3.5 py-2 text-xs font-bold text-[#c4b5fd]"
                      >
                        {copiedText === "qr"
                          ? "URL QR Tersalin ✓"
                          : "Salin URL Gambar QR"}
                      </button>

                      {paymentInstruction.deeplinkUrl && (
                        <a
                          href={paymentInstruction.deeplinkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-primary-light px-3.5 py-2 text-xs font-bold text-white no-underline"
                        >
                          Buka Simulator GoPay ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-[9px] bg-[#8b5cf619] p-3.5 text-[11px] leading-[1.7] text-[#c8b8e4]">
                  <p>
                    <strong>Cara Simulasi Pembayaran:</strong> Salin nomor VA /
                    Kode Bayar / URL QR di atas, buka{" "}
                    <a
                      href="https://simulator.sandbox.midtrans.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-white underline"
                    >
                      Midtrans Sandbox Simulator
                    </a>
                    , lalu selesaikan pembayaran. Halaman ini akan otomatis
                    terkonfirmasi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckPaymentStatus(false)}
                  disabled={checkingStatus}
                  className={primaryBtnClass}
                >
                  {checkingStatus
                    ? "Mengecek Status..."
                    : "Saya Sudah Bayar (Cek Status)"}
                </button>
              </div>
            )}
          </section>
                  <button
          type="button"
          onClick={finalizeOrderInSupabase}
          className="mt-2.5 flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-[#4ade80]/50 bg-[#22c55e18] p-3 text-xs font-bold text-[#4ade80] transition hover:bg-[#22c55e30]"
        >
          ⚡ Simulasi Bayar Otomatis (Mode Testing)
        </button>

          {/* KOLOM KANAN: RINGKASAN PESANAN */}
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
                  Detail tiket & total pembayaran.
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
              <span className="text-[#aaa1bd]">Metode Dipilih</span>
              <strong className="max-w-[60%] text-right [overflow-wrap:anywhere] text-[#c4b5fd]">
                {getFormattedPaymentLabel()}
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

            {!paymentInstruction && (
              <button
                type="button"
                className={primaryBtnClass}
                onClick={handleCreatePaymentCode}
                disabled={processing}
              >
                {processing
                  ? "Membuat Kode Pembayaran..."
                  : "Buat Kode Pembayaran"}
              </button>
            )}

            <p className="mt-3.5 text-center text-[11px] leading-[1.7] text-[#9990aa]">
              🔒 Terintegrasi langsung dengan Midtrans Core API
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}