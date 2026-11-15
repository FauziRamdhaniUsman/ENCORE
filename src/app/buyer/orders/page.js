"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BuyerAccountLayout from "../../../components/buyer-account-layout";
import { supabase } from "../../../lib/supabase";

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        // Ambil data orders milik buyer beserta relasi tickets, events, dan ticket_types
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            tickets (
              id,
              ticket_code,
              events (
                title,
                date,
                location,
                venue,
                image_url
              ),
              ticket_types (
                name
              )
            )
          `
          )
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Gagal memuat transaksi dari Supabase:", error);
          setOrders([]);
          return;
        }

        setOrders(data || []);
      } catch (error) {
        console.error("Gagal memuat transaksi:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const formatPrice = (price) =>
    `Rp${Number(price || 0).toLocaleString("id-ID")}`;

  const getPaymentMethod = (method) => {
    const methods = {
      bank_transfer: "Transfer Bank",
      ewallet: "E-Wallet",
      qris: "QRIS",
    };

    return methods[method] || method || "Belum tersedia";
  };

  const getStatus = (order) => {
    const status = String(
      order.payment_status || order.status || ""
    ).toLowerCase();

    if (["paid", "success", "settlement"].includes(status)) {
      return "Berhasil";
    }

    if (["pending", "waiting"].includes(status)) {
      return "Menunggu Pembayaran";
    }

    if (["failed", "cancelled", "canceled", "expire"].includes(status)) {
      return "Gagal / Dibatalkan";
    }

    return status || "Belum diketahui";
  };

  return (
    <BuyerAccountLayout>
      <div className="mb-[25px]">
        <span className="text-[11px] font-bold tracking-[2px] text-[#bd91ff]">
          AKUN ENCORE
        </span>

        <h1 className="my-[9px] font-heading text-[27px] font-bold text-white">
          Transaksi Saya
        </h1>

        <p className="text-[13px] text-[#b9abc9]">
          Lihat riwayat pemesanan dan pembayaran tiket konser kamu.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#382a49] bg-[#21172e] px-5 py-[70px] text-center text-sm text-[#b9abc9]">
          Memuat transaksi...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[#382a49] bg-[#21172e] px-5 py-[70px] text-center">
          <div className="mb-[15px] text-4xl text-[#c69bff]">▤</div>
          <h3 className="mb-[9px] font-heading text-lg font-bold text-white">
            Belum Ada Transaksi
          </h3>
          <p className="text-[13px] text-[#b9abc9]">
            Pesanan konser yang kamu buat akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, index) => {
            const status = getStatus(order);
            const successful = status === "Berhasil";
            const firstTicket = order.tickets?.[0] || {};
            const eventInfo = firstTicket.events || {};
            const ticketTypeInfo = firstTicket.ticket_types || {};
            const ticketQty = order.tickets?.length || 1;

            return (
              <article
                className="rounded-2xl border border-[#382a49] bg-[#21172e] p-6 max-[550px]:p-4"
                key={order.id || index}
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#49365b] pb-4 max-[500px]:flex-col max-[500px]:items-start">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#b9abc9]">
                      Nomor Pesanan
                    </span>
                    <strong className="text-[13px] [overflow-wrap:anywhere] text-white">
                      {order.id || `ORDER-${index + 1}`}
                    </strong>
                  </div>

                  <span
                    className={`rounded-[20px] px-3 py-[7px] text-center text-[11px] font-medium ${
                      successful
                        ? "bg-[#244534] text-[#a4edc0]"
                        : "bg-[#50391d] text-[#ffd38c]"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="flex items-center gap-[18px] py-5">
                  {eventInfo.image_url && (
                    <img
                      src={eventInfo.image_url}
                      alt={eventInfo.title || "Konser"}
                      className="h-[120px] w-[110px] shrink-0 rounded-[10px] object-cover max-[550px]:h-[100px] max-[550px]:w-[85px]"
                    />
                  )}

                  <div className="min-w-0">
                    <h3 className="m-0 mb-2.5 font-heading text-[17px] font-bold text-white max-[550px]:text-sm">
                      {eventInfo.title || "Konser ENCORE"}
                    </h3>

                    <p className="my-1.5 text-xs text-[#b9abc9]">
                      {eventInfo.date || "-"}
                    </p>

                    <p className="my-1.5 text-xs text-[#b9abc9]">
                      {eventInfo.location || eventInfo.venue || "-"}
                    </p>

                    <p className="my-1.5 text-xs text-[#b9abc9]">
                      Kategori: {ticketTypeInfo.name || "Tiket"}
                    </p>

                    <p className="my-1.5 text-xs text-[#b9abc9]">
                      Jumlah: {ticketQty} tiket
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#49365b] py-[15px]">
                  <span className="text-xs text-[#b9abc9]">
                    Metode Pembayaran
                  </span>
                  <strong className="text-right text-[13px] text-[#c69bff]">
                    {getPaymentMethod(order.payment_method)}
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[#49365b] pt-4">
                  <span className="text-xs text-[#b9abc9]">
                    Total Pembayaran
                  </span>
                  <strong className="text-[19px] text-[#c69bff] max-[550px]:text-[15px]">
                    {formatPrice(order.total)}
                  </strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </BuyerAccountLayout>
  );
}