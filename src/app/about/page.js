
"use client";

import { useState } from "react";

const SUPPORT_EMAIL = "";

const categories = [
  "Pertanyaan Tiket",
  "Pembayaran",
  "Informasi Konser",
  "Akun Pengguna",
  "Kerja Sama",
  "Lainnya",
];

const fieldInput =
  "w-full rounded-[7px] border border-[#493d60] bg-[#090714e0] px-3.5 py-3 text-xs text-white outline-none placeholder:text-[#91889f] focus:border-primary-light focus:shadow-[0_0_0_3px_#8b5cf620]";

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });

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

    const subject = encodeURIComponent(
      `[ENCORE] ${formData.category}`
    );

    const body = encodeURIComponent(
      `Halo Tim ENCORE,\n\n` +
        `Nama: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Kategori: ${formData.category}\n\n` +
        `Pesan:\n${formData.message}`
    );

    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    setNotification(
      "Aplikasi email akan dibuka. Silakan kirim pesanmu."
    );
  };

  return (
    <main className="relative isolate min-h-screen w-full overflow-hidden bg-background text-white">
      <div
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-top bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/bg%20concerts.jpg")',
        }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(9,7,20,0.58)_0%,rgba(9,7,20,0.72)_30%,rgba(9,7,20,0.82)_65%,rgba(9,7,20,0.93)_100%)]" />

      <section className="relative z-[1] flex min-h-[270px] items-center justify-center bg-transparent px-[7%] pt-[65px] pb-[35px] text-center max-[760px]:min-h-[240px] max-[760px]:px-[6%] max-[760px]:pt-[50px] max-[760px]:pb-[25px]">
        <div className="mx-auto max-w-[800px]">
          <h1 className="m-0 font-heading text-[clamp(34px,4.5vw,49px)] leading-tight font-extrabold tracking-[-1.5px]">
            About <span className="text-primary-light">ENCORE</span>
          </h1>

          <p className="mx-auto mt-3 mb-0 text-[14px] font-medium text-[#d9c8ff]">
            Every Concert Starts with ENCORE.
          </p>

          <p className="mx-auto mt-[23px] mb-0 max-w-[720px] text-[13px] leading-[2] text-[#d0c8df]">
            ENCORE adalah platform eksplorasi konser dan
            pemesanan tiket yang membantu kamu menemukan
            berbagai acara musik favorit dalam satu tempat.
            Mulai dari mencari informasi konser, melihat
            detail acara, hingga merencanakan pembelian tiket,
            ENCORE hadir untuk membuat pengalaman menikmati
            live music jadi lebih mudah dan menyenangkan.
          </p>
        </div>
      </section>

      <section
        className="relative z-[1] bg-transparent px-[7%] pt-[20px] pb-[80px] max-[760px]:px-[5%] max-[760px]:pt-[15px] max-[760px]:pb-[55px]"
        id="contact-form"
      >
        <div className="mx-auto w-full max-w-[1050px] rounded-[13px] border border-primary-light/30 bg-[#110c20d6] px-[42px] py-8 backdrop-blur-md max-[760px]:px-[18px] max-[760px]:py-6">
          <div className="mb-[23px]">
            <h2 className="m-0 font-heading text-[27px] font-extrabold max-[760px]:text-2xl">
              Send a Message
            </h2>

            <p className="mt-[7px] text-xs leading-[1.8] text-[#c0b8d0]">
              Ada pertanyaan tentang konser atau pemesanan tiket?
              Tulis pesanmu di bawah ini.
            </p>
          </div>

          <form
            className="grid grid-cols-2 gap-x-[22px] gap-y-[17px] max-[760px]:grid-cols-1 max-[760px]:gap-[15px]"
            onSubmit={handleSubmit}
          >
            <div className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor="about-name"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Nama Lengkap *
              </label>

              <input
                id="about-name"
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
                htmlFor="about-email"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Email *
              </label>

              <input
                id="about-email"
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
                htmlFor="about-category"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Kategori *
              </label>

              <select
                id="about-category"
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
                htmlFor="about-message"
                className="text-xs font-semibold text-[#eee8f8]"
              >
                Pesan *
              </label>

              <textarea
                id="about-message"
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

          <p className="mt-4 mb-0 text-center text-[11px] leading-[1.8] text-[#aaa2bd]">
            Jangan membagikan kata sandi, kode OTP,
            atau informasi pembayaran yang bersifat rahasia.
          </p>
        </div>
      </section>
    </main>
  );
}
