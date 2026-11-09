
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

    // AKUN DEMO BUYER
    if (
      normalizedEmail === "demo@encore.com" &&
      password === "encore123"
    ) {
      const demoUser = {
        name: "Demo Buyer",
        email: "demo@encore.com",
        role: "buyer",
        status: "active",
      };

      localStorage.setItem(
        "encoreCurrentUser",
        JSON.stringify(demoUser)
      );

      router.push(redirectPath || "/buyer/dashboard");
      return;
    }

    // AKUN DEMO ADMIN
    if (
      normalizedEmail === "admin@encore.com" &&
      password === "admin123"
    ) {
      const adminUser = {
        id: "admin-encore",
        name: "ENCORE Admin",
        email: "admin@encore.com",
        role: "admin",
        status: "active",
      };

      localStorage.setItem(
        "encoreCurrentUser",
        JSON.stringify(adminUser)
      );

      if (remember) {
        localStorage.setItem(
          "encoreRememberEmail",
          normalizedEmail
        );
      } else {
        localStorage.removeItem("encoreRememberEmail");
      }

      router.push("/admin/dashboard");
      return;
    }

    // CEK AKUN HASIL REGISTER
    try {
      const users = JSON.parse(
        localStorage.getItem("encoreUsers") || "[]"
      );

      const user = users.find(
        (item) =>
          item.email.toLowerCase() === normalizedEmail &&
          item.password === password
      );

      if (!user) {
        setError("Email atau password salah.");
        return;
      }

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

      const currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization || "",
        status: user.status,
      };

      localStorage.setItem(
        "encoreCurrentUser",
        JSON.stringify(currentUser)
      );

      if (remember) {
        localStorage.setItem(
          "encoreRememberEmail",
          normalizedEmail
        );
      } else {
        localStorage.removeItem("encoreRememberEmail");
      }

      if (user.role === "organizer") {
        router.push("/organizer/dashboard");
      } else if (user.role === "buyer") {
        router.push(redirectPath || "/buyer/dashboard");
      } else {
        setError("Role akun tidak dikenali.");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba kembali.");
    }
  };

  return (
    <main className="auth-page">
      <Link href="/" className="auth-logo">
        EN<span>CORE</span>
      </Link>

      <div className="auth-card">
        <div className="auth-heading">
          <span className="eyebrow">WELCOME BACK</span>

          <h1>Selamat Datang Kembali</h1>

          <p>
            Masuk ke akun ENCORE untuk melanjutkan
            pengalaman konsermu.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>

          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          <div className="auth-extra">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ingat saya
            </label>

            <Link href="/forgot-password">
              Lupa password?
            </Link>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="auth-submit">
            Masuk
          </button>
        </form>

        <p className="auth-switch">
          Belum punya akun?{" "}
          <Link href="/register">Daftar sekarang</Link>
        </p>
      </div>

      <p className="auth-footer">
        © 2026 ENCORE. All rights reserved.
      </p>
    </main>
  );
}
