"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "../../../lib/format";
import { supabase } from "../../../lib/supabase";

const inputClass =
  "w-full rounded-lg border border-[#49345f] bg-[#130c20] p-[13px] text-[13px] text-white placeholder:text-[#897a9d] focus:outline-1 focus:outline-[#a766e8]";

const initialForm = {
  title: "",
  artist: "",
  date: "",
  time: "",
  location: "",
  venue: "",
  category: "Konser",
  description: "",
  terms_and_conditions: "",
};

const initialTicket = {
  name: "Regular",
  description: "General Admission",
  price: "",
  quota: "",
  color: "#A766E8",
  benefits: "",
};

export default function OrganizerEventsPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [paidTickets, setPaidTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [ticketCategories, setTicketCategories] = useState([
    { ...initialTicket },
  ]);

  const [posterFile, setPosterFile] = useState(null);
  const [seatingPlanFile, setSeatingPlanFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [seatingPlanPreview, setSeatingPlanPreview] = useState("");

  // Mengambil event milik organizer
  const fetchOrganizerEvents = async (userId) => {
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(`
        *,
        ticket_types (
          id,
          name,
          price,
          quota,
          description,
          color,
          benefits
        )
      `)
      .eq("organizer_id", userId)
      .order("created_at", { ascending: false });

    if (eventsError) {
      console.error("Gagal mengambil data event:", eventsError);
      throw eventsError;
    }

    const formattedEvents = (eventsData || []).map((ev) => {
      const ticketsList = Array.isArray(ev.ticket_types)
        ? ev.ticket_types
        : [];

      const minPrice =
        ticketsList.length > 0
          ? Math.min(...ticketsList.map((t) => Number(t.price || 0)))
          : 0;

      const totalQuota = ticketsList.reduce(
        (sum, t) => sum + Number(t.quota || 0),
        0
      );

      return { ...ev, minPrice, totalQuota };
    });

    setMyEvents(formattedEvents);

    if (formattedEvents.length > 0) {
      const eventIds = formattedEvents.map((e) => e.id);

      const { data: ticketsData, error: ticketsError } = await supabase
        .from("tickets")
        .select(`
          id,
          event_id,
          order_id,
          orders (
            id,
            total,
            payment_status
          )
        `)
        .in("event_id", eventIds);

      if (ticketsError) throw ticketsError;

      setPaidTickets(
        (ticketsData || []).filter(
          (t) => t.orders?.payment_status === "paid"
        )
      );
    } else {
      setPaidTickets([]);
    }
  };

  // Memeriksa login dan role organizer
  useEffect(() => {
    let active = true;

    const initPage = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile || profile.role !== "organizer") {
          router.replace("/login");
          return;
        }

        if (!active) return;

        setCurrentUser(profile);
        await fetchOrganizerEvents(user.id);
      } catch (error) {
        console.error("Gagal memuat halaman:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    initPage();

    return () => {
      active = false;
    };
  }, [router]);

  const updateForm = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addTicketCategory = () => {
    setTicketCategories((items) => [
      ...items,
      {
        name: "",
        description: "",
        price: "",
        quota: "",
        color: "#A766E8",
        benefits: "",
      },
    ]);
  };

  const updateTicketCategory = (index, field, value) => {
    setTicketCategories((items) =>
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const resetForm = () => {
    setForm(initialForm);
    setTicketCategories([{ ...initialTicket }]);
    setPosterFile(null);
    setSeatingPlanFile(null);
    setPosterPreview("");
    setSeatingPlanPreview("");
    setEditingEvent(null);
    setShowForm(false);
  };

  // Upload gambar ke Supabase Storage
  const uploadEventImage = async (file, prefix) => {
    if (!file) return null;

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const path = `${currentUser.id}/${Date.now()}-${prefix}-${safeName}`;

    const { error } = await supabase.storage
      .from("event-assets")
      .upload(path, file);

    if (error) throw error;

    return supabase.storage
      .from("event-assets")
      .getPublicUrl(path).data.publicUrl;
  };

  // Validasi form
  const validateForm = () => {
    if (
      !form.title.trim() ||
      !form.artist.trim() ||
      !form.date ||
      !form.time ||
      !form.location.trim() ||
      !form.venue.trim()
    ) {
      throw new Error("Mohon lengkapi informasi event yang wajib diisi.");
    }

    if (
      !ticketCategories.length ||
      ticketCategories.some(
        (t) =>
          !t.name.trim() ||
          !t.price ||
          !t.quota ||
          Number(t.price) <= 0 ||
          Number(t.quota) <= 0
      )
    ) {
      throw new Error(
        "Lengkapi nama, harga, dan kuota setiap kategori tiket."
      );
    }
  };

  // Menyimpan event baru
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!currentUser || currentUser.role !== "organizer") {
      setIsError(true);
      setMessage("Hanya akun Organizer yang dapat membuat event.");
      return;
    }

    try {
      validateForm();
      setSubmitting(true);

      const [posterUrl, seatingPlanUrl] = await Promise.all([
        uploadEventImage(posterFile, "poster"),
        uploadEventImage(seatingPlanFile, "seating-plan"),
      ]);

      const eventDateTime = new Date(`${form.date}T${form.time}:00`);

      if (Number.isNaN(eventDateTime.getTime())) {
        throw new Error("Tanggal atau jam event tidak valid.");
      }

      const { data: createdEvent, error: eventError } = await supabase
        .from("events")
        .insert({
          organizer_id: currentUser.id,
          title: form.title.trim(),
          artist: form.artist.trim(),
          subtitle: form.category,
          event_date: eventDateTime.toISOString(),
          location: form.location.trim(),
          venue: form.venue.trim(),
          description: form.description.trim() || null,
          image_url: posterUrl,
          seating_plan_url: seatingPlanUrl,
          terms_and_conditions:
            form.terms_and_conditions.trim() || null,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      const rows = ticketCategories.map((t) => ({
        event_id: createdEvent.id,
        name: t.name.trim(),
        description: t.description.trim() || null,
        price: Number(t.price),
        quota: Number(t.quota),
        color: t.color,
        benefits: t.benefits.trim() || null,
      }));

      const { error: ticketError } = await supabase
        .from("ticket_types")
        .insert(rows);

      if (ticketError) {
        await supabase
          .from("events")
          .delete()
          .eq("id", createdEvent.id)
          .eq("organizer_id", currentUser.id);

        throw ticketError;
      }

      await fetchOrganizerEvents(currentUser.id);
      resetForm();
      setMessage("Event dan seluruh kategori tiket berhasil disimpan!");
    } catch (error) {
      console.error("Create event error:", error);
      setIsError(true);
      setMessage(error.message || "Gagal menyimpan event.");
    } finally {
      setSubmitting(false);
    }
  };

  // Membuka form edit
  const handleEditEvent = (event) => {
    if (!currentUser || event.organizer_id !== currentUser.id) {
      setIsError(true);
      setMessage("Kamu hanya dapat mengedit event milikmu sendiri.");
      return;
    }

    const eventDate = event.event_date
      ? new Date(event.event_date)
      : null;

    const pad = (value) => String(value).padStart(2, "0");

    setEditingEvent(event);

    setForm({
      title: event.title || "",
      artist: event.artist || "",
      date:
        eventDate && !Number.isNaN(eventDate.getTime())
          ? `${eventDate.getFullYear()}-${pad(eventDate.getMonth() + 1)}-${pad(eventDate.getDate())}`
          : "",
      time:
        eventDate && !Number.isNaN(eventDate.getTime())
          ? `${pad(eventDate.getHours())}:${pad(eventDate.getMinutes())}`
          : "",
      location: event.location || "",
      venue: event.venue || "",
      category: event.subtitle || "Konser",
      description: event.description || "",
      terms_and_conditions: event.terms_and_conditions || "",
    });

    setTicketCategories(
      (event.ticket_types || []).map((ticket) => ({
        id: ticket.id,
        name: ticket.name || "",
        description: ticket.description || "",
        price: String(ticket.price ?? ""),
        quota: String(ticket.quota ?? ""),
        color: ticket.color || "#A766E8",
        benefits: ticket.benefits || "",
      }))
    );

    setPosterFile(null);
    setSeatingPlanFile(null);
    setPosterPreview(event.image_url || "");
    setSeatingPlanPreview(event.seating_plan_url || "");
    setMessage("");
    setIsError(false);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Update event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (
      !currentUser ||
      !editingEvent ||
      editingEvent.organizer_id !== currentUser.id
    ) {
      setIsError(true);
      setMessage("Kamu tidak memiliki akses untuk mengubah event ini.");
      return;
    }

    try {
      validateForm();
      setSubmitting(true);

      const [uploadedPosterUrl, uploadedSeatingPlanUrl] =
        await Promise.all([
          posterFile
            ? uploadEventImage(posterFile, "poster")
            : Promise.resolve(null),
          seatingPlanFile
            ? uploadEventImage(seatingPlanFile, "seating-plan")
            : Promise.resolve(null),
        ]);

      const eventDateTime = new Date(`${form.date}T${form.time}:00`);

      if (Number.isNaN(eventDateTime.getTime())) {
        throw new Error("Tanggal atau jam event tidak valid.");
      }

      const { error: eventError } = await supabase
        .from("events")
        .update({
          title: form.title.trim(),
          artist: form.artist.trim(),
          subtitle: form.category,
          event_date: eventDateTime.toISOString(),
          location: form.location.trim(),
          venue: form.venue.trim(),
          description: form.description.trim() || null,
          terms_and_conditions:
            form.terms_and_conditions.trim() || null,
          image_url:
            uploadedPosterUrl || editingEvent.image_url || null,
          seating_plan_url:
            uploadedSeatingPlanUrl ||
            editingEvent.seating_plan_url ||
            null,
        })
        .eq("id", editingEvent.id)
        .eq("organizer_id", currentUser.id);

      if (eventError) throw eventError;

      const oldTickets = editingEvent.ticket_types || [];
      const currentIds = ticketCategories
        .filter((t) => t.id)
        .map((t) => t.id);

      const removedIds = oldTickets
        .filter((t) => !currentIds.includes(t.id))
        .map((t) => t.id);

      if (removedIds.length > 0) {
        const { error } = await supabase
          .from("ticket_types")
          .delete()
          .eq("event_id", editingEvent.id)
          .in("id", removedIds);

        if (error) throw error;
      }

      for (const ticket of ticketCategories) {
        const ticketData = {
          name: ticket.name.trim(),
          description: ticket.description.trim() || null,
          price: Number(ticket.price),
          quota: Number(ticket.quota),
          color: ticket.color,
          benefits: ticket.benefits.trim() || null,
        };

        const result = ticket.id
          ? await supabase
              .from("ticket_types")
              .update(ticketData)
              .eq("id", ticket.id)
              .eq("event_id", editingEvent.id)
          : await supabase
              .from("ticket_types")
              .insert({
                ...ticketData,
                event_id: editingEvent.id,
              });

        if (result.error) throw result.error;
      }

      await fetchOrganizerEvents(currentUser.id);
      resetForm();
      setMessage("Perubahan event berhasil disimpan!");
    } catch (error) {
      console.error("Update event error:", error);
      setIsError(true);
      setMessage(error.message || "Gagal memperbarui event.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hapus event
  const handleDeleteEvent = async (event) => {
    if (!currentUser || event.organizer_id !== currentUser.id) {
      alert("Kamu hanya dapat menghapus event milikmu sendiri.");
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus event "${event.title}"?`
    );

    if (!confirmed) return;

    setSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const { error: ticketError } = await supabase
        .from("ticket_types")
        .delete()
        .eq("event_id", event.id);

      if (ticketError) throw ticketError;

      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id)
        .eq("organizer_id", currentUser.id);

      if (eventError) throw eventError;

      await fetchOrganizerEvents(currentUser.id);
      setMessage("Event berhasil dihapus!");
    } catch (error) {
      console.error("Delete event error:", error);
      setIsError(true);
      setMessage(error.message || "Gagal menghapus event.");
    } finally {
      setSubmitting(false);
    }
  };

  // Statistik event
  const getEventStats = (eventId) => {
    const eventTickets = paidTickets.filter(
      (t) => t.event_id === eventId
    );

    const uniqueOrderIds = new Set();
    let revenue = 0;

    eventTickets.forEach((t) => {
      if (t.orders && !uniqueOrderIds.has(t.orders.id)) {
        uniqueOrderIds.add(t.orders.id);
        revenue += Number(t.orders.total || 0);
      }
    });

    return {
      orders: uniqueOrderIds.size,
      ticketsSold: eventTickets.length,
      revenue,
    };
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "-";

    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const totalUniqueOrders = new Set(
    paidTickets.map((t) => t.order_id)
  ).size;

  const totalTickets = paidTickets.length;
  const totalEvents = myEvents.length;

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#10091b] text-white">
        Memuat Manajemen Event...
      </div>
    );
  }

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
            className="rounded-[9px] border border-[#49316d] bg-[#281b39] px-[18px] py-3 text-[13px] font-bold text-white transition hover:border-[#a766e8]"
          >
            ← Dashboard
          </Link>

          <Link
            href="/organizer/checkin"
            className="rounded-[9px] bg-[#a766e8] px-[18px] py-3 text-[13px] font-bold text-white transition hover:brightness-110"
          >
            Scan Tiket →
          </Link>
        </div>
      </header>

      <section className="mb-[30px] grid grid-cols-3 gap-[18px] max-[650px]:grid-cols-1">
        <div className="rounded-[15px] border border-[#39274b] bg-[#1c1229] p-6">
          <span className="block text-[13px] text-[#b9a9d0]">
            Total Event
          </span>
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
            {totalUniqueOrders}
          </strong>
        </div>
      </section>

      {/* FORM BUAT DAN EDIT EVENT */}
      <section className="mb-[38px] rounded-[15px] border border-[#39274b] bg-[#1c1229] p-[25px]">
        <div className="flex items-center justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start">
          <div>
            <h2 className="m-0 mb-2 font-heading text-[22px] font-bold">
              {editingEvent ? "Edit Event" : "Buat Event Baru"}
            </h2>
            <p className="text-sm text-[#b9a9d0]">
              {editingEvent
                ? "Perbarui informasi event yang kamu selenggarakan."
                : "Tambahkan konser yang akan kamu selenggarakan."}
            </p>
          </div>

          <button
            type="button"
            disabled={submitting}
            className="cursor-pointer rounded-[9px] border-0 bg-[#a766e8] px-[19px] py-[13px] font-bold text-white transition hover:brightness-110"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setEditingEvent(null);
                setForm(initialForm);
                setTicketCategories([{ ...initialTicket }]);
                setPosterFile(null);
                setSeatingPlanFile(null);
                setPosterPreview("");
                setSeatingPlanPreview("");
                setShowForm(true);
              }

              setMessage("");
              setIsError(false);
            }}
          >
            {showForm
              ? "Tutup Form"
              : editingEvent
                ? "Edit Event"
                : "+ Tambah Event"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-[9px] p-[13px] text-[13px] ${
              isError
                ? "bg-[#48232b] text-[#ff9a9a]"
                : "bg-[#183d30] text-[#65e5a4]"
            }`}
          >
            {message}
          </div>
        )}

        {showForm && (
          <form
            className="mt-[25px] border-t border-[#39274b] pt-[25px]"
            onSubmit={
              editingEvent
                ? handleUpdateEvent
                : handleCreateEvent
            }
          >
            {/* BAGIAN 01 - INFORMASI KONSER */}
            <div className="mb-6">
              <p className="mb-1 text-xs font-bold tracking-[1.5px] text-[#bd83ff]">
                BAGIAN 01
              </p>

              <h3 className="mb-4 text-lg font-bold">
                Informasi Konser
              </h3>

              <div className="grid grid-cols-2 gap-[18px] max-[650px]:grid-cols-1">
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
                    Jam Mulai *
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={form.time}
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

                <div className="col-span-2 flex flex-col gap-[9px] max-[650px]:col-span-1">
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

                <div className="col-span-2 flex flex-col gap-[9px] max-[650px]:col-span-1">
                  <label className="text-[13px] font-bold text-[#d4aaff]">
                    Syarat dan Ketentuan Tiket
                  </label>

                  <textarea
                    name="terms_and_conditions"
                    value={form.terms_and_conditions}
                    onChange={updateForm}
                    placeholder="Tuliskan syarat dan ketentuan pembelian atau penggunaan tiket..."
                    rows="4"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* BAGIAN 02 - KATEGORI DAN HARGA TIKET */}
            <div className="mb-8 border-t border-[#39274b] pt-6">
              <p className="mb-1 text-xs font-bold tracking-[1.5px] text-[#bd83ff]">
                BAGIAN 02
              </p>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">
                    Kategori dan Harga Tiket
                  </h3>

                  <p className="mt-1 text-xs text-[#b9a9d0]">
                    Tambahkan kelas tiket sesuai kebutuhan konser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTicketCategory}
                  className="rounded-lg border border-[#8c55bd] px-3 py-2 text-xs font-bold text-[#e0c2ff] hover:bg-[#352044]"
                >
                  + Tambah Kategori Tiket
                </button>
              </div>

              <div className="space-y-4">
                {ticketCategories.map((ticket, index) => (
                  <div
                    key={ticket.id || `new-${index}`}
                    className="rounded-xl border border-[#49345f] bg-[#130c20] p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="grid size-7 place-items-center rounded-full text-xs font-bold text-white"
                          style={{
                            backgroundColor: ticket.color,
                          }}
                        >
                          {index + 1}
                        </span>

                        <h4 className="text-sm font-bold">
                          Kategori Tiket {index + 1}
                        </h4>
                      </div>

                      {ticketCategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setTicketCategories((items) =>
                              items.filter((_, i) => i !== index)
                            )
                          }
                          className="text-xs font-semibold text-[#ff9292] hover:text-white"
                        >
                          Hapus Kategori
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#d4aaff]">
                          Nama Kategori *
                        </label>

                        <input
                          value={ticket.name}
                          onChange={(e) =>
                            updateTicketCategory(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Contoh: VIP Package"
                          required
                          className={inputClass}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#d4aaff]">
                          Deskripsi Kategori
                        </label>

                        <input
                          value={ticket.description}
                          onChange={(e) =>
                            updateTicketCategory(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Contoh: Numbered Seating"
                          className={inputClass}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#d4aaff]">
                          Harga Tiket (Rp) *
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={ticket.price}
                          onChange={(e) =>
                            updateTicketCategory(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="Contoh: 1500000"
                          required
                          className={inputClass}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#d4aaff]">
                          Kuota Tiket *
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={ticket.quota}
                          onChange={(e) =>
                            updateTicketCategory(
                              index,
                              "quota",
                              e.target.value
                            )
                          }
                          placeholder="Contoh: 500"
                          required
                          className={inputClass}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#d4aaff]">
                          Warna Kategori
                        </label>

                        <div className="flex h-[46px] items-center gap-3 rounded-lg border border-[#49345f] bg-[#130c20] px-3">
                          <input
                            type="color"
                            value={ticket.color}
                            onChange={(e) =>
                              updateTicketCategory(
                                index,
                                "color",
                                e.target.value
                              )
                            }
                            className="size-7 cursor-pointer border-0 bg-transparent"
                          />

                          <span className="text-xs text-[#b9a9d0]">
                            {ticket.color}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 flex flex-col gap-2 max-[650px]:col-span-1">
                        <label className="text-xs font-semibold text-[#d4aaff]">
                          Benefit Khusus (Opsional)
                        </label>

                        <textarea
                          value={ticket.benefits}
                          onChange={(e) =>
                            updateTicketCategory(
                              index,
                              "benefits",
                              e.target.value
                            )
                          }
                          placeholder="Contoh: Merchandise eksklusif, akses soundcheck, jalur masuk khusus..."
                          rows="2"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-[#9d8aad]">
                Total kuota:{" "}
                {ticketCategories
                  .reduce(
                    (sum, t) => sum + (Number(t.quota) || 0),
                    0
                  )
                  .toLocaleString("id-ID")}{" "}
                tiket
              </p>
            </div>

            {/* BAGIAN 03 - POSTER DAN SEATING PLAN */}
            <div className="mb-8 border-t border-[#39274b] pt-6">
              <p className="mb-1 text-xs font-bold tracking-[1.5px] text-[#bd83ff]">
                BAGIAN 03
              </p>

              <h3 className="mb-2 text-lg font-bold">
                Poster dan Seating Plan
              </h3>

              <p className="mb-5 text-xs text-[#b9a9d0]">
                Upload gambar konser dan denah tempat duduk.
                Saat mengedit, gambar lama tetap digunakan jika
                kamu tidak memilih gambar baru.
              </p>

              <div className="grid grid-cols-2 gap-5 max-[650px]:grid-cols-1">
                {/* POSTER */}
                <div className="flex flex-col gap-3">
                  <label className="text-[13px] font-bold text-[#d4aaff]">
                    Upload Poster Konser
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setPosterFile(file);
                      setPosterPreview(
                        file ? URL.createObjectURL(file) : posterPreview
                      );
                    }}
                    className={inputClass}
                  />

                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Preview poster konser"
                      className="max-h-64 w-full rounded-lg border border-[#49345f] object-contain"
                    />
                  ) : (
                    <div className="grid min-h-36 place-items-center rounded-lg border border-dashed border-[#49345f] text-xs text-[#897a9d]">
                      Preview poster akan muncul di sini
                    </div>
                  )}
                </div>

                {/* SEATING PLAN */}
                <div className="flex flex-col gap-3">
                  <label className="text-[13px] font-bold text-[#d4aaff]">
                    Upload Seating Plan
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSeatingPlanFile(file);
                      setSeatingPlanPreview(
                        file
                          ? URL.createObjectURL(file)
                          : seatingPlanPreview
                      );
                    }}
                    className={inputClass}
                  />

                  {seatingPlanPreview ? (
                    <img
                      src={seatingPlanPreview}
                      alt="Preview seating plan"
                      className="max-h-64 w-full rounded-lg border border-[#49345f] object-contain"
                    />
                  ) : (
                    <div className="grid min-h-36 place-items-center rounded-lg border border-dashed border-[#49345f] text-xs text-[#897a9d]">
                      Preview seating plan akan muncul di sini
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TOMBOL SIMPAN */}
            <div className="flex flex-wrap items-center gap-3 border-t border-[#39274b] pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-[9px] border-0 bg-[#a766e8] px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Menyimpan..."
                  : editingEvent
                    ? "Simpan Perubahan"
                    : "Simpan Event"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="rounded-[9px] border border-[#49345f] px-6 py-3 text-sm font-semibold text-[#d4aaff] hover:bg-[#281b39]"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </section>

      {/* EVENT SAYA */}
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
              const stats = getEventStats(event.id);

              return (
                <article
                  className="overflow-hidden rounded-[15px] border border-[#39274b] bg-[#1c1229]"
                  key={event.id}
                >
                  {/* POSTER EVENT */}
                  {event.image_url ? (
                    <div className="relative h-[190px] bg-[#251832]">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="size-full object-cover"
                      />

                      <span className="absolute top-3.5 left-3.5 rounded-[20px] bg-[#10091be8] px-3 py-[7px] text-[11px] text-[#d4aaff]">
                        {event.subtitle || "Konser"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex min-h-[190px] flex-col justify-end gap-3 bg-[linear-gradient(135deg,#51316e,#1c1229)] p-[25px]">
                      <span className="text-xs text-[#e3c8ff]">
                        {event.subtitle || "Konser"}
                      </span>

                      <strong className="text-[25px] [overflow-wrap:anywhere]">
                        {event.title}
                      </strong>
                    </div>
                  )}

                  <div className="p-[22px]">
                    {event.image_url && (
                      <h3 className="m-0 font-heading text-[19px]">
                        {event.title}
                      </h3>
                    )}

                    <p className="mt-2 mb-[18px] text-[13px] text-[#bd83ff]">
                      {event.artist || "-"}
                    </p>

                    {/* INFORMASI EVENT */}
                    <div className="flex flex-col gap-2.5 border-y border-[#39274b] py-[15px]">
                      <p className="m-0 text-xs text-[#c9bed8]">
                        📅 {formatDisplayDate(event.event_date)}
                      </p>

                      <p className="m-0 text-xs text-[#c9bed8]">
                        📍 {event.venue}
                        {event.location ? `, ${event.location}` : ""}
                      </p>

                      <p className="m-0 text-xs text-[#c9bed8]">
                        🎟️ Kapasitas: {event.totalQuota} tiket
                      </p>

                      <p className="m-0 text-xs text-[#c9bed8]">
                        🏢 {currentUser?.organization || currentUser?.name}
                      </p>
                    </div>

                    {/* HARGA TIKET */}
                    <div className="mt-[18px] flex flex-col gap-[7px] text-[11px] text-[#b9a9d0]">
                      Harga tiket mulai dari

                      <strong className="text-[17px] text-[#d4aaff]">
                        {formatPrice(event.minPrice)}
                      </strong>
                    </div>

                    {/* STATISTIK EVENT */}
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

                    {/* STATUS EVENT */}
                    <span className="mt-[18px] inline-block rounded-[20px] bg-[#183d30] px-3 py-[7px] text-[11px] text-[#65e5a4]">
                      Event Aktif
                    </span>

                    {/* TOMBOL EDIT DAN HAPUS */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleEditEvent(event)}
                        className="rounded-lg border border-[#a766e8] bg-[#352044] px-4 py-3 text-sm font-bold text-[#dfbdff] transition hover:bg-[#7544a6] disabled:opacity-50"
                      >
                         Edit Event
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDeleteEvent(event)}
                        className="rounded-lg border border-[#713747] bg-[#351923] px-4 py-3 text-sm font-bold text-[#ff9999] transition hover:bg-[#642c3b] disabled:opacity-50"
                      >
                         Hapus Event
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}