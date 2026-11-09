
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerts, formatPrice } from "../../../data/concerts";

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

      setCustomEvents(
        Array.isArray(savedEvents) ? savedEvents : []
      );
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

    if (
      Number(form.price) <= 0 ||
      Number(form.capacity) <= 0
    ) {
      setMessage("Harga dan kapasitas harus lebih dari 0.");
      return;
    }

    const newEvent = {
      id: `custom-${Date.now()}`,
      title: form.title.trim(),
      artist: form.artist.trim(),
      date: new Date(form.date + "T00:00:00").toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ),
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
      (total, order) =>
        total + Number(order.ticketQuantity || 0),
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
    (total, order) =>
      total + Number(order.ticketQuantity || 0),
    0
  );

  const totalEvents = concerts.length + myEvents.length;

  return (
    <main className="events-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">ENCORE ORGANIZER</span>
          <h1>Manajemen Event</h1>
          <p>Kelola event dan pantau performa penjualan tiket.</p>
        </div>

        <div className="header-actions">
          <Link href="/organizer/dashboard" className="back-button">
            ← Dashboard
          </Link>

          <Link href="/organizer/checkin" className="scan-button">
            Scan Tiket →
          </Link>
        </div>
      </header>

      <section className="event-summary">
        <div className="summary-card">
          <span>Total Event</span>
          <strong>{totalEvents}</strong>
        </div>

        <div className="summary-card">
          <span>Total Tiket Terjual</span>
          <strong>{totalTickets}</strong>
        </div>

        <div className="summary-card">
          <span>Total Transaksi</span>
          <strong>{orders.length}</strong>
        </div>
      </section>

      <section className="create-section">
        <div className="create-heading">
          <div>
            <h2>Buat Event Baru</h2>
            <p>Tambahkan konser yang akan kamu selenggarakan.</p>
          </div>

          <button
            className="create-button"
            onClick={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
          >
            {showForm ? "Tutup Form" : "+ Tambah Event"}
          </button>
        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {showForm && (
          <form className="event-form" onSubmit={handleCreateEvent}>
            <div className="form-grid">
              <div className="form-field">
                <label>Nama Konser *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="Contoh: ENCORE Music Festival"
                  required
                />
              </div>

              <div className="form-field">
                <label>Artis / Pengisi Acara *</label>
                <input
                  name="artist"
                  value={form.artist}
                  onChange={updateForm}
                  placeholder="Nama artis"
                  required
                />
              </div>

              <div className="form-field">
                <label>Tanggal Acara *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateForm}
                  required
                />
              </div>

              <div className="form-field">
                <label>Kategori Event *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={updateForm}
                >
                  <option value="Konser">Konser</option>
                  <option value="Festival">Festival</option>
                  <option value="Music Show">Music Show</option>
                  <option value="Special Event">Special Event</option>
                </select>
              </div>

              <div className="form-field">
                <label>Kota *</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={updateForm}
                  placeholder="Contoh: Jakarta"
                  required
                />
              </div>

              <div className="form-field">
                <label>Venue *</label>
                <input
                  name="venue"
                  value={form.venue}
                  onChange={updateForm}
                  placeholder="Nama tempat acara"
                  required
                />
              </div>

              <div className="form-field">
                <label>Harga Tiket (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={updateForm}
                  placeholder="Contoh: 250000"
                  min="1"
                  required
                />
              </div>

              <div className="form-field">
                <label>Kapasitas Tiket *</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={updateForm}
                  placeholder="Contoh: 1000"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Deskripsi Event</label>
              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Ceritakan informasi tentang event..."
                rows="4"
              />
            </div>

            <button type="submit" className="submit-button">
              Simpan Event
            </button>
          </form>
        )}
      </section>

      <section className="event-section">
        <div className="section-heading">
          <div>
            <h2>Event Saya</h2>
            <p>Event yang dibuat oleh akun Organizer ini.</p>
          </div>

          <span className="event-count">
            {myEvents.length} Event
          </span>
        </div>

        {myEvents.length === 0 ? (
          <div className="empty">
            Belum ada event yang kamu buat. Klik Tambah Event untuk memulai.
          </div>
        ) : (
          <div className="event-grid">
            {myEvents.map((event) => {
              const stats = getEventStats(event);

              return (
                <article className="event-card" key={event.id}>
                  <div className="custom-event-banner">
                    <span>{event.category}</span>
                    <strong>{event.title}</strong>
                  </div>

                  <div className="event-information">
                    <p className="artist">{event.artist}</p>

                    <div className="event-details">
                      <p>📅 {event.date}</p>
                      <p>📍 {event.venue}, {event.location}</p>
                      <p>🎟️ Kapasitas: {event.capacity} tiket</p>
                      <p>🏢 {event.organizer}</p>
                    </div>

                    <div className="event-price">
                      Harga tiket mulai dari
                      <strong>{formatPrice(event.price)}</strong>
                    </div>

                    <div className="sales-information">
                      <div>
                        <span>Pesanan</span>
                        <strong>{stats.orders}</strong>
                      </div>

                      <div>
                        <span>Tiket Terjual</span>
                        <strong>{stats.ticketsSold}</strong>
                      </div>

                      <div>
                        <span>Pendapatan</span>
                        <strong>{formatPrice(stats.revenue)}</strong>
                      </div>
                    </div>

                    <span className="event-status">Event Aktif</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="event-section">
        <div className="section-heading">
          <div>
            <h2>Katalog Event ENCORE</h2>
            <p>Daftar event bawaan yang tersedia di platform.</p>
          </div>

          <span className="event-count">
            {concerts.length} Event
          </span>
        </div>

        <div className="event-grid">
          {concerts.map((concert) => {
            const stats = getEventStats(concert);

            return (
              <article className="event-card" key={concert.id}>
                <div className="event-image">
                  <img src={concert.image} alt={concert.title} />

                  <span className="event-category">
                    {concert.category || "Konser"}
                  </span>
                </div>

                <div className="event-information">
                  <h3>{concert.title}</h3>
                  <p className="artist">{concert.artist}</p>

                  <div className="event-details">
                    <p>📅 {concert.date}</p>
                    <p>📍 {concert.venue || concert.location}</p>
                    <p>🏢 {concert.organizer || "Penyelenggara belum dicantumkan"}</p>
                  </div>

                  <div className="event-price">
                    Harga tiket mulai dari
                    <strong>{formatPrice(concert.price)}</strong>
                  </div>

                  <div className="sales-information">
                    <div>
                      <span>Pesanan</span>
                      <strong>{stats.orders}</strong>
                    </div>

                    <div>
                      <span>Tiket Terjual</span>
                      <strong>{stats.ticketsSold}</strong>
                    </div>

                    <div>
                      <span>Pendapatan</span>
                      <strong>{formatPrice(stats.revenue)}</strong>
                    </div>
                  </div>

                  <Link
                    href={`/concerts/${concert.id}`}
                    className="detail-button"
                  >
                    Lihat Detail Event →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .events-page {
          min-height: 100vh;
          padding: 40px;
          background: #10091b;
          color: #fff;
          font-family: Arial, sans-serif;
        }

        .page-header,
        .create-heading,
        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .page-header {
          margin-bottom: 35px;
        }

        .eyebrow {
          color: #bd83ff;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .page-header h1 {
          margin: 12px 0;
          font-size: 32px;
        }

        .page-header p,
        .section-heading p,
        .create-heading p {
          color: #b9a9d0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .back-button,
        .scan-button {
          padding: 12px 18px;
          border-radius: 9px;
          color: white;
          text-decoration: none;
          font-size: 13px;
          font-weight: bold;
        }

        .back-button {
          background: #281b39;
          border: 1px solid #49316d;
        }

        .scan-button,
        .create-button,
        .submit-button {
          background: #a766e8;
          color: white;
        }

        .scan-button {
          text-decoration: none;
          padding: 12px 18px;
          border-radius: 9px;
        }

        .event-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }

        .summary-card,
        .create-section,
        .event-card {
          background: #1c1229;
          border: 1px solid #39274b;
          border-radius: 15px;
        }

        .summary-card {
          padding: 24px;
        }

        .summary-card span {
          display: block;
          color: #b9a9d0;
          font-size: 13px;
        }

        .summary-card strong {
          display: block;
          margin-top: 12px;
          color: #c58aff;
          font-size: 29px;
        }

        .create-section {
          padding: 25px;
          margin-bottom: 38px;
        }

        .create-heading h2,
        .section-heading h2 {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .create-button,
        .submit-button {
          border: 0;
          padding: 13px 19px;
          border-radius: 9px;
          font-weight: bold;
          cursor: pointer;
        }

        .message {
          padding: 13px;
          margin-top: 20px;
          border-radius: 9px;
          background: #183d30;
          color: #65e5a4;
          font-size: 13px;
        }

        .event-form {
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid #39274b;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 17px;
        }

        .form-field label {
          color: #d4aaff;
          font-size: 13px;
          font-weight: bold;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 13px;
          border: 1px solid #49345f;
          border-radius: 8px;
          background: #130c20;
          color: white;
          font: inherit;
          font-size: 13px;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: 1px solid #a766e8;
        }

        .form-field input::placeholder,
        .form-field textarea::placeholder {
          color: #897a9d;
        }

        .submit-button {
          margin-top: 5px;
        }

        .event-section {
          margin-bottom: 40px;
        }

        .section-heading {
          margin-bottom: 22px;
        }

        .event-count {
          padding: 8px 14px;
          border-radius: 20px;
          background: #291a3b;
          color: #d4aaff;
          font-size: 12px;
          white-space: nowrap;
        }

        .event-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .event-card {
          overflow: hidden;
        }

        .event-image {
          position: relative;
          height: 190px;
          background: #251832;
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-category {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 7px 12px;
          border-radius: 20px;
          background: #10091be8;
          color: #d4aaff;
          font-size: 11px;
        }

        .custom-event-banner {
          min-height: 190px;
          padding: 25px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 12px;
          background: linear-gradient(135deg, #51316e, #1c1229);
        }

        .custom-event-banner span {
          color: #e3c8ff;
          font-size: 12px;
        }

        .custom-event-banner strong {
          font-size: 25px;
          overflow-wrap: anywhere;
        }

        .event-information {
          padding: 22px;
        }

        .event-information h3 {
          margin: 0;
          font-size: 19px;
        }

        .artist {
          margin: 8px 0 18px;
          color: #bd83ff;
          font-size: 13px;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 15px 0;
          border-top: 1px solid #39274b;
          border-bottom: 1px solid #39274b;
        }

        .event-details p {
          margin: 0;
          color: #c9bed8;
          font-size: 12px;
        }

        .event-price {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-top: 18px;
          color: #b9a9d0;
          font-size: 11px;
        }

        .event-price strong {
          color: #d4aaff;
          font-size: 17px;
        }

        .sales-information {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
          padding: 15px 10px;
          border-radius: 10px;
          background: #130c20;
        }

        .sales-information div {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .sales-information span {
          color: #b9a9d0;
          font-size: 10px;
        }

        .sales-information strong {
          color: #c58aff;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .event-status {
          display: inline-block;
          margin-top: 18px;
          padding: 7px 12px;
          border-radius: 20px;
          background: #183d30;
          color: #65e5a4;
          font-size: 11px;
        }

        .detail-button {
          display: block;
          margin-top: 18px;
          padding: 13px;
          border: 1px solid #7544a6;
          border-radius: 9px;
          color: #d4aaff;
          text-align: center;
          text-decoration: none;
          font-size: 12px;
          font-weight: bold;
        }

        .empty {
          padding: 35px;
          text-align: center;
          color: #b9a9d0;
          background: #1c1229;
          border: 1px solid #39274b;
          border-radius: 12px;
        }

        @media (max-width: 850px) {
          .event-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .events-page {
            padding: 22px;
          }

          .page-header,
          .create-heading,
          .section-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .event-summary,
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
