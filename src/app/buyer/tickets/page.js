
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { concerts } from "../../../data/concerts";
import BuyerAccountLayout from "../../../components/buyer-account-layout";

const monthNames = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

function parseConcertDate(value) {
  if (!value || value === "-") return null;

  const text = String(value).trim();
  const directDate = new Date(text);

  if (!Number.isNaN(directDate.getTime())) {
    return directDate;
  }

  const match = text.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);

  if (match) {
    const day = Number(match[1]);
    const month = monthNames[match[2].toLowerCase()];
    const year = Number(match[3]);

    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  return null;
}

export default function MyTicketsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketType, setTicketType] = useState("transaction");
  const [eventStatus, setEventStatus] = useState("upcoming");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Memuat data pengguna dan pesanan setelah halaman tampil.
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("encoreCurrentUser");

      if (!savedUser) {
        router.replace("/login");
        return;
      }

      const currentUser = JSON.parse(savedUser);

      if (currentUser.role !== "buyer") {
        router.replace("/login");
        return;
      }

      setUser(currentUser);

      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      const userTickets = savedOrders.filter((order) => {
        const paid = ["paid", "success", "settlement"].includes(
          String(
            order.status || order.paymentStatus || ""
          ).toLowerCase()
        );

        const belongsToUser =
          String(order.userId) === String(currentUser.id) ||
          order.buyerEmail === currentUser.email;

        return paid && belongsToUser;
      });

      setTickets(userTickets);
    } catch (error) {
      console.error("Gagal memuat tiket:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Mengambil informasi konser.
  function getConcert(order) {
    return concerts.find(
      (concert) =>
        String(concert.id) === String(order.concertId)
    );
  }

  function getTicketCode(order) {
    return order.ticketCode || `ENCORE-${order.id || "TICKET"}`;
  }

  function getQuantity(order) {
    return Number(
      order.ticketQuantity ??
      order.quantity ??
      order.totalPersons ??
      1
    );
  }

  function getTicketInfo(order) {
    const concert = getConcert(order);

    return {
      title:
        concert?.title ||
        order.concertTitle ||
        order.eventName ||
        "Konser ENCORE",

      artist:
        concert?.artist ||
        order.artist ||
        "Live Music Event",

      image:
        concert?.image ||
        order.concertImage ||
        "",

      date:
        concert?.date ||
        order.concertDate ||
        "-",

      location:
        concert?.location ||
        concert?.venue ||
        order.concertLocation ||
        order.location ||
        "-",
    };
  }

  function getStatus(order) {
    return order.checkInStatus === "checked_in"
      ? "Sudah Check-in"
      : "Belum Check-in";
  }

  function getTotal(order) {
    return Number(
      order.total ||
      order.totalPrice ||
      order.totalAmount ||
      0
    );
  }

  function formatPrice(value) {
    return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
  }

  // Filter tanggal dilakukan setelah halaman berjalan di browser.
  useEffect(() => {
    if (!tickets.length) {
      setFilteredTickets([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = tickets.filter((order) => {
      const date = parseConcertDate(getTicketInfo(order).date);

      if (!date) {
        return eventStatus === "upcoming";
      }

      date.setHours(0, 0, 0, 0);

      return eventStatus === "upcoming"
        ? date >= today
        : date < today;
    });

    setFilteredTickets(result);
  }, [tickets, eventStatus]);

  const totalTickets = tickets.reduce(
    (total, order) => total + getQuantity(order),
    0
  );

  function openTicket(order) {
    setSelectedTicket(order);
  }

  function printTicket() {
    window.print();
  }

  if (loading) {
    return (
      <div className="account-loading">
        Memuat tiket ENCORE...
      </div>
    );
  }

  if (!user) return null;

  return (
    <BuyerAccountLayout>
      <div className="my-ticket-page">

        {/* HEADER */}
        <div className="my-ticket-heading">
          <div>
            <span className="buyer-panel-eyebrow">
              ENCORE / TIKET EVENT
            </span>

            <h1>Tiket Event</h1>

            <p>
              Semua tiket konser yang berhasil kamu pesan
              tersedia di sini.
            </p>
          </div>

          <Link href="/concerts" className="ticket-explore-link">
            Cari Konser →
          </Link>
        </div>

        {/* RINGKASAN TIKET */}
        <div className="ticket-stat-row">
          <div className="ticket-stat">
            <span>Total Pesanan</span>
            <strong>{tickets.length}</strong>
          </div>

          <div className="ticket-stat">
            <span>Total Tiket</span>
            <strong>{totalTickets}</strong>
          </div>
        </div>

        {/* TIKET TRANSAKSI / PERSONAL */}
        <div className="ticket-type-tabs">
          <button
            type="button"
            className={
              ticketType === "transaction" ? "active" : ""
            }
            onClick={() => setTicketType("transaction")}
          >
            ▣ Tiket Transaksi
          </button>

          <button
            type="button"
            className={
              ticketType === "personal" ? "active" : ""
            }
            onClick={() => setTicketType("personal")}
          >
            ♙ Tiket Personal
          </button>
        </div>

        {/* EVENT MENDATANG / BERAKHIR */}
        <div className="ticket-event-tabs">
          <button
            type="button"
            className={
              eventStatus === "upcoming" ? "active" : ""
            }
            onClick={() => setEventStatus("upcoming")}
          >
            Event Mendatang
          </button>

          <button
            type="button"
            className={
              eventStatus === "ended" ? "active" : ""
            }
            onClick={() => setEventStatus("ended")}
          >
            Event Berakhir
          </button>
        </div>

        {/* DAFTAR TIKET */}
        {filteredTickets.length === 0 ? (
          <div className="buyer-ticket-empty">
            <div className="buyer-ticket-empty-icon">♫</div>

            <h3>
              {tickets.length === 0
                ? "Belum Ada Tiket"
                : eventStatus === "upcoming"
                  ? "Belum Ada Event Mendatang"
                  : "Belum Ada Event Berakhir"}
            </h3>

            <p>
              {tickets.length === 0
                ? "Tiket akan muncul otomatis setelah pembayaran pesananmu berhasil."
                : "Tiket untuk kategori ini belum tersedia."}
            </p>

            <Link href="/concerts">
              Jelajahi Konser
            </Link>
          </div>
        ) : (
          <div className="buyer-ticket-list">
            {filteredTickets.map((order, index) => {
              const info = getTicketInfo(order);
              const code = getTicketCode(order);
              const checkedIn =
                order.checkInStatus === "checked_in";

              return (
                <article
                  className="buyer-ticket-card"
                  key={`${order.id || code}-${index}`}
                >
                  <div className="buyer-ticket-main">
                    <div className="buyer-ticket-image">
                      {info.image ? (
                        <img
                          src={info.image}
                          alt={info.title}
                        />
                      ) : (
                        <span>♫</span>
                      )}
                    </div>

                    <div className="buyer-ticket-info">
                      <div className="buyer-ticket-badges">
                        <span className="buyer-paid-badge">
                          ✓ Pembayaran Berhasil
                        </span>

                        <span
                          className={
                            checkedIn
                              ? "buyer-checkin-badge checked"
                              : "buyer-checkin-badge"
                          }
                        >
                          {getStatus(order)}
                        </span>
                      </div>

                      <h3>{info.title}</h3>

                      <p className="buyer-ticket-artist">
                        {info.artist}
                      </p>

                      <div className="buyer-ticket-details">
                        <div>
                          <span>Tanggal</span>
                          <strong>{info.date}</strong>
                        </div>

                        <div>
                          <span>Lokasi</span>
                          <strong>{info.location}</strong>
                        </div>

                        <div>
                          <span>Kategori Tiket</span>
                          <strong>
                            {order.ticketName || "-"}
                          </strong>
                        </div>

                        <div>
                          <span>Jumlah Tiket</span>
                          <strong>
                            {getQuantity(order)} tiket
                          </strong>
                        </div>
                      </div>

                      <div className="buyer-ticket-code">
                        <span>KODE E-TIKET</span>
                        <strong>{code}</strong>
                      </div>

                      <button
                        type="button"
                        className="buyer-ticket-detail-button"
                        onClick={() => openTicket(order)}
                      >
                        Lihat Detail E-Ticket →
                      </button>
                    </div>
                  </div>

                  <div className="buyer-ticket-qr">
                    <div className="buyer-ticket-qr-box">
                      <QRCodeCanvas
                        value={code}
                        size={135}
                        level="H"
                        includeMargin
                      />
                    </div>

                    <strong>QR Code Tiket</strong>

                    <p>
                      Scan QR Code saat check-in konser.
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETAIL E-TICKET */}
      {selectedTicket && (
        <div
          className="buyer-ticket-modal-overlay"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="buyer-ticket-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="buyer-ticket-modal-heading">
              <div>
                <span>ENCORE DIGITAL TICKET</span>
                <h2>Detail E-Ticket</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
              >
                ×
              </button>
            </div>

            {(() => {
              const info = getTicketInfo(selectedTicket);
              const code = getTicketCode(selectedTicket);

              return (
                <>
                  <div className="buyer-modal-poster">
                    {info.image && (
                      <img src={info.image} alt={info.title} />
                    )}

                    <div>
                      <span>LIVE MUSIC EXPERIENCE</span>
                      <h2>{info.title}</h2>
                      <p>{info.artist}</p>
                    </div>
                  </div>

                  <div className="buyer-modal-details">
                    <div>
                      <span>Nama Pemesan</span>
                      <strong>
                        {selectedTicket.buyerName || user.name || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>
                        {selectedTicket.buyerEmail || user.email || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Nomor HP</span>
                      <strong>
                        {selectedTicket.buyerPhone || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Tanggal Konser</span>
                      <strong>{info.date}</strong>
                    </div>

                    <div>
                      <span>Lokasi</span>
                      <strong>{info.location}</strong>
                    </div>

                    <div>
                      <span>Kategori Tiket</span>
                      <strong>
                        {selectedTicket.ticketName || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Jumlah Tiket</span>
                      <strong>{getQuantity(selectedTicket)} tiket</strong>
                    </div>

                    <div>
                      <span>Harga Tiket</span>
                      <strong>
                        {formatPrice(selectedTicket.ticketPrice)}
                      </strong>
                    </div>

                    <div>
                      <span>Total Pembayaran</span>
                      <strong>
                        {formatPrice(getTotal(selectedTicket))}
                      </strong>
                    </div>

                    <div>
                      <span>Metode Pembayaran</span>
                      <strong>
                        {selectedTicket.paymentMethod || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Status Check-in</span>
                      <strong>{getStatus(selectedTicket)}</strong>
                    </div>
                  </div>

                  <div className="buyer-modal-qr">
                    <QRCodeCanvas
                      value={code}
                      size={180}
                      level="H"
                      includeMargin
                    />

                    <strong>{code}</strong>

                    <p>
                      Tunjukkan QR Code ini kepada petugas konser.
                    </p>
                  </div>
                </>
              );
            })()}

            <div className="buyer-modal-actions">
              <button type="button" onClick={printTicket}>
                Cetak / Simpan E-Ticket
              </button>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </BuyerAccountLayout>
  );
}
