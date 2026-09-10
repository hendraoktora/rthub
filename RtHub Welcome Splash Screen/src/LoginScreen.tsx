import { useState } from "react";

interface Props {
  onBack: () => void;
  onSuccess?: () => void;
}

function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? "#0F172A" : "#0F172A";
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1" style={{ height: 44 }}>
      <span className="font-semibold text-[15px] tracking-tight" style={{ color }}>9:41</span>
      <div className="flex items-center gap-[6px]">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.8" fill={color} />
          <rect x="4.5" y="4.5" width="3" height="7.5" rx="0.8" fill={color} />
          <rect x="9" y="2" width="3" height="10" rx="0.8" fill={color} />
          <rect x="13.5" y="0" width="3" height="12" rx="0.8" fill={color} />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11S8.83 12.5 8 12.5 6.5 11.83 6.5 11 7.17 9.5 8 9.5Z" fill={color} />
          <path d="M3.5 6.5C4.9 5.1 6.85 4.25 9 4.25S13.1 5.1 14.5 6.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M1 4C3.2 1.8 5.95 0.5 8.75 0.5S14.3 1.8 16 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.4" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={color} strokeOpacity="0.3" />
          <rect x="2" y="2" width="16" height="8" rx="1.5" fill={color} />
          <path d="M22.5 4v4c1.1-.4 1.1-3.6 0-4Z" fill={color} fillOpacity="0.35" />
        </svg>
      </div>
    </div>
  );
}

export default function LoginScreen({ onBack, onSuccess }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: 393,
        height: 852,
        background: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Subtle top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: 220,
          background: "linear-gradient(180deg, rgba(15,23,42,0.04) 0%, transparent 100%)",
        }}
      />

      <StatusBar />

      {/* ── Header ── */}
      <div className="flex flex-col px-6 pt-2 pb-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 self-start"
          style={{ color: "#475569", fontSize: 14, fontWeight: 600, background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#475569" strokeWidth="2" />
          </svg>
          Kembali
        </button>

        {/* Logo mark + wordmark row */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
              boxShadow: "0 4px 14px rgba(15,23,42,0.22)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="loginHomeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a5b4fc" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="url(#loginHomeGrad)" strokeWidth="1.7" />
              <path d="M9 21V12h6v9" stroke="url(#loginHomeGrad)" strokeWidth="1.7" />
            </svg>
          </div>
          <span className="font-extrabold" style={{ fontSize: 22, color: "#0F172A", letterSpacing: "-0.03em" }}>RtHub</span>
        </div>

        {/* Title + subtitle */}
        <h2 className="font-extrabold mb-1" style={{ fontSize: 28, color: "#0F172A", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          Masuk Akun
        </h2>
        <p className="font-medium" style={{ fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>
          Kelola lingkungan dan iuran RT Anda
        </p>
      </div>

      {/* ── Form ── */}
      <div className="flex flex-col gap-4 px-6 flex-1">

        {/* Identifier field */}
        <div>
          <label className="block font-semibold mb-2" style={{ fontSize: 13, color: "#374151" }}>
            No. WhatsApp / Email
          </label>
          <div
            className="flex items-center gap-3"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "0 16px",
              height: 54,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Phone/email icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="5" y="2" width="14" height="20" rx="3" stroke="#94A3B8" strokeWidth="1.6" />
              <circle cx="12" cy="17" r="1.2" fill="#94A3B8" />
              <path d="M9 6h6" stroke="#94A3B8" strokeWidth="1.6" />
            </svg>
            <input
              type="text"
              placeholder="08xx atau nama@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="flex-1 outline-none bg-transparent font-medium"
              style={{ fontSize: 14.5, color: "#0F172A" }}
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label className="block font-semibold mb-2" style={{ fontSize: 13, color: "#374151" }}>
            Kata Sandi
          </label>
          <div
            className="flex items-center gap-3"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "0 16px",
              height: 54,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* Lock icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="5" y="11" width="14" height="10" rx="2.5" stroke="#94A3B8" strokeWidth="1.6" />
              <path d="M8 11V7a4 4 0 018 0v4" stroke="#94A3B8" strokeWidth="1.6" />
              <circle cx="12" cy="16" r="1.2" fill="#94A3B8" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none bg-transparent font-medium"
              style={{ fontSize: 14.5, color: "#0F172A" }}
            />
            {/* Eye toggle */}
            <button
              onClick={() => setShowPassword((v) => !v)}
              className="flex-shrink-0"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.11 1 12c.74-1.88 1.96-3.56 3.46-4.89M9.9 4.24A9.12 9.12 0 0112 4c5 0 9.27 3.89 11 8-1 2.5-2.5 4.5-4.46 6.07M3 3l18 18" stroke="#94A3B8" strokeWidth="1.6" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#94A3B8" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="3" stroke="#94A3B8" strokeWidth="1.6" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              onClick={() => setRemember((v) => !v)}
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: remember ? "none" : "1.5px solid #CBD5E1",
                background: remember ? "#0F172A" : "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {remember && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className="font-medium" style={{ fontSize: 13.5, color: "#475569" }}>Ingat Saya</span>
          </label>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <span className="font-semibold" style={{ fontSize: 13.5, color: "#3B82F6" }}>Lupa Password?</span>
          </button>
        </div>

        {/* Primary CTA */}
        <button
          className="w-full font-bold flex items-center justify-center mt-2"
          onClick={onSuccess}
          style={{
            height: 54,
            background: "#0F172A",
            color: "#FFFFFF",
            borderRadius: 14,
            fontSize: 16,
            letterSpacing: "-0.01em",
            border: "none",
            boxShadow: "0 6px 20px rgba(15,23,42,0.28)",
            cursor: "pointer",
          }}
        >
          Masuk
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          <span className="font-medium" style={{ fontSize: 12.5, color: "#94A3B8" }}>atau</span>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        </div>

        {/* Register links */}
        <p className="text-center font-medium" style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.6 }}>
          Belum punya akun?{" "}
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <span className="font-bold" style={{ color: "#0F172A" }}>Daftar sebagai Warga</span>
          </button>
          {" "}atau{" "}
          <button style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <span className="font-bold" style={{ color: "#3B82F6" }}>Daftarkan RT Anda</span>
          </button>
        </p>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 pt-4">
        <div style={{ width: 134, height: 5, borderRadius: 99, background: "rgba(15,23,42,0.15)" }} />
      </div>
    </div>
  );
}
