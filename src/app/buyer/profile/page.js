"use client";
 
import { useEffect, useState } from "react";
import BuyerAccountLayout from "../../../components/buyer-account-layout";
 
/* ---------- kelas Tailwind yang dipakai berulang ---------- */
const formGroup =
  "grid grid-cols-[170px_minmax(0,1fr)] items-center gap-[18px] max-[600px]:grid-cols-1 max-[600px]:gap-[9px]";
const formLabel = "text-sm font-semibold text-[#eee6f8]";
const formInput =
  "box-border min-h-12 w-full rounded-[10px] border border-[#40324f] bg-[#0e0a16] px-[15px] text-sm text-white outline-none focus:border-[#a36aff] disabled:bg-[#21192c] disabled:text-[#9688a7]";
 
export default function BuyerProfilePage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
 
  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("encoreCurrentUser") || "null"
      );
 
      if (savedUser) {
        setUser(savedUser);
        setName(savedUser.name || "");
        setPhone(savedUser.phone || "");
      }
    } catch (error) {
      console.error("Gagal membaca akun:", error);
    }
  }, []);
 
  const handleSave = (event) => {
    event.preventDefault();
 
    if (!user) return;
 
    const updatedUser = {
      ...user,
      name,
      phone,
    };
 
    localStorage.setItem(
      "encoreCurrentUser",
      JSON.stringify(updatedUser)
    );
 
    try {
      const users = JSON.parse(
        localStorage.getItem("encoreUsers") || "[]"
      );
 
      const updatedUsers = users.map((item) =>
        item.id === user.id || item.email === user.email
          ? { ...item, name, phone }
          : item
      );
 
      localStorage.setItem(
        "encoreUsers",
        JSON.stringify(updatedUsers)
      );
    } catch (error) {
      console.error("Gagal memperbarui daftar pengguna:", error);
    }
 
    setUser(updatedUser);
    setMessage("Profil berhasil disimpan!");
  };
 
  return (
    <BuyerAccountLayout>
      <div className="mb-[35px]">
        <span className="text-[11px] font-extrabold tracking-[2px] text-[#b58aff]">
          AKUN ENCORE
        </span>
        <h1 className="my-2.5 font-heading text-[30px] max-[600px]:text-[25px]">
          Profil Saya
        </h1>
        <p className="text-sm text-[#b9abc9]">
          Kelola informasi pribadi akun ENCORE kamu.
        </p>
      </div>
 
      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <div className="flex items-center gap-5 border-b border-[#382b49] pb-[25px]">
          <div className="grid size-[72px] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#a66aff,#6334a0)] text-[30px] font-extrabold text-white">
            {(name || "B").charAt(0).toUpperCase()}
          </div>
 
          <div>
            <strong>Foto Profil</strong>
            <p className="text-[13px] text-[#b9abc9]">
              Foto profil akun kamu.
            </p>
          </div>
        </div>
 
        <div className={formGroup}>
          <label className={formLabel}>Nama Lengkap</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className={formInput}
          />
        </div>
 
        <div className={formGroup}>
          <label className={formLabel}>Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className={formInput}
          />
        </div>
 
        <div className={formGroup}>
          <label className={formLabel}>Nomor Telepon</label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Masukkan nomor telepon"
            className={formInput}
          />
        </div>
 
        <div className="mt-3 flex items-center justify-end gap-[15px] border-t border-[#382b49] pt-[25px]">
          {message && (
            <span className="mr-auto text-[#8be3a8]">{message}</span>
          )}
 
          <button
            type="submit"
            className="cursor-pointer rounded-[10px] border-0 bg-[#8050d5] px-[22px] py-3.5 font-bold text-white"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </BuyerAccountLayout>
  );
}
