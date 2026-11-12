"use client";

import { useState } from "react";
import Link from "next/link";

const SUPPORT_EMAIL = "";

const contactOptions = [
  {
    icon: "✉",
    title: "Email Support",
    description: "Bantuan seputar tiket dan pemesanan.",
  },
  {
    icon: "♫",
    title: "Live Support",
    description: "Informasi konser dan penggunaan ENCORE.",
  },
  {
    icon: "✦",
    title: "Partnership",
    description: "Peluang kerja sama dan acara musik.",
  },
];

const categories = [
  "Pertanyaan Tiket",
  "Pembayaran",
  "Informasi Konser",
  "Akun Pengguna",
  "Kerja Sama",
  "Lainnya",
];

const faqs = [
  {
    question: "Bagaimana cara membeli tiket di ENCORE?",
    answer:
      "Pilih konser di halaman Concerts, tentukan kategori dan jumlah tiket, lalu ikuti proses pemesanan. Saat ini checkout masih berupa simulasi.",
  },
  {
    question: "Bagaimana cara mendapatkan e-ticket?",
    answer:
      "Fitur e-ticket akan tersedia setelah sistem pembayaran dan pemesanan ENCORE diaktifkan.",
  },
  {
    question: "Apakah tiket bisa dikembalikan?",
    answer:
      "Ketentuan refund mengikuti kebijakan penyelenggara konser dan syarat pembelian yang berlaku.",
  },
  {
    question: "Bagaimana jika terjadi kendala pembayaran?",
    answer:
      "Hubungi tim bantuan dengan menyertakan informasi pemesanan dan kendala yang dialami. Jangan membagikan kata sandi atau OTP.",
  },
  {
    question: "Apakah tersedia tiket VIP?",
    answer:
      "Beberapa konser menyediakan kategori VIP atau paket khusus. Informasi benefit dapat dilihat pada halaman detail konser.",
  },
  {
    question: "Bagaimana cara bekerja sama dengan ENCORE?",
    answer:
      "Pilih kategori Kerja Sama pada formulir Contact dan jelaskan kebutuhan serta rencana kerja sama kamu.",
  },
];

