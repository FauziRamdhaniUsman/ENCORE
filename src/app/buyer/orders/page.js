
"use client";

import { useEffect, useState } from "react";
import BuyerAccountLayout from "../../../components/buyer-account-layout";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      const allOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      if (!user) {
        setOrders([]);
        return;
      }

      const myOrders = allOrders.filter(
        (order) =>
          String(order.userId) === String(user.id) ||
          (
            order.buyerEmail &&
            order.buyerEmail.toLowerCase() ===
              (user.email || "").toLowerCase()
          )
      );

      setOrders(myOrders);
    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      order.status || order.paymentStatus || ""
    ).toLowerCase();

    if (["paid", "success", "settlement"].includes(status)) {
      return "Berhasil";
    }

    if (["pending", "waiting"].includes(status)) {
      return "Menunggu Pembayaran";
    }

    if (
      ["failed", "cancelled", "canceled", "expire"].includes(status)
    ) {
      return "Gagal / Dibatalkan";
    }

    return status || "Belum diketahui";
  };

  return (
    <BuyerAccountLayout>
      <div className="buyer-panel-heading">
        <span className="buyer-panel-eyebrow">
          AKUN ENCORE
        </span>

        <h1>Transaksi Saya</h1>

        <p>
          Lihat riwayat pemesanan dan pembayaran tiket konser kamu.
        </p>
      </div>

      {loading ? (
        <div className="buyer-empty-state">
          Memuat transaksi...
        </div>
      ) : orders.length === 0 ? (
        <div className="buyer-empty-state">
          <div className="buyer-empty-icon">▤</div>
          <h3>Belum Ada Transaksi</h3>
          <p>
            Pesanan konser yang kamu buat akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="buyer-order-list">
          {orders
            .slice()
            .reverse()
            .map((order, index) => {
              const status = getStatus(order);
              const successful = status === "Berhasil";

              return (
                <article
                  className="buyer-order-card"
                  key={order.id || index}
                >
                  <div className="buyer-order-header">
                    <div>
                      <span>Nomor Pesanan</span>
                      <strong>
                        {order.id || `ORDER-${index + 1}`}
                      </strong>
                    </div>

                    <span
                      className={`buyer-order-status ${
                        successful ? "success" : ""
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="buyer-order-content">
                    {order.concertImage && (
                      <img
                        src={order.concertImage}
                        alt={order.concertTitle || "Konser"}
                      />
                    )}

                    <div className="buyer-order-info">
                      <h3>
                        {order.concertTitle || "Konser ENCORE"}
                      </h3>

                      <p>
                        {order.concertDate || "-"}
                      </p>

                      <p>
                        {order.concertLocation || "-"}
                      </p>

                      <p>
                        Kategori: {order.ticketName || "Tiket"}
                      </p>

                      <p>
                        Jumlah:{" "}
                        {order.ticketQuantity || order.quantity || 1} tiket
                      </p>
                    </div>
                  </div>

                  <div className="buyer-order-payment">
                    <span>Metode Pembayaran</span>
                    <strong>
                      {getPaymentMethod(order.paymentMethod)}
                    </strong>
                  </div>

                  <div className="buyer-order-footer">
                    <span>Total Pembayaran</span>
                    <strong>
                      {formatPrice(order.total)}
                    </strong>
                  </div>
                </article>
              );
            })}
        </div>
      )}

      <style jsx>{`
        .buyer-order-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .buyer-order-card {
          padding: 24px;
          border: 1px solid #382a49;
          border-radius: 16px;
          background: #21172e;
        }

        .buyer-order-header,
        .buyer-order-footer,
        .buyer-order-payment {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .buyer-order-header {
          padding-bottom: 16px;
          border-bottom: 1px solid #49365b;
        }

        .buyer-order-header div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .buyer-order-header div span,
        .buyer-order-footer span,
        .buyer-order-payment span {
          color: #b9abc9;
          font-size: 12px;
        }

        .buyer-order-header div strong {
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .buyer-order-status {
          padding: 7px 12px;
          border-radius: 20px;
          background: #50391d;
          color: #ffd38c;
          font-size: 11px;
          text-align: center;
        }

        .buyer-order-status.success {
          background: #244534;
          color: #a4edc0;
        }

        .buyer-order-content {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 20px 0;
        }

        .buyer-order-content img {
          width: 110px;
          height: 120px;
          flex-shrink: 0;
          border-radius: 10px;
          object-fit: cover;
        }

        .buyer-order-info {
          min-width: 0;
        }

        .buyer-order-info h3 {
          margin: 0 0 10px;
          color: #fff;
          font-size: 17px;
        }

        .buyer-order-info p {
          margin: 6px 0;
          color: #b9abc9;
          font-size: 12px;
        }

        .buyer-order-payment {
          padding: 15px 0;
          border-top: 1px solid #49365b;
        }

        .buyer-order-payment strong {
          color: #c69bff;
          font-size: 13px;
          text-align: right;
        }

        .buyer-order-footer {
          padding-top: 16px;
          border-top: 1px solid #49365b;
        }

        .buyer-order-footer strong {
          color: #c69bff;
          font-size: 19px;
        }

        .buyer-empty-state {
          padding: 70px 20px;
          border: 1px solid #382a49;
          border-radius: 16px;
          background: #21172e;
          text-align: center;
        }

        .buyer-empty-icon {
          margin-bottom: 15px;
          color: #c69bff;
          font-size: 36px;
        }

        .buyer-empty-state h3 {
          margin-bottom: 9px;
          color: #fff;
        }

        .buyer-empty-state p {
          color: #b9abc9;
          font-size: 13px;
        }

        @media (max-width: 550px) {
          .buyer-order-card {
            padding: 16px;
          }

          .buyer-order-content img {
            width: 85px;
            height: 100px;
          }

          .buyer-order-info h3 {
            font-size: 14px;
          }

          .buyer-order-footer strong {
            font-size: 15px;
          }
        }
      `}</style>
    </BuyerAccountLayout>
  );
}
