"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { concerts, formatPrice } from "../../data/concerts";
import { supabase } from "../../lib/supabase";

const tag =
  "rounded-[5px] border border-[rgba(167,139,250,0.18)] bg-[rgba(139,92,246,0.1)] px-[9px] py-1.5 text-[10px] text-[#c4b5fd]";

const CITIES = ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Bali"];

const PRICE_RANGES = [
  { value: "all", label: "Semua Harga" },
  { value: "low", label: "Di bawah Rp500.000" },
  { value: "mid", label: "Rp500.000 - Rp1.000.000" },
  { value: "high", label: "Di atas Rp1.000.000" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Urutkan: Default" },
  { value: "cheap", label: "Harga termurah" },
  { value: "expensive", label: "Harga termahal" },
  { value: "name", label: "Nama A-Z" },
];

const STATUS_OPTIONS = ["Semua", "Mendatang", "Berlangsung", "Selesai"];

const DEFAULT_STATUS = "Mendatang";
const DEFAULT_SORT = "default";

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="relative w-full min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 min-h-10 w-full cursor-pointer appearance-none rounded-full border border-[#5b3fa8] bg-[rgba(21,16,39,0.86)] pr-10 pl-4 text-[13px] font-semibold text-white outline-none transition-[border-color] duration-200 hover:border-[#8b5cf6] focus:border-[#c4b5fd] [&_option]:bg-[#151126] [&_option]:text-white"
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#c4b5fd]"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

function DateFilter({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Tampilkan konser mulai tanggal"
      title="Tampilkan konser pada atau setelah tanggal ini"
      className="h-10 min-h-10 w-full min-w-0 cursor-pointer rounded-full border border-[#5b3fa8] bg-[rgba(21,16,39,0.86)] px-4 text-[13px] font-semibold text-white outline-none transition-[border-color] duration-200 [color-scheme:dark] hover:border-[#8b5cf6] focus:border-[#c4b5fd]"
    />
  );
}

function Field({ label, children }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-[#b9aed0]">{label}</span>
      {children}
    </label>
  );
}

export default function ConcertPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [genre, setGenre] = useState("Semua Genre");
  const [city, setCity] = useState("Semua Kota");
  const [priceRange, setPriceRange] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [showFilters, setShowFilters] = useState(false);
  const [today, setToday] = useState(null);
  const [allConcerts, setAllConcerts] = useState(concerts);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q");
    const cityParam = params.get("city");
    const genreParam = params.get("genre");
    const dateParam = params.get("date");

    if (q) setSearch(q);

    if (cityParam) {
      const match = CITIES.find(
        (item) => item.toLowerCase() === cityParam.toLowerCase()
      );
      if (match) setCity(match);
    }

    if (genreParam) setGenre(genreParam);

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setDateFilter(dateParam);
    }
  }, []);

  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value])
    );

    setToday(`${values.year}-${values.month}-${values.day}`);
  }, []);

  useEffect(() => {
    const fetchSupabaseEvents = async () => {
      try {
        const { data: eventsData, error } = await supabase
          .from("events")
          .select(
            `
            *,
            ticket_types (
              price
            )
          `
          )
          .order("event_date", { ascending: true });

        if (error) {
          console.error("Gagal memuat event dari Supabase:", error);
          setAllConcerts(concerts);
          return;
        }

        const mappedEvents = (eventsData || []).map((ev) => {
          const ticketList = Array.isArray(ev.ticket_types)
            ? ev.ticket_types
            : [];
          const minPrice =
            ticketList.length > 0
              ? Math.min(...ticketList.map((t) => Number(t.price || 0)))
              : 0;

          const parsedDate = ev.event_date ? new Date(ev.event_date) : null;
          const isValidDate =
            parsedDate && !Number.isNaN(parsedDate.getTime());

          const dateISO = isValidDate
            ? parsedDate.toISOString().slice(0, 10)
            : "";

          const formattedDate = isValidDate
            ? parsedDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ev.event_date || "-";

          return {
            id: ev.id,
            title: ev.title,
            artist: ev.artist || "ENCORE Artist",
            date: formattedDate,
            dateISO,
            location: ev.location || ev.venue || "Indonesia",
            venue: ev.venue || "",
            category: ev.subtitle || "Konser",
            genre: ev.subtitle || "Konser",
            price: minPrice,
            image: ev.image_url || "/images/default-concert.jpg",
          };
        });

        setAllConcerts([
          ...mappedEvents,
          ...concerts.filter(
            (item) => !mappedEvents.some((ev) => String(ev.id) === String(item.id))
          ),
        ]);
      } catch (error) {
        console.error("Gagal membaca event Organizer:", error);
        setAllConcerts(concerts);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchSupabaseEvents();
  }, []);

  const getStatus = (concert) => {
    if (!today) return "Memuat status";

    if (!concert.dateISO) return "Mendatang";

    if (concert.dateISO > today) return "Mendatang";
    if (concert.dateISO === today) return "Berlangsung";

    return "Selesai";
  };

  const genreOptions = [
    ...new Set([
      "Semua Genre",
      ...allConcerts.map((concert) => concert.genre).filter(Boolean),
      genre,
    ]),
  ].map((item) => ({ value: item, label: item }));

  const cityOptions = [
    { value: "Semua Kota", label: "Semua Kota" },
    ...CITIES.map((item) => ({ value: item, label: item })),
  ];

  const matchPrice = (price) => {
    const value = Number(price || 0);

    if (priceRange === "low") return value < 500000;
    if (priceRange === "mid") return value >= 500000 && value <= 1000000;
    if (priceRange === "high") return value > 1000000;

    return true;
  };

  const filteredConcerts = allConcerts.filter((concert) => {
    const keyword = search.toLowerCase().trim();

    const matchSearch = [
      concert.title,
      concert.artist,
      concert.location,
      concert.venue,
    ].some((value) => String(value ?? "").toLowerCase().includes(keyword));

    const matchStatus = status === "Semua" || getStatus(concert) === status;

    const concertGenre = String(concert.genre ?? "").toLowerCase();
    const wantedGenre = genre.toLowerCase();

    const matchGenre =
      genre === "Semua Genre" ||
      concertGenre === wantedGenre ||
      concertGenre.includes(wantedGenre);

    const matchCity =
      city === "Semua Kota" ||
      [concert.location, concert.venue, concert.city].some((value) =>
        String(value ?? "").toLowerCase().includes(city.toLowerCase())
      );

    const matchDate =
      !dateFilter || (concert.dateISO && concert.dateISO >= dateFilter);

    return (
      matchSearch &&
      matchStatus &&
      matchGenre &&
      matchCity &&
      matchDate &&
      matchPrice(concert.price)
    );
  });

  const sortedConcerts = [...filteredConcerts].sort((a, b) => {
    if (sortBy === "cheap") return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === "expensive") return Number(b.price || 0) - Number(a.price || 0);
    if (sortBy === "name") {
      return String(a.title ?? "").localeCompare(String(b.title ?? ""));
    }
    return 0;
  });

  const dateChipLabel = dateFilter
    ? new Date(`${dateFilter}T00:00:00`).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const activeChips = [
    genre !== "Semua Genre" && {
      key: "genre",
      label: genre,
      clear: () => setGenre("Semua Genre"),
    },
    city !== "Semua Kota" && {
      key: "city",
      label: city,
      clear: () => setCity("Semua Kota"),
    },
    priceRange !== "all" && {
      key: "price",
      label: PRICE_RANGES.find((item) => item.value === priceRange)?.label,
      clear: () => setPriceRange("all"),
    },
    dateFilter && {
      key: "date",
      label: `Mulai ${dateChipLabel}`,
      clear: () => setDateFilter(""),
    },
  ].filter(Boolean);

  const hasActiveFilter =
    search.trim() !== "" ||
    status !== DEFAULT_STATUS ||
    activeChips.length > 0 ||
    sortBy !== DEFAULT_SORT;

  const resetFilters = () => {
    setSearch("");
    setStatus(DEFAULT_STATUS);
    setGenre("Semua Genre");
    setCity("Semua Kota");
    setPriceRange("all");
    setDateFilter("");
    setSortBy(DEFAULT_SORT);
  };

  const tabBase =
    "min-h-10 cursor-pointer rounded-full border px-5 text-[14px] font-semibold transition duration-200 max-[640px]:min-h-9 max-[640px]:px-4 max-[640px]:text-[13px]";
  const tabIdle =
    "border-[#5b3fa8] bg-[rgba(21,16,39,0.86)] text-white hover:border-[#c4b5fd] hover:bg-[rgba(139,92,246,0.2)]";
  const tabActive = "border-[#8b5cf6] bg-[#8b5cf6] text-white";

  return (
    <main className="concerts-page relative isolate min-h-screen w-full overflow-x-clip bg-[#090714] text-white">
      <h1 className="sr-only">Semua konser</h1>

      <div className="pointer-events-none absolute inset-0 z-[-2] bg-[url('/images/bg%20concerts.jpg')] bg-cover bg-[position:center_top] bg-no-repeat" />
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[linear-gradient(180deg,rgba(9,7,20,0.68)_0%,rgba(9,7,20,0.82)_45%,rgba(9,7,20,0.96)_100%)]" />

      <section className="relative z-[2] mx-auto w-full max-w-[1200px] px-[clamp(16px,5vw,48px)] pt-10 pb-16 max-[640px]:pt-7 max-[640px]:pb-12">
        <div className="mb-4 flex h-12 min-h-12 w-full items-center gap-3 rounded-full border border-[#5b3fa8] bg-[rgba(21,16,39,0.86)] pr-1.5 pl-5 backdrop-blur-[10px] transition-[border-color,background-color] duration-200 hover:border-[#8b5cf6] focus-within:border-[#c4b5fd] focus-within:bg-[rgba(21,16,39,0.96)]">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className="shrink-0 text-[#c4b5fd]"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="search"
            placeholder="Cari konser, artis, atau kota..."
            aria-label="Cari konser, artis, atau kota"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-full w-full min-w-0 flex-1 border-none bg-transparent p-0 text-[14px] font-medium text-white outline-none placeholder:text-[#b9aed0] [&::-webkit-search-cancel-button]:hidden"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-[20px] leading-none text-[#c4b5fd] transition hover:bg-[rgba(139,92,246,0.25)] hover:text-white"
            >
              ×
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            aria-label="Tampilkan filter"
            className={`flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-[13px] font-semibold text-white transition duration-200 max-[480px]:px-3 ${
              showFilters
                ? "border-[#8b5cf6] bg-[#8b5cf6]"
                : "border-[#5b3fa8] bg-[rgba(139,92,246,0.12)] hover:border-[#8b5cf6]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
              <circle cx="9" cy="6" r="2" fill="currentColor" />
              <circle cx="15" cy="12" r="2" fill="currentColor" />
              <circle cx="8" cy="18" r="2" fill="currentColor" />
            </svg>

            <span className="max-[480px]:hidden">Filter</span>

            {activeChips.length > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold text-[#6d3be8]">
                {activeChips.length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div
            id="filter-panel"
            className="mb-5 rounded-[20px] border border-[#5b3fa8] bg-[rgba(21,16,39,0.7)] p-5 backdrop-blur-[10px] max-[480px]:p-4"
          >
            <div className="grid grid-cols-5 gap-4 max-[1000px]:grid-cols-3 max-[640px]:grid-cols-2 max-[480px]:grid-cols-1">
              <Field label="Genre">
                <FilterSelect
                  label="Pilih genre musik"
                  value={genre}
                  onChange={setGenre}
                  options={genreOptions}
                />
              </Field>

              <Field label="Kota">
                <FilterSelect
                  label="Pilih kota"
                  value={city}
                  onChange={setCity}
                  options={cityOptions}
                />
              </Field>

              <Field label="Rentang harga">
                <FilterSelect
                  label="Pilih rentang harga"
                  value={priceRange}
                  onChange={setPriceRange}
                  options={PRICE_RANGES}
                />
              </Field>

              <Field label="Mulai tanggal">
                <DateFilter value={dateFilter} onChange={setDateFilter} />
              </Field>

              <Field label="Urutkan">
                <FilterSelect
                  label="Urutkan konser"
                  value={sortBy}
                  onChange={setSortBy}
                  options={SORT_OPTIONS}
                />
              </Field>
            </div>
          </div>
        )}

        {!showFilters && activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                aria-label={`Hapus filter ${chip.label}`}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#5b3fa8] bg-[rgba(139,92,246,0.18)] py-1.5 pr-2.5 pl-3.5 text-[13px] font-semibold text-white transition hover:border-[#c4b5fd]"
              >
                {chip.label}
                <span
                  aria-hidden="true"
                  className="text-[16px] leading-none text-[#c4b5fd]"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-2.5 max-[640px]:gap-2">
            {STATUS_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`${tabBase} ${status === item ? tabActive : tabIdle}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <p className="text-[14px] leading-[1.6] text-[#b9aed0]">
              {loadingEvents || (today === null && status !== "Semua")
                ? "Memuat konser..."
                : `Menampilkan ${sortedConcerts.length} konser`}
            </p>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-[#c4b5fd] underline underline-offset-4 transition hover:text-white"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="m-0 grid w-full grid-cols-3 gap-5 bg-transparent p-0 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-[18px]">
          {sortedConcerts.map((concert) => (
            <article
              key={concert.id}
              className="group w-full min-w-0 transition-[transform,filter] duration-[250ms] hover:-translate-y-1 hover:[filter:drop-shadow(0_10px_18px_rgba(139,92,246,0.25))]"
            >
              <div className="ticket-card flex h-full w-full flex-col overflow-hidden rounded-[13px] border border-[rgba(196,181,253,0.1)] bg-[rgba(13,10,27,0.94)] transition-[border-color] duration-[250ms] group-hover:border-[rgba(167,139,250,0.45)]">
                <div className="relative h-[190px] w-full shrink-0 overflow-hidden bg-[#090714] max-[700px]:h-[230px]">
                  <img
                    src={concert.image || "/images/default-concert.jpg"}
                    alt={concert.title}
                    loading="lazy"
                    className="block size-full object-cover object-center transition-transform duration-[400ms] group-hover:scale-[1.035]"
                  />

                  <span className="absolute top-[13px] left-[13px] rounded-[7px] bg-[rgba(13,10,27,0.94)] px-3 py-[7px] text-[11px] font-semibold text-[#c4b5fd]">
                    {concert.category || "Konser"}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-[17px]">
                  <p className="mb-[9px] text-xs text-[#a78bfa]">
                    {concert.date}
                  </p>

                  <h3 className="mb-[7px] text-base leading-[1.4] font-[750] text-white">
                    {concert.title}
                  </h3>

                  <p className="mb-[9px] text-xs leading-[1.6] text-[#c3bbd2]">
                    {concert.artist}
                  </p>

                  <p className="mb-[13px] text-xs text-[#a49bb5]">
                    ⌖ {concert.location}
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-[7px]">
                    {concert.genre && (
                      <span className={tag}>{concert.genre}</span>
                    )}

                    <span className={tag}>{getStatus(concert)}</span>
                  </div>
                </div>

                <div className="ticket-stub flex shrink-0 items-center justify-between gap-2.5 border-t-2 border-dashed border-[rgba(196,181,253,0.2)] px-[17px]">
                  <div className="flex min-w-0 flex-col gap-[5px]">
                    <span className="text-[10px] text-[#91889f]">
                      Mulai dari
                    </span>

                    <strong className="text-[13px] leading-[1.4] font-bold text-white">
                      {formatPrice(concert.price)}
                    </strong>
                  </div>

                  <Link
                    href={`/concerts/${concert.id}`}
                    aria-label={`Lihat detail ${concert.title}`}
                    className="inline-flex min-h-[35px] shrink-0 items-center justify-center rounded-[7px] border border-[#6d3be8] bg-[#8b5cf6] px-[15px] text-[11px] font-[650] whitespace-nowrap text-white transition duration-[250ms] hover:bg-[#7042d4]"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {sortedConcerts.length === 0 &&
          !loadingEvents &&
          !(today === null && status !== "Semua") && (
            <div className="px-[15px] py-[50px] text-center">
              <p className="text-sm text-[#b9a6e9]">
                Konser tidak ditemukan. Coba kata kunci atau filter lainnya.
              </p>

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 min-h-10 cursor-pointer rounded-full border border-[#5b3fa8] bg-[rgba(21,16,39,0.86)] px-5 text-[14px] font-semibold text-white transition hover:border-[#c4b5fd] hover:bg-[rgba(139,92,246,0.2)]"
                >
                  Reset filter
                </button>
              )}
            </div>
          )}
      </section>

      <style>{`
        .concerts-page h1,
        .concerts-page h2,
        .concerts-page h3 {
          font-family: var(--font-outfit), sans-serif;
        }

        .ticket-card {
          --stub-h: 64px;
          --notch: 10px;

          -webkit-mask:
            radial-gradient(circle var(--notch) at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
            radial-gradient(circle var(--notch) at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
          mask:
            radial-gradient(circle var(--notch) at 0 calc(100% - var(--stub-h)), #0000 97%, #000) left / 51% 100% no-repeat,
            radial-gradient(circle var(--notch) at 100% calc(100% - var(--stub-h)), #0000 97%, #000) right / 51% 100% no-repeat;
        }

        .ticket-stub {
          height: var(--stub-h);
        }
      `}</style>
    </main>
  );
}