const fieldInput =
  "w-full rounded-[7px] border border-[#493d60] bg-[#090714e0] px-3.5 py-3 text-xs text-white outline-none placeholder:text-[#91889f] focus:border-primary-light focus:shadow-[0_0_0_3px_#8b5cf620]";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

  const [openFAQ, setOpenFAQ] = useState(null);
  const [notification, setNotification] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setNotification("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.category ||
      !formData.message.trim()
    ) {
      setNotification("Lengkapi semua kolom terlebih dahulu.");
      return;
    }

    if (!SUPPORT_EMAIL) {
      setNotification("Email tujuan ENCORE belum dikonfigurasi.");
      return;
    }

    const subject = encodeURIComponent(`[ENCORE] ${formData.category}`);

    const body = encodeURIComponent(
      `Halo Tim ENCORE,\n\n` +
        `Nama: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Kategori: ${formData.category}\n\n` +
        `Pesan:\n${formData.message}`
    );

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    setNotification("Aplikasi email akan dibuka. Silakan kirim pesanmu.");
  };

  return (
    <main className="relative isolate min-h-screen w-full overflow-hidden bg-background text-white">
      {/* FULL PAGE BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: 'url("/images/bg%20concerts.jpg")' }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,7,20,0.58)_0%,rgba(9,7,20,0.72)_30%,rgba(9,7,20,0.82)_65%,rgba(9,7,20,0.93)_100%)]" />

      {/* CONTACT HERO */}
      <section className="relative z-[1] flex min-h-[245px] items-center justify-center bg-transparent px-[7%] pt-[55px] pb-[30px] text-center max-[760px]:min-h-[220px] max-[760px]:px-[6%] max-[760px]:pt-[50px] max-[760px]:pb-[25px]">
        <div>
          <h1 className="m-0 font-heading text-[clamp(34px,4.5vw,49px)] leading-tight font-extrabold tracking-[-1.5px] max-[760px]:text-[35px]">
            Let's Talk <span className="text-primary-light">with Us</span>
          </h1>

          <p className="mx-auto mt-3 mb-0 text-[13px] leading-[1.8] text-[#d0c8df]">
            Ada pertanyaan atau ingin bekerja sama? Kami siap membantu.
          </p>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="relative z-[1] bg-transparent px-[7%] pt-[15px] pb-[55px] max-[760px]:pt-2.5 max-[760px]:pb-10">
        <div className="mx-auto grid max-w-[1050px] grid-cols-3 gap-[35px] max-[760px]:grid-cols-1 max-[760px]:gap-[15px]">
          {contactOptions.map((item) => (
            <div
              className="flex items-start gap-[15px] border-0 bg-transparent py-2.5"
              key={item.title}
            >
              <div className="shrink-0 text-[27px] leading-[1.3] text-[#b69aff]">
                {item.icon}
              </div>

              <div>
                <h2 className="m-0 mb-[7px] font-heading text-base font-bold">
                  {item.title}
                </h2>
                <p className="m-0 text-xs leading-[1.8] text-white/78">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEND MESSAGE */}
      <section
        className="relative z-[1] bg-transparent px-[7%] pt-[45px] pb-[60px] max-[760px]:px-[5%] max-[760px]:pt-[35px] max-[760px]:pb-[45px]"
        id="contact-form"
      >
        <div className="mx-auto w-full max-w-[1050px] rounded-[13px] border border-primary-light/30 bg-[#110c20d6] px-[42px] py-8 backdrop-blur-md max-[760px]:px-[18px] max-[760px]:py-6">
          <div className="mb-[23px]">
            <h2 className="m-0 font-heading text-[27px] font-extrabold max-[760px]:text-2xl">
              Send a Message
            </h2>

            <p className="mt-[7px] text-xs text-[#c0b8d0]">
              Sampaikan pertanyaan atau pesanmu kepada tim ENCORE.
            </p>
          </div>

          <form
            className="grid grid-cols-2 gap-x-[22px] gap-y-[17px] max-[760px]:grid-cols-1 max-[760px]:gap-[15px]"
            onSubmit={handleSubmit}
          >
            <div className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor="contact-name"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Nama Lengkap *
              </label>

              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                maxLength={100}
                required
                className={`${fieldInput} min-h-[44px]`}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor="contact-email"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Email *
              </label>

              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={254}
                required
                className={`${fieldInput} min-h-[44px]`}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor="contact-category"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Kategori *
              </label>

              <select
                id="contact-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={`${fieldInput} min-h-[44px] [&_option]:bg-surface [&_option]:text-white`}
              >
                <option value="" disabled>
                  Pilih kategori
                </option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-full flex min-w-0 flex-col gap-2 max-[760px]:col-auto">
              <label
                htmlFor="contact-message"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Pesan *
              </label>

              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="Tuliskan pesanmu di sini..."
                value={formData.message}
                onChange={handleChange}
                maxLength={2000}
                required
                className={`${fieldInput} min-h-[120px] resize-y leading-[1.7]`}
              />

              <small className="self-end text-[10px] text-[#aaa2bd]">
                {formData.message.length}/2000
              </small>
            </div>

            {notification && (
              <p
                className="col-span-full rounded-[7px] bg-[#8b5cf625] px-[13px] py-[11px] text-xs leading-[1.7] text-[#e0d5ff] max-[760px]:col-auto"
                role="status"
              >
                {notification}
              </p>
            )}

            <button
              type="submit"
              className="col-span-full flex min-h-[45px] w-full cursor-pointer items-center justify-center gap-[13px] rounded-[7px] border-0 bg-primary text-xs font-bold text-white transition duration-250 hover:bg-[#7042d4] max-[760px]:col-auto"
            >
              Send Message <span className="text-xl">›</span>
            </button>
          </form>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="relative z-[1] bg-transparent px-[7%] pt-[50px] pb-[70px] max-[760px]:px-[6%] max-[760px]:pt-10 max-[760px]:pb-[55px]">
        <div className="mx-auto mb-7 max-w-[700px] text-center">
          <h2 className="m-0 font-heading text-[clamp(25px,3.5vw,35px)] font-extrabold max-[760px]:text-[25px]">
            Frequently Asked Questions
          </h2>

          <p className="mt-[9px] text-xs text-[#c0b8d0]">
            Temukan jawaban atas pertanyaan seputar ENCORE.
          </p>
        </div>

        <div className="mx-auto flex max-w-[850px] flex-col gap-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFAQ === index;

            return (
              <article
                className={`overflow-hidden rounded-lg border bg-[#110c20d6] backdrop-blur-[10px] ${
                  isOpen ? "border-primary" : "border-primary-light/25"
                }`}
                key={faq.question}
              >
                <button
                  type="button"
                  className="flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-[18px] border-0 bg-transparent px-[19px] py-[15px] text-left text-white max-[760px]:p-3.5"
                  onClick={() => setOpenFAQ(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <strong className="text-[13px] leading-[1.6] font-semibold max-[760px]:text-xs">
                    {faq.question}
                  </strong>

                  <span className="flex size-[26px] shrink-0 items-center justify-center rounded-md bg-[#8b5cf625] text-[21px] text-[#c4b5fd]">
                    {isOpen ? "‹" : "›"}
                  </span>
                </button>

                {isOpen && (
                  <div className="pr-12 pb-4 pl-[19px] max-[760px]:px-3.5 max-[760px]:pb-[15px]">
                    <p className="m-0 text-xs leading-[1.8] text-[#c0b8d0]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* FOOTER (disembunyikan otomatis oleh SiteShell) */}
      <footer className="footer relative z-[1] flex flex-wrap items-center justify-between gap-5 border-t border-[#ffffff12] !bg-transparent px-[7%] py-[35px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:px-[5%] max-[700px]:py-[30px]">
        <Link
          href="/"
          className="font-heading text-[27px] font-extrabold tracking-[-1px] text-[#f8fafc]"
        >
          EN<span className="text-primary-light">CORE</span>
        </Link>

        <p className="text-[13px] text-muted">
          Temukan pengalaman. Ciptakan kenangan.
        </p>

        <small className="text-[13px] text-muted">© 2026 ENCORE</small>
      </footer>
    </main>
  );
}