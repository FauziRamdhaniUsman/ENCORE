"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../components/auth-styles";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState("buyer");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    if (role === "organizer" && !organization.trim()) {
      setError("Nama organisasi wajib diisi.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      const users = JSON.parse(
        localStorage.getItem("encoreUsers") || "[]"
      );

      const existingUser = users.find(
        (user) =>
          user.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existingUser) {
        setError("Email sudah terdaftar. Silakan login.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        organization: role === "organizer" ? organization.trim() : "",
        email: email.trim().toLowerCase(),
        password,
        role,
        status: role === "buyer" ? "active" : "pending",
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);

      localStorage.setItem("encoreUsers", JSON.stringify(users));

      alert(
        role === "buyer"
          ? "Pendaftaran Buyer berhasil! Silakan login."
          : "Pendaftaran Organizer berhasil! Akun menunggu persetujuan admin."
      );

      router.push("/login");
    } catch (err) {
      setError("Pendaftaran gagal. Silakan coba kembali.");
    }
  };

    const roleCard = (value) =>
    `${auth.roleCard} ${
      role === value ? auth.roleCardSelected : auth.roleCardIdle
    }`;

  return (
    <main className={auth.page}>
      <Link href="/" className={auth.logo}>
        EN<span className={auth.logoAccent}>CORE</span>
      </Link>

      <div className={auth.card}>
        <div className={auth.heading}>
          <span className={auth.eyebrow}>JOIN THE EXPERIENCE</span>

          <h1 className={auth.title}>Buat Akun ENCORE</h1>

          <p className={auth.subtitle}>
            Bergabung dan nikmati pengalaman konser yang lebih mudah
            bersama ENCORE.
          </p>
        </div>

        <div className={auth.roleHeading}>
          <label className={auth.roleLabel}>Pilih Jenis Akun</label>
          <p className={auth.roleHint}>Daftar sebagai siapa?</p>
        </div>

        <div className={auth.roleGrid}>
          <button
            type="button"
            className={roleCard("buyer")}
            onClick={() => {
              setRole("buyer");
              setError("");
            }}
            aria-pressed={role === "buyer"}
          >
            <span className={auth.roleIcon}>🎟️</span>
            <strong className={auth.roleName}>Buyer</strong>
            <small className={auth.roleDesc}>Ingin membeli tiket konser</small>
            <span className={auth.roleCheck}>
              {role === "buyer" ? "✓" : ""}
            </span>
          </button>

          <button
            type="button"
            className={roleCard("organizer")}
            onClick={() => {
              setRole("organizer");
              setError("");
            }}
            aria-pressed={role === "organizer"}
          >
            <span className={auth.roleIcon}>🎤</span>
            <strong className={auth.roleName}>Organizer</strong>
            <small className={auth.roleDesc}>
              Ingin menyelenggarakan konser
            </small>
            <span className={auth.roleCheck}>
              {role === "organizer" ? "✓" : ""}
            </span>
          </button>
        </div>

        <form className={auth.form} onSubmit={handleRegister}>
          <label htmlFor="name" className={auth.label}>
            Nama Lengkap
          </label>

          <input
            id="name"
            type="text"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={auth.input}
          />

          {role === "organizer" && (
            <>
              <label htmlFor="organization" className={auth.label}>
                Nama Organisasi / Penyelenggara
              </label>

              <input
                id="organization"
                type="text"
                placeholder="Masukkan nama organisasi"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className={auth.input}
              />
            </>
          )}

          <label htmlFor="register-email" className={auth.label}>
            Email
          </label>

          <input
            id="register-email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={auth.input}
          />

          <label htmlFor="register-password" className={auth.label}>
            Password
          </label>

          <div className={auth.passwordWrap}>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={auth.passwordInput}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={auth.passwordToggle}
            >
              {showPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          <label htmlFor="confirm-password" className={auth.label}>
            Konfirmasi Password
          </label>

          <div className={auth.passwordWrap}>
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Masukkan ulang password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={auth.passwordInput}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={auth.passwordToggle}
            >
              {showConfirmPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          {role === "organizer" && (
            <p className={auth.notice}>
              Pendaftaran Organizer akan melalui proses verifikasi Admin
              sebelum dapat menerbitkan konser.
            </p>
          )}

          {error && (
            <p className={auth.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={auth.submit}>
            Daftar sebagai {role === "buyer" ? "Buyer" : "Organizer"}
          </button>
        </form>

        <p className={auth.switchText}>
          Sudah punya akun?{" "}
          <Link href="/login" className={auth.switchLink}>
            Masuk sekarang
          </Link>
        </p>
      </div>

      <p className={auth.footer}>© 2026 ENCORE. All rights reserved.</p>
    </main>
  );
}