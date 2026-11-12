
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../components/auth-styles";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const getRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
    ) {
      return redirect;
    }

    return null;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const redirectPath = getRedirectPath();

    try {
      let user = null;

      // DEMO BUYER
      if (
        normalizedEmail === "demo@encore.com" &&
        password === "encore123"
      ) {
        user = {
          id: "demo-buyer",
          name: "Demo Buyer",
          email: normalizedEmail,
          role: "buyer",
          status: "active",
        };
      }

      // DEMO ADMIN
      else if (
        normalizedEmail === "admin@encore.com" &&
        password === "admin123"
      ) {
        user = {
          id: "admin-encore",
          name: "ENCORE Admin",
          email: normalizedEmail,
          role: "admin",
          status: "active",
        };
      }

      // AKUN REGISTER DAN PETUGAS
      else {
        const users = JSON.parse(
          localStorage.getItem("encoreUsers") || "[]"
        );

        if (!Array.isArray(users)) {
          setError("Data pengguna tidak valid.");
          return;
        }

        user = users.find(
          (item) =>
            item.email?.toLowerCase() === normalizedEmail &&
            item.password === password
        );
      }

      // CEK AKUN
      if (!user) {
        setError("Email atau password salah.");
        return;
      }

      // CEK STATUS ORGANIZER
      if (
        user.role === "organizer" &&
        user.status !== "active"
      ) {
        setError(
          user.status === "rejected"
            ? "Pendaftaran Organizer kamu ditolak oleh Admin."
            : "Akun Organizer kamu masih menunggu persetujuan Admin."
        );
        return;
      }

      // CEK STATUS PETUGAS
      if (
        user.role === "checkin" &&
        user.status !== "active"
      ) {
        setError(
          "Akun Petugas Check-in kamu belum aktif atau sudah dinonaktifkan."
        );
        return;
      }

      // CEK ROLE
      const allowedRoles = [
        "buyer",
        "organizer",
        "checkin",
        "admin",
      ];

      if (!allowedRoles.includes(user.role)) {
        setError("Role akun tidak dikenali.");
        return;
      }

      // SIMPAN SESSION SIMULASI
      const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization || "",
        organizerId: user.organizerId || "",
        eventIds: Array.isArray(user.eventIds)
          ? user.eventIds
          : [],
        status: user.status,
      };

      localStorage.setItem(
        "encoreCurrentUser",
        JSON.stringify(currentUser)
      );

      // INGAT EMAIL
      if (remember) {
        localStorage.setItem(
          "encoreRememberEmail",
          normalizedEmail
        );
      } else {
        localStorage.removeItem("encoreRememberEmail");
      }

      // REDIRECT BERDASARKAN ROLE
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;

        case "organizer":
          router.push("/organizer/dashboard");
          break;

        case "checkin":
          router.push("/organizer/checkin");
          break;

        case "buyer":
          router.push(
            redirectPath || "/buyer/dashboard"
          );
          break;

        default:
          setError("Role akun tidak dikenali.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan. Silakan coba kembali.");
    }
  };

    return (
    <main className={auth.page}>
      <Link href="/" className={auth.logo}>
        EN<span className={auth.logoAccent}>CORE</span>
      </Link>

      <div className={auth.card}>
        <div className={auth.heading}>
          <span className={auth.eyebrow}>WELCOME BACK</span>

          <h1 className={auth.title}>Selamat Datang Kembali</h1>

          <p className={auth.subtitle}>
            Masuk ke akun ENCORE untuk melanjutkan pengalaman konsermu.
          </p>
        </div>

        <form className={auth.form} onSubmit={handleLogin}>
          <label htmlFor="email" className={auth.label}>
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={auth.input}
          />

          <label htmlFor="password" className={auth.label}>
            Password
          </label>

          <div className={auth.passwordWrap}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

          <div className={auth.extra}>
            <label className={auth.remember}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className={auth.checkbox}
              />
              Ingat saya
            </label>

            <Link href="/forgot-password" className={auth.link}>
              Lupa password?
            </Link>
          </div>

          {error && (
            <p className={auth.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={auth.submit}>
            Masuk
          </button>
        </form>

        <p className={auth.switchText}>
          Belum punya akun?{" "}
          <Link href="/register" className={auth.switchLink}>
            Daftar sekarang
          </Link>
        </p>
      </div>

      <p className={auth.footer}>© 2026 ENCORE. All rights reserved.</p>
    </main>
  );
}
