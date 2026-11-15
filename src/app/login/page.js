"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../components/auth-styles";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("encoreRememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  const getRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      return redirect;
    }

    return null;
  };

  const handleLogin = async (e) => {
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

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const redirectPath = getRedirectPath();

    try {
      // 1. Login via Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (authError || !authData?.user) {
        setError("Email atau password salah.");
        return;
      }

      // 2. Ambil profil dan role dari tabel 'profiles'
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("Data profil pengguna tidak ditemukan di database.");
        return;
      }

      // 3. Cek status persetujuan Organizer & Petugas
      if (profile.role === "organizer" && profile.status !== "active") {
        await supabase.auth.signOut();
        setError(
          profile.status === "rejected"
            ? "Pendaftaran Organizer kamu ditolak oleh Admin."
            : "Akun Organizer kamu masih menunggu persetujuan Admin."
        );
        return;
      }

      if (profile.role === "checkin" && profile.status !== "active") {
        await supabase.auth.signOut();
        setError(
          "Akun Petugas Check-in kamu belum aktif atau sudah dinonaktifkan."
        );
        return;
      }

      const allowedRoles = ["buyer", "organizer", "checkin", "admin"];
      if (!allowedRoles.includes(profile.role)) {
        await supabase.auth.signOut();
        setError("Role akun tidak dikenali.");
        return;
      }

      // 4. Sinkronkan ke localStorage agar halaman lain yang belum dimigrasi tetap terbaca
      const currentUser = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        role: profile.role,
        organization: profile.organization || "",
        organizerId: profile.organizer_id || "",
        status: profile.status,
      };

      localStorage.setItem("encoreCurrentUser", JSON.stringify(currentUser));

      if (remember) {
        localStorage.setItem("encoreRememberEmail", normalizedEmail);
      } else {
        localStorage.removeItem("encoreRememberEmail");
      }

      // 5. Redirect sesuai role
      switch (profile.role) {
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
          router.push(redirectPath || "/buyer/dashboard");
          break;
        default:
          setError("Role akun tidak dikenali.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
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

          <button type="submit" disabled={loading} className={auth.submit}>
            {loading ? "Memproses..." : "Masuk"}
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