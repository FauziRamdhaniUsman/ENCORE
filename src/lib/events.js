import { supabase } from "./supabase";

// Nilai kolom events.status yang boleh tampil ke publik.
// Kalau tabelmu tidak punya kolom status, semua event tampil.
const PUBLISHED_STATUS = "published";

const TIMEZONE = "Asia/Jakarta";

function jakartaISODate(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

export function formatEventDate(value) {
  const parsed = value ? new Date(value) : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return { text: value || "-", iso: "" };
  }

  return {
    text: parsed.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: TIMEZONE,
    }),
    iso: jakartaISODate(parsed),
  };
}

export function mapEvent(ev) {
  const tickets = Array.isArray(ev.ticket_types) ? ev.ticket_types : [];
  const prices = tickets.map((t) => Number(t.price || 0));
  const { text, iso } = formatEventDate(ev.event_date);

  return {
    id: ev.id,
    title: ev.title,
    subtitle: ev.subtitle || "",
    artist: ev.artist || "ENCORE Artist",
    date: text,
    dateISO: iso,
    location: ev.location || ev.city || ev.venue || "Indonesia",
    venue: ev.venue || "",
    city: ev.city || "",
    category: ev.category || "Konser",
    genre: ev.genre || ev.subtitle || "Konser",
    price: prices.length > 0 ? Math.min(...prices) : 0,
    image: ev.image_url || "/images/default-concert.jpg",
  };
}

// Ambil event dari Supabase untuk halaman publik.
// Hanya event berstatus published yang sudah punya minimal 1 jenis tiket.
export async function fetchPublishedEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(`*, ticket_types ( id, price, quota )`)
    .order("event_date", { ascending: true });

  if (error) throw error;

  return (data || [])
    .filter((ev) => !ev.status || ev.status === PUBLISHED_STATUS)
    .filter((ev) => Array.isArray(ev.ticket_types) && ev.ticket_types.length > 0)
    .map(mapEvent);
}