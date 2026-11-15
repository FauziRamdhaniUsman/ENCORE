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
          String(order.status || order.paymentStatus || "").toLowerCase()
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

  function getConcert(order) {
    return concerts.find(
      (concert) => String(concert.id) === String(order.concertId)
    );
  }

  function getTicketCode(order) {
    return order.ticketCode || `ENCORE-${order.id || "TICKET"}`;
  }

  function getQuantity(order) {
    return Number(
      order.ticketQuantity ?? order.quantity ?? order.totalPersons ?? 1
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
      artist: concert?.artist || order.artist || "Live Music Event",
      image: concert?.image || order.concertImage || "",
      date: concert?.date || order.concertDate || "-",
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
    return Number(order.total || order.totalPrice || order.totalAmount || 0);
  }

  function formatPrice(value) {
    return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
  }

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

      return eventStatus === "upcoming" ? date >= today : date < today;
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
      <div className="grid min-h-[60vh] place-items-center bg-[#090611] text-white">
        Memuat tiket ENCORE...
      </div>
    );
  }

  if (!user) return null;

  return (
    <BuyerAccountLayout>
      <div className={`text-white ${selectedTicket ? "print:hidden" : ""}`}>
        {/* HEADER */}
        <div className="mb-[25px] flex items-center justify-between gap-[15px] max-[700px]:flex-col max-[700px]:items-start">
          <div>
            <span className="text-[11px] font-bold tracking-[2px] text-[#bd91ff]">
              ENCORE / TIKET EVENT
            </span>

            <h1 className="my-[9px] font-heading text-[27px] font-bold">
              Tiket Event
            </h1>

            <p className="text-[13px] text-[#b9abc9]">
              Semua tiket konser yang berhasil kamu pesan tersedia di sini.
            </p>
          </div>

          <Link
            href="/concerts"
            className="text-[13px] whitespace-nowrap text-[#c69bff] hover:text-white"
          >
            Cari Konser →
          </Link>
        </div>

        {/* RINGKASAN TIKET */}
        <div className="mb-[25px] grid grid-cols-2 gap-3.5">
          <div className="rounded-[13px] border border-[#382a49] bg-[#21172e] p-[18px]">
            <span className="block text-xs text-[#b9abc9]">Total Pesanan</span>
            <strong className="mt-2 block text-[25px] text-[#c69bff]">
              {tickets.length}
            </strong>
          </div>

          <div className="rounded-[13px] border border-[#382a49] bg-[#21172e] p-[18px]">
            <span className="block text-xs text-[#b9abc9]">Total Tiket</span>
            <strong className="mt-2 block text-[25px] text-[#c69bff]">
              {totalTickets}
            </strong>
          </div>
        </div>

        {/* TIKET TRANSAKSI / PERSONAL */}
        <div className="mb-7 flex w-fit max-w-full gap-2 rounded-[30px] bg-[#21172e] p-[5px]">
          <button
            type="button"
            onClick={() => setTicketType("transaction")}
            className={`cursor-pointer rounded-[25px] border-0 px-[18px] py-[11px] text-[13px] transition ${
              ticketType === "transaction"
                ? "bg-[#8050d5] text-white"
                : "bg-transparent text-[#c9bdd8] hover:text-white"
            }`}
          >
            ▣ Tiket Transaksi
          </button>

          <button
            type="button"
            onClick={() => setTicketType("personal")}
            className={`cursor-pointer rounded-[25px] border-0 px-[18px] py-[11px] text-[13px] transition ${
              ticketType === "personal"
                ? "bg-[#8050d5] text-white"
                : "bg-transparent text-[#c9bdd8] hover:text-white"
            }`}
          >
            ♙ Tiket Personal
          </button>
        </div>

        {/* EVENT MENDATANG / BERAKHIR */}
        <div className="mb-6 flex gap-6 border-b border-[#382a49]">
          <button
            type="button"
            onClick={() => setEventStatus("upcoming")}
            className={`cursor-pointer border-0 border-b-2 bg-transparent px-3 pb-[13px] text-sm transition ${
              eventStatus === "upcoming"
                ? "border-[#ad7aff] text-white"
                : "border-transparent text-[#b9abc9] hover:text-white"
            }`}
          >
            Event Mendatang
          </button>

          <button
            type="button"
            onClick={() => setEventStatus("ended")}
            className={`cursor-pointer border-0 border-b-2 bg-transparent px-3 pb-[13px] text-sm transition ${
              eventStatus === "ended"
                ? "border-[#ad7aff] text-white"
                : "border-transparent text-[#b9abc9] hover:text-white"
            }`}
          >
            Event Berakhir
          </button>
        </div>

        {/* DAFTAR TIKET */}
        {filteredTickets.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[13px] bg-[#21172e] p-[30px] text-center">
            <div className="text-[45px] text-[#b77aff]">♫</div>

            <h3 className="mt-3 mb-[7px] font-heading text-lg font-bold">
              {tickets.length === 0
                ? "Belum Ada Tiket"
                : eventStatus === "upcoming"
                  ? "Belum Ada Event Mendatang"
                  : "Belum Ada Event Berakhir"}
            </h3>

            <p className="max-w-[390px] text-[13px] leading-[1.6] text-[#b9abc9]">
              {tickets.length === 0
                ? "Tiket akan muncul otomatis setelah pembayaran pesananmu berhasil."
                : "Tiket untuk kategori ini belum tersedia."}
            </p>

            <Link
              href="/concerts"
              className="mt-[18px] rounded-[9px] bg-[#8050d5] px-[19px] py-[11px] text-[13px] font-medium text-white hover:bg-[#7040c5]"
            >
              Jelajahi Konser
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-[17px]">
            {filteredTickets.map((order, index) => {
              const info = getTicketInfo(order);
              const code = getTicketCode(order);
              const checkedIn = order.checkInStatus === "checked_in";

              return (
                <article
                  className="grid grid-cols-[minmax(0,1fr)_190px] overflow-hidden rounded-[14px] border border-[#382a49] bg-[#21172e] max-[700px]:grid-cols-1"
                  key={`${order.id || code}-${index}`}
                >
                  <div className="flex min-w-0 gap-[18px] p-[19px] max-[700px]:flex-col">
                    <div className="grid h-[165px] w-[125px] shrink-0 place-items-center overflow-hidden rounded-[9px] bg-[#302340] text-[40px] text-[#c69bff] max-[700px]:h-[180px] max-[700px]:w-full">
                      {info.image ? (
                        <img
                          src={info.image}
                          alt={info.title}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span>♫</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-[11px] flex flex-wrap gap-[7px]">
                        <span className="rounded-[20px] bg-[#244534] px-[9px] py-1.5 text-[10px] font-bold text-[#a4edc0]">
                          ✓ Pembayaran Berhasil
                        </span>

                        <span
                          className={`rounded-[20px] px-[9px] py-1.5 text-[10px] font-bold ${
                            checkedIn
                              ? "bg-[#244534] text-[#a4edc0]"
                              : "bg-[#50391d] text-[#ffd38c]"
                          }`}
                        >
                          {getStatus(order)}
                        </span>
                      </div>

                      <h3 className="m-0 font-heading text-lg font-bold">
                        {info.title}
                      </h3>

                      <p className="mt-1.5 text-xs text-[#b9abc9]">
                        {info.artist}
                      </p>

                      <div className="my-[18px] grid grid-cols-2 gap-[15px]">
                        <div>
                          <span className="mb-[5px] block text-[10px] text-[#a99ab7]">
                            Tanggal
                          </span>
                          <strong className="block text-xs [overflow-wrap:anywhere]">
                            {info.date}
                          </strong>
                        </div>

                        <div>
                          <span className="mb-[5px] block text-[10px] text-[#a99ab7]">
                            Lokasi
                          </span>
                          <strong className="block text-xs [overflow-wrap:anywhere]">
                            {info.location}
                          </strong>
                        </div>

                        <div>
                          <span className="mb-[5px] block text-[10px] text-[#a99ab7]">
                            Kategori Tiket
                          </span>
                          <strong className="block text-xs [overflow-wrap:anywhere]">
                            {order.ticketName || "-"}
                          </strong>
                        </div>

                        <div>
                          <span className="mb-[5px] block text-[10px] text-[#a99ab7]">
                            Jumlah Tiket
                          </span>
                          <strong className="block text-xs [overflow-wrap:anywhere]">
                            {getQuantity(order)} tiket
                          </strong>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-[#59436f] pt-3">
                        <span className="mb-[5px] block text-[9px] tracking-[1px] text-[#a99ab7]">
                          KODE E-TIKET
                        </span>
                        <strong className="block text-xs [overflow-wrap:anywhere] text-[#d0a4ff]">
                          {code}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => openTicket(order)}
                        className="mt-[13px] cursor-pointer rounded-lg border border-[#8051b5] bg-[#39224f] px-[13px] py-2.5 text-xs text-white transition hover:bg-[#4c2d69]"
                      >
                        Lihat Detail E-Ticket →
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center border-l border-dashed border-[#59436f] p-[15px] text-center max-[700px]:border-t max-[700px]:border-l-0">
                    <div className="rounded-lg bg-white p-2">
                      <QRCodeCanvas
                        value={code}
                        size={135}
                        level="H"
                        includeMargin
                      />
                    </div>

                    <strong className="mt-3 text-xs">QR Code Tiket</strong>

                    <p className="mt-1.5 max-w-[150px] text-[10px] leading-normal text-[#b9abc9]">
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
          className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-[#05030ce0] px-[15px] py-[25px] backdrop-blur-[7px] print:static print:block print:bg-white print:p-0"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="m-auto w-full max-w-[700px] rounded-2xl border border-[#49365b] bg-[#171025] p-[22px] text-white print:max-w-full print:border-0 print:shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-[18px] flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-[2px] text-[#bd91ff]">
                  ENCORE DIGITAL TICKET
                </span>
                <h2 className="mt-[7px] font-heading text-xl font-bold">
                  Detail E-Ticket
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="size-9 cursor-pointer rounded-full border border-[#49365b] bg-[#261936] text-[22px] text-white hover:bg-[#38254f] print:hidden"
              >
                ×
              </button>
            </div>

            {(() => {
              const info = getTicketInfo(selectedTicket);
              const code = getTicketCode(selectedTicket);

              return (
                <>
                  <div className="relative flex min-h-[190px] items-end overflow-hidden rounded-[10px] bg-[#302340]">
                    {info.image && (
                      <img
                        src={info.image}
                        alt={info.title}
                        className="absolute inset-0 size-full object-cover opacity-40"
                      />
                    )}

                    <div className="relative p-[22px]">
                      <span className="text-[10px] tracking-[2px] text-[#d4b5ff]">
                        LIVE MUSIC EXPERIENCE
                      </span>
                      <h2 className="mt-1 font-heading text-xl font-bold">
                        {info.title}
                      </h2>
                      <p className="text-sm text-[#e2d8f0]">{info.artist}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-[18px] py-[23px]">
                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Nama Pemesan
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {selectedTicket.buyerName || user.name || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Email
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {selectedTicket.buyerEmail || user.email || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Nomor HP
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {selectedTicket.buyerPhone || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Tanggal Konser
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {info.date}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Lokasi
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {info.location}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Kategori Tiket
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {selectedTicket.ticketName || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Jumlah Tiket
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {getQuantity(selectedTicket)} tiket
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Harga Tiket
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {formatPrice(selectedTicket.ticketPrice)}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Total Pembayaran
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {formatPrice(getTotal(selectedTicket))}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Metode Pembayaran
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {selectedTicket.paymentMethod || "-"}
                      </strong>
                    </div>

                    <div>
                      <span className="mb-1.5 block text-[10px] text-[#a99ab7]">
                        Status Check-in
                      </span>
                      <strong className="block text-xs [overflow-wrap:anywhere]">
                        {getStatus(selectedTicket)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2.5 rounded-[10px] bg-white p-5 text-center text-[#24162f]">
                    <QRCodeCanvas
                      value={code}
                      size={180}
                      level="H"
                      includeMargin
                    />

                    <strong className="[overflow-wrap:anywhere]">{code}</strong>

                    <p className="text-[11px]">
                      Tunjukkan QR Code ini kepada petugas konser.
                    </p>
                  </div>
                </>
              );
            })()}

            <div className="mt-[18px] flex justify-end gap-2.5 max-[700px]:flex-col print:hidden">
              <button
                type="button"
                onClick={printTicket}
                className="cursor-pointer rounded-lg border-0 bg-[#8050d5] px-4 py-[11px] text-white hover:bg-[#7040c5] max-[700px]:w-full"
              >
                Cetak / Simpan E-Ticket
              </button>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="cursor-pointer rounded-lg border border-[#49365b] bg-transparent px-4 py-[11px] text-white hover:bg-[#261936] max-[700px]:w-full"
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