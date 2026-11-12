
"use client";

import { useEffect, useState } from "react";
import BuyerAccountLayout from "../../../components/buyer-account-layout";

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
      <div className="buyer-panel-heading">
        <span className="buyer-panel-eyebrow">AKUN ENCORE</span>
        <h1>Profil Saya</h1>
        <p>Kelola informasi pribadi akun ENCORE kamu.</p>
      </div>

      <form className="buyer-profile-form" onSubmit={handleSave}>
        <div className="buyer-profile-photo-row">
          <div className="buyer-profile-large-avatar">
            {(name || "B").charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>Foto Profil</strong>
            <p>Foto profil akun kamu.</p>
          </div>
        </div>

        <div className="buyer-form-group">
          <label>Nama Lengkap</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="buyer-form-group">
          <label>Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
          />
        </div>

        <div className="buyer-form-group">
          <label>Nomor Telepon</label>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Masukkan nomor telepon"
          />
        </div>

        <div className="buyer-form-footer">
          {message && (
            <span className="buyer-save-message">{message}</span>
          )}

          <button type="submit" className="buyer-save-button">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </BuyerAccountLayout>
  );
}
