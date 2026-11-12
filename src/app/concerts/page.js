"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
import { concerts, formatPrice } from "../../data/concerts";
 
const tag =
  "rounded-[5px] border border-[rgba(167,139,250,0.18)] bg-[rgba(139,92,246,0.1)] px-[9px] py-1.5 text-[10px] text-[#c4b5fd]";
 
export default function ConcertPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua");
  const [genre, setGenre] = useState("Semua Genre");
  const [today, setToday] = useState(null);
  const [allConcerts, setAllConcerts] = useState(concerts);
 
  // ======================================
  // 01. TANGGAL INDONESIA
  // ======================================
 
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
 
    setToday(
      `${values.year}-${values.month}-${values.day}`
    );
  }, []);
 
  // ======================================
  // 01B. AMBIL EVENT BUATAN ORGANIZER
  // ======================================
 
  useEffect(() => {
    try {
      const savedEvents = JSON.parse(
        localStorage.getItem("encoreCustomConcerts") || "[]"
      );
 
      setAllConcerts([
        ...concerts,
        ...savedEvents.filter(
          (event) => !concerts.some((item) => item.id === event.id)
        ),
      ]);
    } catch (error) {
      console.error("Gagal membaca event Organizer:", error);
      setAllConcerts(concerts);
    }
  }, []);
 
  // ======================================
  // 02. STATUS KONSER
  // ======================================
 
  const getStatus = (concert) => {
    if (!today || !concert.dateISO) {
      return "Memuat status";
    }
 
    if (concert.dateISO > today) return "Mendatang";
    if (concert.dateISO === today) return "Berlangsung";
 
    return "Selesai";
  };
 
  // ======================================
  // 03. FILTER GENRE
  // ======================================
 
  const genres = [
    "Semua Genre",
    ...new Set(
      allConcerts.map((concert) => concert.genre).filter(Boolean)
    ),
  ];
 
  // ======================================
  // 04. FILTER KONSER
  // ======================================
 
  const filteredConcerts = allConcerts.filter((concert) => {
    const keyword = search.toLowerCase().trim();
 
    const matchSearch = [
      concert.title,
      concert.artist,
      concert.location,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(keyword)
    );
 
    const matchStatus =
      status === "Semua" ||
      getStatus(concert) === status;
 
    const matchGenre =
      genre === "Semua Genre" ||
      concert.genre === genre;
 
    return matchSearch && matchStatus && matchGenre;
  });
 
  // ======================================
  // 05. KELAS TAILWIND
  // ======================================
 
  const tabBase =
    "min-h-12 cursor-pointer rounded-[11px] border px-[25px] text-[13px] font-semibold transition duration-[250ms] max-[640px]:min-h-10 max-[640px]:px-[15px] max-[640px]:text-[11px]";
  const tabIdle =
    "border-[rgba(167,139,250,0.2)] bg-[rgba(20,15,38,0.88)] text-[#c8bfdc] hover:border-[#8b5cf6] hover:text-white";
  const tabActive = "border-[#8b5cf6] bg-[#8b5cf6] text-white";
 
  // ======================================
  // 06. TAMPILAN HALAMAN
  // ======================================
 
  return (
    <main className="relative isolate min-h-screen w-full overflow-hidden bg-[#090714] text-white">
      {/* BACKGROUND */}
 
      <div className="pointer-events-none absolute inset-0 z-[-2] bg-[url('/images/bg%20concerts.jpg')] bg-cover bg-[position:center_top] bg-no-repeat" />
      <div className="pointer-events-none absolute inset-0 z-[-1] bg-[linear-gradient(180deg,rgba(9,7,20,0.68)_0%,rgba(9,7,20,0.82)_45%,rgba(9,7,20,0.96)_100%)]" />
 
      <section className="relative z-[2] m-0 w-full bg-transparent px-[7%] pt-7 pb-[65px] max-[1024px]:px-[5%] max-[640px]:pt-5 max-[640px]:pb-[45px]">
        {/* SEARCH + GENRE */}
 
        <div className="mb-[22px] flex w-full items-center gap-3.5 max-[640px]:mb-4 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-2.5">
          <div className="flex h-[52px] min-h-[52px] min-w-0 flex-1 items-center gap-3 rounded-[11px] border border-[rgba(196,181,253,0.24)] bg-[rgba(16,12,31,0.9)] px-[18px] backdrop-blur-[12px] transition-[border-color,background-color] duration-[250ms] focus-within:border-[#a78bfa] focus-within:bg-[rgba(20,15,38,0.96)] max-[640px]:w-full">
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              className="shrink-0 text-[#b9a6e9]"
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
              className="h-full w-full min-w-0 flex-1 border-none bg-transparent p-0 text-[13px] text-white outline-none placeholder:text-[#91889f] [&::-webkit-search-cancel-button]:hidden"
            />
 
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                className="flex size-[25px] cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[22px] text-[#b9a6e9]"
              >
                ×
              </button>
            )}
          </div>
 
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            aria-label="Pilih genre musik"
            className="h-[52px] min-h-[52px] w-[200px] shrink-0 cursor-pointer rounded-[11px] border border-[rgba(196,181,253,0.24)] bg-[rgba(16,12,31,0.94)] px-4 text-[13px] text-white outline-none hover:border-[#a78bfa] focus:border-[#a78bfa] max-[640px]:h-[50px] max-[640px]:min-h-[50px] max-[640px]:w-full [&_option]:bg-[#151126] [&_option]:text-white"
          >
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
 
        {/* STATUS FILTER */}
 
        <div className="mb-[30px] flex w-full flex-wrap items-center gap-3 max-[640px]:mb-[23px] max-[640px]:gap-2">
          {["Semua", "Mendatang", "Berlangsung", "Selesai"].map((item) => (
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
 
        {/* RESULT COUNT */}
 
        <p className="mb-[27px] text-[13px] leading-[1.6] text-[#c1b8d5] max-[640px]:mb-5">
          {today === null && status !== "Semua"
            ? "Memuat konser..."
            : `Menampilkan ${filteredConcerts.length} konser`}
        </p>
 
        {/* CONCERT GRID */}
 
        <div className="m-0 grid w-full grid-cols-4 gap-6 bg-transparent p-0 max-[1024px]:grid-cols-2 max-[1024px]:gap-5 max-[640px]:grid-cols-1 max-[640px]:gap-[18px]">
          {filteredConcerts.map((concert) => (
            <article
              key={concert.id}
              className="group flex w-full min-w-0 flex-col overflow-hidden rounded-[13px] border border-[rgba(196,181,253,0.1)] bg-[rgba(13,10,27,0.94)] transition-[transform,border-color] duration-[250ms] hover:-translate-y-1 hover:border-[rgba(167,139,250,0.45)] hover:shadow-[0_10px_30px_#8b5cf615]"
            >
              {/* POSTER */}
 
              <div className="relative h-[190px] w-full overflow-hidden bg-[#090714] max-[700px]:h-[230px]">
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
 
              {/* INFO */}
 
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
 
                <div className="mt-3.5 mb-[17px] flex flex-wrap gap-[7px]">
                  {concert.genre && (
                    <span className={tag}>{concert.genre}</span>
                  )}
 
                  <span className={tag}>{getStatus(concert)}</span>
                </div>
 
                <div className="mt-auto flex items-end justify-between gap-2.5 border-t border-[rgba(196,181,253,0.12)] pt-[13px]">
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
 
        {/* EMPTY STATE */}
 
        {filteredConcerts.length === 0 &&
          !(today === null && status !== "Semua") && (
            <p className="px-[15px] py-[50px] text-center text-sm text-[#b9a6e9]">
              Konser tidak ditemukan. Coba kata kunci atau filter lainnya.
            </p>
          )}
      </section>
    </main>
  );
}