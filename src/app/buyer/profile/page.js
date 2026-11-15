
"use client";

import { useEffect, useState } from "react";
import BuyerAccountLayout from "../../../components/buyer-account-layout";

const formGroup =
  "grid grid-cols-[190px_minmax(0,1fr)] items-center gap-[20px] max-[650px]:grid-cols-1 max-[650px]:gap-[9px]";

const formLabel =
  "text-sm font-semibold text-[#eee6f8]";

const formInput =
  "box-border min-h-[49px] w-full rounded-[11px] border border-[#40324f] bg-[#0e0a16] px-[15px] text-sm text-white outline-none transition placeholder:text-[#897a9d] focus:border-[#a36aff] disabled:bg-[#21192c] disabled:text-[#9688a7]";

export default function BuyerProfilePage() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  // MEMUAT DATA PROFIL
  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );

      if (savedUser) {
        setUser(savedUser);
        setName(savedUser.name || "");
        setPhone(savedUser.phone || "");
        setAvatar(
          savedUser.avatar ||
          savedUser.avatar_url ||
          savedUser.profileImage ||
          ""
        );
      }
    } catch (error) {
      console.error("Gagal membaca profil:", error);
    }
  }, []);

  // GANTI FOTO PROFIL
  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setIsError(true);
      setMessage("File harus berupa gambar.");
      event.target.value = "";
      return;
    }

    if (file.size > 700 * 1024) {
      setIsError(true);
      setMessage("Ukuran foto maksimal 700 KB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(reader.result);
      setMessage("");
      setIsError(false);
    };

    reader.onerror = () => {
      setIsError(true);
      setMessage("Gagal membaca foto profil.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // HAPUS FOTO PROFIL
  const handleRemoveAvatar = () => {
    setAvatar("");
    setMessage("");
    setIsError(false);
  };

  // SIMPAN PERUBAHAN PROFIL
  const handleSave = (event) => {
    event.preventDefault();

    if (!user) return;

    setMessage("");
    setIsError(false);

    if (!name.trim()) {
      setIsError(true);
      setMessage("Nama lengkap wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      const updatedUser = {
        ...user,
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar,
      };

      // SIMPAN AKUN YANG SEDANG LOGIN
      localStorage.setItem(
        "encoreCurrentUser",
        JSON.stringify(updatedUser)
      );

      // PERBARUI DATA PENGGUNA
      const users = JSON.parse(
        localStorage.getItem("encoreUsers") || "[]"
      );

      const updatedUsers = users.map((item) =>
        item.id === user.id || item.email === user.email
          ? {
              ...item,
              name: name.trim(),
              phone: phone.trim(),
              avatar: avatar,
            }
          : item
      );

      localStorage.setItem(
        "encoreUsers",
        JSON.stringify(updatedUsers)
      );

      // PERBARUI STATE PROFIL
      setUser(updatedUser);

      // SINKRONISASI NAVBAR
      window.dispatchEvent(
        new Event("encoreUserUpdated")
      );

      // SINKRONISASI KOMPONEN AKUN
      window.dispatchEvent(
        new Event("encore-profile-updated")
      );

      setIsError(false);
      setMessage("Profil berhasil disimpan!");

    } catch (error) {
      console.error("Gagal menyimpan profil:", error);

      setIsError(true);
      setMessage(
        "Gagal menyimpan profil. Periksa kapasitas penyimpanan browser."
      );
    } finally {
      setSaving(false);
    }
  };

  const initial = (name || "B").charAt(0).toUpperCase();

  return (
    <BuyerAccountLayout>

      {/* HEADER PROFIL */}
      <div className="mb-[38px]">

        <span className="text-[11px] font-extrabold tracking-[2px] text-[#b58aff]">
          AKUN ENCORE
        </span>

        <h1 className="my-2.5 font-heading text-[30px] font-bold text-white max-[600px]:text-[25px]">
          Profil
        </h1>

        <p className="text-sm text-[#b9abc9]">
          Kelola informasi pribadi akun ENCORE kamu.
        </p>

      </div>

      <form
        className="flex flex-col gap-[25px]"
        onSubmit={handleSave}
      >

        {/* FOTO PROFIL */}
        <div className="grid grid-cols-[190px_minmax(0,1fr)] items-center gap-5 border-b border-[#382b49] pb-[30px] max-[650px]:grid-cols-1">

          <label className={formLabel}>
            Gambar Profil
          </label>

          <div className="flex flex-wrap items-center gap-7">

            <div className="grid size-[78px] shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#a66aff,#6334a0)] text-[27px] font-extrabold text-white">

              {avatar ? (
                <img
                  src={avatar}
                  alt="Foto Profil Buyer"
                  className="size-full object-cover"
                />
              ) : (
                initial
              )}

            </div>

            <label className="inline-flex min-h-[47px] cursor-pointer items-center gap-2 rounded-full border border-[#49345f] bg-[#171020] px-[19px] text-sm font-semibold text-[#e5d5fa] transition hover:border-[#a766e8] hover:bg-[#302044]">

              <span>▧</span>
              Ganti Foto

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

            </label>

            {avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs font-semibold text-[#ff9caf] transition hover:text-white"
              >
                Hapus Foto
              </button>
            )}

          </div>

        </div>

        {/* NAMA LENGKAP */}
        <div className={formGroup}>

          <label className={formLabel}>
            Nama Lengkap
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Masukkan nama lengkap"
            required
            className={formInput}
          />

        </div>

        {/* EMAIL */}
        <div className={formGroup}>

          <label className={formLabel}>
            Email
          </label>

          <input
            type="email"
            value={user?.email || ""}
            disabled
            className={formInput}
          />

        </div>

        {/* NOMOR TELEPON */}
        <div className={formGroup}>

          <label className={formLabel}>
            Nomor Telepon
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Masukkan nomor telepon"
            className={formInput}
          />

        </div>

        {/* PESAN BERHASIL / ERROR */}
        {message && (
          <div
            className={`rounded-[10px] p-3 text-[13px] ${
              isError
                ? "bg-[#48232b] text-[#ff9a9a]"
                : "bg-[#183d30] text-[#8be3a8]"
            }`}
          >
            {message}
          </div>
        )}

        {/* TOMBOL SIMPAN */}
        <div className="mt-[15px] flex justify-end border-t border-[#382b49] pt-[30px]">

          <button
            type="submit"
            disabled={saving}
            className="min-h-[49px] cursor-pointer rounded-[11px] border-0 bg-[#8050d5] px-[23px] text-sm font-bold text-white transition hover:bg-[#9665e9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>

        </div>

      </form>

    </BuyerAccountLayout>
  );
}
