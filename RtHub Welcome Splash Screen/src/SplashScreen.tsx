interface Props {
  onLogin: () => void;
}

export default function SplashScreen({ onLogin }: Props) {
  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        width: 393,
        height: 852,
        background: "linear-gradient(160deg, #0F172A 0%, #131E32 45%, #1E293B 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 340, height: 340, top: -60, left: -80,
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280, bottom: 160, right: -60,
          background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1" style={{ height: 44 }}>
        <span className="text-white font-semibold text-[15px] tracking-tight">9:41</span>
        <div className="flex items-center gap-[6px]">
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0" y="7" width="3" height="5" rx="0.8" fill="white" />
            <rect x="4.5" y="4.5" width="3" height="7.5" rx="0.8" fill="white" />
            <rect x="9" y="2" width="3" height="10" rx="0.8" fill="white" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.8" fill="white" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11S8.83 12.5 8 12.5 6.5 11.83 6.5 11 7.17 9.5 8 9.5Z" fill="white" />
            <path d="M3.5 6.5C4.9 5.1 6.85 4.25 9 4.25S13.1 5.1 14.5 6.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M1 4C3.2 1.8 5.95 0.5 8.75 0.5S14.3 1.8 16 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="white" strokeOpacity="0.35" />
            <rect x="2" y="2" width="16" height="8" rx="1.5" fill="white" />
            <path d="M22.5 4v4c1.1-.4 1.1-3.6 0-4Z" fill="white" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-6">
        <div
          className="relative flex items-center justify-center mb-7"
          style={{
            width: 96, height: 96, borderRadius: 28,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 0 40px rgba(99,102,241,0.35), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="absolute inset-0 rounded-[28px]" style={{ background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="homeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="url(#homeGrad)" strokeWidth="1.6" />
            <path d="M9 21V12h6v9" stroke="url(#homeGrad)" strokeWidth="1.6" />
            <circle cx="12" cy="8.5" r="1.2" fill="rgba(165,180,252,0.6)" />
          </svg>
        </div>
        <h1 className="text-white font-extrabold tracking-tight mb-2" style={{ fontSize: 42, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          RtHub
        </h1>
        <p className="text-center font-medium mb-10" style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.55, maxWidth: 260 }}>
          Hunian Cerdas, Lingkungan Nyaman &amp; Transparan
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Iuran Digital", "Pengumuman RT", "Lapor Warga"].map((label) => (
            <span key={label} className="font-semibold" style={{ fontSize: 12.5, color: "#cbd5e1", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "6px 14px", backdropFilter: "blur(12px)" }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-3 px-8" style={{ paddingBottom: 32 }}>
        <button
          onClick={onLogin}
          className="w-full font-bold flex items-center justify-center"
          style={{ height: 54, background: "#ffffff", color: "#0F172A", borderRadius: 16, fontSize: 16, letterSpacing: "-0.01em", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        >
          Masuk Akun
        </button>
        <button
          className="w-full font-semibold flex items-center justify-center"
          style={{ height: 54, background: "rgba(255,255,255,0.06)", color: "#e2e8f0", borderRadius: 16, fontSize: 16, border: "1.5px solid rgba(255,255,255,0.22)", backdropFilter: "blur(16px)" }}
        >
          Daftarkan RT Baru
        </button>
        <div className="flex justify-center pt-1">
          <div style={{ width: 134, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.28)" }} />
        </div>
      </div>
    </div>
  );
}
