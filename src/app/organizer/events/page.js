"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerts, formatPrice } from "../../../data/concerts";

const inputClass =
  "w-full rounded-lg border border-[#49345f] bg-[#130c20] p-[13px] text-[13px] text-white placeholder:text-[#897a9d] focus:outline-1 focus:outline-[#a766e8]";

export default function OrganizerEventsPage() {
  const [orders, setOrders] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    artist: "",
    date: "",
    location: "",
    venue: "",
    category: "Konser",
    price: "",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      setCurrentUser(user);

      const savedOrders = JSON.parse(
        localStorage.getItem("encoreOrders") || "[]"
      );

      const savedEvents = JSON.parse(
        localStorage.getItem("encoreCustomConcerts") || "[]"
      );

      setOrders(
        Array.isArray(savedOrders)
          ? savedOrders.filter((order) => order.status === "paid")
          : []
      );

      setCustomEvents(Array.isArray(savedEvents) ? savedEvents : []);
    } catch (error) {
      console.error("Gagal membaca data:", error);
    }
  }, []);

  const myEvents = customEvents.filter(
    (event) => event.organizerId === currentUser?.id
  );

  const updateForm = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    setMessage("");

    if (!currentUser || currentUser.role !== "organizer") {
      setMessage("Hanya akun Organizer yang dapat membuat event.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.artist.trim() ||
      !form.date ||
      !form.location.trim() ||
      !form.venue.trim() ||
      !form.price ||
      !form.capacity
    ) {
      setMessage("Mohon lengkapi semua kolom wajib.");
      return;
    }

    if (Number(form.price) <= 0 || Number(form.capacity) <= 0) {
      setMessage("Harga dan kapasitas harus lebih dari 0.");
      return;
    }

    const newEvent = {
      id: `custom-${Date.now()}`,
      title: form.title.trim(),
      artist: form.artist.trim(),
      date: new Date(form.date + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      dateISO: form.date,
      location: form.location.trim(),
      venue: form.venue.trim(),
      category: form.category,
      price: Number(form.price),
      capacity: Number(form.capacity),
      description: form.description.trim(),
      image: "",
      organizer: currentUser.organization || currentUser.name,
      organizerId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    const updatedEvents = [...customEvents, newEvent];

    localStorage.setItem(
      "encoreCustomConcerts",
      JSON.stringify(updatedEvents)
    );

    setCustomEvents(updatedEvents);

    setForm({
      title: "",
      artist: "",
      date: "",
      location: "",
      venue: "",
      category: "Konser",
      price: "",
      capacity: "",
      description: "",
    });

    setShowForm(false);
    setMessage("Event berhasil dibuat dan disimpan!");
  };

  const getEventStats = (event) => {
    const eventOrders = orders.filter(
      (order) => order.concertTitle === event.title
    );

    const ticketsSold = eventOrders.reduce(
      (total, order) => total + Number(order.ticketQuantity || 0),
      0
    );

    const revenue = eventOrders.reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

    return {
      orders: eventOrders.length,
      ticketsSold,
      revenue,
    };
  };

  const totalTickets = orders.reduce(
    (total, order) => total + Number(order.ticketQuantity || 0),
    0
  );

  const totalEvents = concerts.length + myEvents.length;

  return (
    <main className="box-border min-h-screen bg-[#10091b] p-10 text-white max-[650px]:p-[22px]">
      <header className="mb-[35px] flex items-center justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start">
        <div>
          <span className="text-xs font-bold tracking-[2px] text-[#bd83ff]">
            ENCORE ORGANIZER
          </span>
          <h1 className="my-3 font-heading text-[32px] font-bold">
            Manajemen Event
          </h1>
          <p className="text-sm text-[#b9a9d0]">
            Kelola event dan pantau performa penjualan tiket.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/organizer/dashboard"
            className="rounded-[9px] border border-[#49316d] bg-[#281b39] px-[18px] py-3 text-[13px] font-bold text-white"
          >
            ← Dashboard
          </Link>

          <Link
            href="/organizer/checkin"
            className="rounded-[9px] bg-[#a766e8] px-[18px] py-3 text-[13px] font-bold text-white"
          >
            Scan Tiket →
          </Link>
        </div>
      </header>

      <section className="mb-[30px] grid grid-cols-3 gap-[18px] max-[650px]:grid-cols-1">
        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">Total Event</span>
          <strong className="mt-3 block text-[29px] text-[#c58aff]">
            {totalEvents}
          </strong>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">
            Total Tiket Terjual
          </span>
          <strong className="mt-3 block text-[29px] text-[#c58aff]">
            {totalTickets}
          </strong>
        </div>

        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">
            Total Transaksi
          </span>
          <strong className="mt-3 block text-[29px] text-[#c58aff]">
            {orders.length}
          </strong>
        </div>
      </section>

      <section className="mb-[38px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
        <div className="flex items-center justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start">
          <div>
            <h2 className="m-0 mb-2 font-heading text-[22px] font-bold">
              Buat Event Baru
            </h2>
            <p className="text-sm text-[#b9a9d0]">
              Tambahkan konser yang akan kamu selenggarakan.
            </p>
          </div>

          <button
            type="button"
            className="cursor-pointer rounded-[9px] border-0 bg-[#a766e8] px-[19px] py-[13px] font-bold text-white"
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
          >
            {showForm ? "Tutup Form" : "+ Tambah Event"}
          </button>
        </div>

        {message && (
          <div className="mt-5 rounded-[9px] bg-[#183d30] p-[13px] text-[13px] text-[#65e5a4]">
            {message}
          </div>
        )}

        {showForm && (
          <form
            className="mt-[25px] border-t border-[#39274b] pt-[25px]"
            onSubmit={handleCreateEvent}
          >
            <div className="mb-[18px] grid grid-cols-2 gap-[18px] max-[650px]:grid-cols-1">
              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Nama Konser *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="Contoh: ENCORE Music Festival"
                  required
                  className={inputClass}
                />
              </div>

              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Artis / Pengisi Acara *
                </label>
                <input
                  name="artist"
                  value={form.artist}
                  onChange={updateForm}
                  placeholder="Nama artis"
                  required
                  className={inputClass}
                />
              </div>

              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Tanggal Acara *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateForm}
                  required
                  className={inputClass}
                />
              </div>

              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Kategori Event *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={updateForm}
                  className={inputClass}
                >
                  <option value="Konser">Konser</option>
                  <option value="Festival">Festival</option>
                  <option value="Music Show">Music Show</option>
                  <option value="Special Event">Special Event</option>
                </select>
              </div>

              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Kota *
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={updateForm}
                  placeholder="Contoh: Jakarta"
                  required
                  className={inputClass}
                />
              </div>

              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Venue *
                </label>
                <input
                  name="venue"
                  value={form.venue}
                  onChange={updateForm}
                  placeholder="Nama tempat acara"
                  required
                  className={inputClass}
                />
              </div>

              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Harga Tiket (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={updateForm}
                  placeholder="Contoh: 250000"
                  min="1"
                  required
                  className={inputClass}
                />
              </div>

              <div className="mb-[17px] flex flex-col gap-[9px]">
                <label className="text-[13px] font-bold text-[#d4aaff]">
                  Kapasitas Tiket *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={updateForm}
                  placeholder="Contoh: 1000"
                  min="1"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-[17px] flex flex-col gap-[9px]">
              <label className="text-[13px] font-bold text-[#d4aaff]">
                Deskripsi Event
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Ceritakan informasi tentang event..."
                rows="4"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="mt-[5px] cursor-pointer rounded-[9px] border-0 bg-[#a766e8] px-[19px] py-[13px] font-bold text-white"
            >
              Simpan Event
            </button>
          </form>
        )}
      </section>

      <section className="mb-10">
        <div className="mb-[22px] flex items-center justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start">
          <div>
            <h2 className="m-0 mb-2 font-heading text-[22px] font-bold">
              Event Saya
            </h2>
            <p className="text-sm text-[#b9a9d0]">
              Event yang dibuat oleh akun Organizer ini.
            </p>
          </div>

          <span className="rounded-[20px] bg-[#291a3b] px-3.5 py-2 text-xs whitespace-nowrap text-[#d4aaff]">
            {myEvents.length} Event
          </span>
        </div>

        {myEvents.length === 0 ? (
          <div className="rounded-xl border border-[#39274b] bg-[#1c1229] p-[35px] text-center text-[#b9a9d0]">
            Belum ada event yang kamu buat. Klik Tambah Event untuk memulai.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[22px] max-[850px]:grid-cols-1">
            {myEvents.map((event) => {
              const stats = getEventStats(event);

              return (
                <article
                  className="overflow-hidden rounded-[15px] border border-[#39274b] bg-[#1c1229]"
                  key={event.id}
                >
                  <div className="flex min-h-[190px] flex-col justify-end gap-3 bg-[linear-gradient(135deg,#51316e,#1c1229)] p-[25px]">
                    <span className="text-xs text-[#e3c8ff]">
                      {event.category}
                    </span>
                    <strong className="text-[25px] [overflow-wrap:anywhere]">
                      {event.title}
                    </strong>
                  </div>

                  <div className="p-[22px]">
                    <p className="mt-2 mb-[18px] text-[13px] text-[#bd83ff]">
                      {event.artist}
                    </p>

                    <div className="flex flex-col gap-2.5 border-y border-[#39274b] py-[15px]">
                      <p className="m-0 text-xs text-[#c9bed8]">
                        📅 {event.date}
                      </p>
                      <p className="m-0 text-xs text-[#c9bed8]">
                        📍 {event.venue}, {event.location}
                      </p>
                      <p className="m-0 text-xs text-[#c9bed8]">
                        🎟️ Kapasitas: {event.capacity} tiket
                      </p>
                      <p className="m-0 text-xs text-[#c9bed8]">
                        🏢 {event.organizer}
                      </p>
                    </div>

                    <div className="mt-[18px] flex flex-col gap-[7px] text-[11px] text-[#b9a9d0]">
                      Harga tiket mulai dari
                      <strong className="text-[17px] text-[#d4aaff]">
                        {formatPrice(event.price)}
                      </strong>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2.5 rounded-[10px] bg-[#130c20] px-2.5 py-[15px]">
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="text-[10px] text-[#b9a9d0]">
                          Pesanan
                        </span>
                        <strong className="text-[13px] [overflow-wrap:anywhere] text-[#c58aff]">
                          {stats.orders}
                        </strong>
                      </div>

                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="text-[10px] text-[#b9a9d0]">
                          Tiket Terjual
                        </span>
                        <strong className="text-[13px] [overflow-wrap:anywhere] text-[#c58aff]">
                          {stats.ticketsSold}
                        </strong>
                      </div>

                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="text-[10px] text-[#b9a9d0]">
                          Pendapatan
                        </span>
                        <strong className="text-[13px] [overflow-wrap:anywhere] text-[#c58aff]">
                          {formatPrice(stats.revenue)}
                        </strong>
                      </div>
                    </div>

                    <span className="mt-[18px] inline-block rounded-[20px] bg-[#183d30] px-3 py-[7px] text-[11px] text-[#65e5a4]">
                      Event Aktif
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-10">
        <div className="mb-[22px] flex items-center justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start">
          <div>
            <h2 className="m-0 mb-2 font-heading text-[22px] font-bold">
              Katalog Event ENCORE
            </h2>
            <p className="text-sm text-[#b9a9d0]">
              Daftar event bawaan yang tersedia di platform.
            </p>
          </div>

          <span className="rounded-[20px] bg-[#291a3b] px-3.5 py-2 text-xs whitespace-nowrap text-[#d4aaff]">
            {concerts.length} Event
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[22px] max-[850px]:grid-cols-1">
          {concerts.map((concert) => {
            const stats = getEventStats(concert);

            return (
              <article
                className="overflow-hidden rounded-[15px] border border-[#39274b] bg-[#1c1229]"
                key={concert.id}
              >
                <div className="relative h-[190px] bg-[#251832]">
                  <img
                    src={concert.image}
                    alt={concert.title}
                    className="size-full object-cover"
                  />

                  <span className="absolute top-3.5 left-3.5 rounded-[20px] bg-[#10091be8] px-3 py-[7px] text-[11px] text-[#d4aaff]">
                    {concert.category || "Konser"}
                  </span>
                </div>

                <div className="p-[22px]">
                  <h3 className="m-0 font-heading text-[19px]">
                    {concert.title}
                  </h3>
                  <p className="mt-2 mb-[18px] text-[13px] text-[#bd83ff]">
                    {concert.artist}
                  </p>

                  <div className="flex flex-col gap-2.5 border-y border-[#39274b] py-[15px]">
                    <p className="m-0 text-xs text-[#c9bed8]">
                      📅 {concert.date}
                    </p>
                    <p className="m-0 text-xs text-[#c9bed8]">
                      📍 {concert.venue || concert.location}
                    </p>
                    <p className="m-0 text-xs text-[#c9bed8]">
                      🏢{" "}
                      {concert.organizer ||
                        "Penyelenggara belum dicantumkan"}
                    </p>
                  </div>

                  <div className="mt-[18px] flex flex-col gap-[7px] text-[11px] text-[#b9a9d0]">
                    Harga tiket mulai dari
                    <strong className="text-[17px] text-[#d4aaff]">
                      {formatPrice(concert.price)}
                    </strong>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2.5 rounded-[10px] bg-[#130c20] px-2.5 py-[15px]">
                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="text-[10px] text-[#b9a9d0]">
                        Pesanan
                      </span>
                      <strong className="text-[13px] [overflow-wrap:anywhere] text-[#c58aff]">
                        {stats.orders}
                      </strong>
                    </div>

                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="text-[10px] text-[#b9a9d0]">
                        Tiket Terjual
                      </span>
                      <strong className="text-[13px] [overflow-wrap:anywhere] text-[#c58aff]">
                        {stats.ticketsSold}
                      </strong>
                    </div>

                    <div className="flex min-w-0 flex-col gap-2">
                      <span className="text-[10px] text-[#b9a9d0]">
                        Pendapatan
                      </span>
                      <strong className="text-[13px] [overflow-wrap:anywhere] text-[#c58aff]">
                        {formatPrice(stats.revenue)}
                      </strong>
                    </div>
                  </div>

                  <Link
                    href={`/concerts/${concert.id}`}
                    className="mt-[18px] block rounded-[9px] border border-[#7544a6] p-[13px] text-center text-xs font-bold text-[#d4aaff] transition hover:bg-[#7544a6] hover:text-white"
                  >
                    Lihat Detail Event →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}