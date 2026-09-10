import { useState } from "react";

const DAYS = [
  { label: "Sen", date: 8 },
  { label: "Sel", date: 9 },
  { label: "Rab", date: 10 },
  { label: "Kam", date: 11 },
  { label: "Jum", date: 12 },
];

const EVENTS = [
  {
    title: "Kerja Bakti Bersih Saluran",
    time: "06.00 – 09.00 WIB",
    loc: "Sepanjang Gang RW 05",
    tag: "Kegiatan",
    tagColor: "#16A34A",
    tagBg: "#DCFCE7",
    dot: "#16A34A",
    day: 9,
  },
  {
    title: "Fogging DBD Blok B & C",
    time: "09.30 – 11.00 WIB",
    loc: "Blok B & C, Perumahan Sukamaju",
    tag: "Kesehatan",
    tagColor: "#D97706",
    tagBg: "#FEF3C7",
    dot: "#F59E0B",
    day: 9,
  },
  {
    title: "Rapat Koordinasi RW",
    time: "19.30 – 21.00 WIB",
    loc: "Balai RW 05",
    tag: "Rapat",
    tagColor: "#2563EB",
    tagBg: "#DBEAFE",
    dot: "#3B82F6",
    day: 10,
  },
];

const QUICK_ACTIONS = [
  {
    label: "Bayar IPL",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="#0F172A" strokeWidth="1.7" />
        <path d="M3 10h18" stroke="#0F172A" strokeWidth="1.7" />
        <path d="M7 14h4" stroke="#0F172A" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
    accent: "#EEF2FF",
  },
  {
    label: "Lapor RT",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#0F172A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10h8M8 13h5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accent: "#F0FDF4",
  },
  {
    label: "CCTV",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="7" stroke="#0F172A" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3" stroke="#0F172A" strokeWidth="1.7" />
        <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accent: "#F0F9FF",
  },
  {
    label: "Lapak",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l1-5h16l1 5" stroke="#0F172A" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M3 9c0 1.1.9 2 2 2s2-.9 2-2 .9 2 2 2 2-.9 2-2 .9 2 2 2 2-.9 2-2 .9 2 2 2 2-.9 2-2" stroke="#0F172A" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 11v8a1 1 0 001 1h12a1 1 0 001-1v-8" stroke="#0F172A" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10 15h4" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accent: "#FFF7ED",
  },
  {
    label: "Panic",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9v4M12 17h.01" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    accent: "#FEF2F2",
    labelColor: "#DC2626",
  },
];

const NAV_ITEMS = [
  {
    label: "Beranda",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
          stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.8" fill={active ? "#0F172A" : "none"} fillOpacity={active ? 0.12 : 0} />
        <path d="M9 21V12h6v9" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    label: "Kas",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2.5" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" />
        <path d="M3 10h18" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" />
        <circle cx="17" cy="14.5" r="1.5" fill={active ? "#0F172A" : "#94A3B8"} />
      </svg>
    ),
  },
  {
    label: "Agenda",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" />
        <path d="M16 2v4M8 2v4M3 9h18" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8 13h8M8 17h5" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Lapak",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l1-5h16l1 5" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" strokeLinecap="round" />
        <path d="M3 9c0 1.1.9 2 2 2s2-.9 2-2 .9 2 2 2 2-.9 2-2 .9 2 2 2 2-.9 2-2 .9 2 2 2 2-.9 2-2" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 11v8a1 1 0 001 1h12a1 1 0 001-1v-8" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Profil",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? "#0F172A" : "#94A3B8"} strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface Props {
  onPayBill?: () => void;
}

export default function HomeScreen({ onPayBill }: Props) {
  const [activeDay, setActiveDay] = useState(9);
  const [activeNav, setActiveNav] = useState(0);

  const filteredEvents = EVENTS.filter((e) => e.day === activeDay);

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        width: 393,
        height: 852,
        background: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-6 pt-3" style={{ height: 44 }}>
        <span className="font-semibold text-[15px] tracking-tight text-[#0F172A]">9:41</span>
        <div className="flex items-center gap-[6px]">
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0" y="7" width="3" height="5" rx="0.8" fill="#0F172A" />
            <rect x="4.5" y="4.5" width="3" height="7.5" rx="0.8" fill="#0F172A" />
            <rect x="9" y="2" width="3" height="10" rx="0.8" fill="#0F172A" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.8" fill="#0F172A" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#0F172A" />
            <path d="M3.5 6.5C4.9 5.1 6.85 4.25 9 4.25S13.1 5.1 14.5 6.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M1 4C3.2 1.8 5.95 0.5 8.75 0.5S14.3 1.8 16 4" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="#0F172A" strokeOpacity="0.3" />
            <rect x="2" y="2" width="16" height="8" rx="1.5" fill="#0F172A" />
            <path d="M22.5 4v4c1.1-.4 1.1-3.6 0-4Z" fill="#0F172A" fillOpacity="0.35" />
          </svg>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 90 }}>

        {/* ── Top header ── */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
                fontSize: 17,
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              }}
            >
              H
            </div>
            <div>
              <p className="font-medium" style={{ fontSize: 13, color: "#64748B", lineHeight: 1 }}>Selamat pagi,</p>
              <p className="font-extrabold" style={{ fontSize: 17, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                Pak Hendra 👋
              </p>
              {/* Location pill */}
              <div
                className="flex items-center gap-1 mt-1"
                style={{
                  background: "#EFF6FF",
                  borderRadius: 99,
                  padding: "3px 8px",
                  display: "inline-flex",
                  width: "fit-content",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6" />
                  <circle cx="12" cy="9" r="2.5" fill="white" />
                </svg>
                <span className="font-semibold" style={{ fontSize: 11, color: "#2563EB" }}>RT 03 / RW 05 · Sukamaju</span>
              </div>
            </div>
          </div>

          {/* Bell */}
          <button
            className="relative flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#0F172A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Badge */}
            <span
              className="absolute"
              style={{
                width: 9, height: 9, borderRadius: "50%",
                background: "#EF4444", border: "1.5px solid #F8FAFC",
                top: 9, right: 10,
              }}
            />
          </button>
        </div>

        {/* ── Balance card ── */}
        <div className="px-5 mb-5">
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 24,
              background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 55%, #1E293B 100%)",
              padding: "22px 22px 0 22px",
              boxShadow: "0 12px 40px rgba(15,23,42,0.28)",
            }}
          >
            {/* Decorative circles */}
            <div className="absolute pointer-events-none" style={{ width: 180, height: 180, top: -60, right: -40, borderRadius: "50%", background: "rgba(99,102,241,0.12)", filter: "blur(2px)" }} />
            <div className="absolute pointer-events-none" style={{ width: 120, height: 120, bottom: 20, left: -30, borderRadius: "50%", background: "rgba(56,189,248,0.09)" }} />

            {/* Card label */}
            <p className="font-semibold mb-1" style={{ fontSize: 12, color: "rgba(148,163,184,0.9)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Saldo Kas Terbuka RT 03
            </p>
            <p className="font-extrabold mb-3" style={{ fontSize: 32, color: "#FFFFFF", letterSpacing: "-0.04em", lineHeight: 1 }}>
              Rp 18.450.000
            </p>

            {/* In/out pills */}
            <div className="flex gap-2 mb-5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(22,163,74,0.2)", border: "1px solid rgba(22,163,74,0.3)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M5 12l7-7 7 7" stroke="#4ADE80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-bold" style={{ fontSize: 12, color: "#4ADE80" }}>Masuk: +Rp 3.8M</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M19 12l-7 7-7-7" stroke="#F87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-bold" style={{ fontSize: 12, color: "#F87171" }}>Keluar: -Rp 950K</span>
              </div>
            </div>

            {/* Tagihan banner */}
            <div
              className="flex items-center justify-between"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                margin: "0 -22px",
                padding: "14px 22px",
                backdropFilter: "blur(8px)",
              }}
            >
              <div>
                <p style={{ fontSize: 11.5, color: "rgba(148,163,184,0.85)", fontWeight: 500 }}>Tagihan Iuran Anda</p>
                <p className="font-bold" style={{ fontSize: 17, color: "#FFFFFF", letterSpacing: "-0.02em" }}>Rp 52.000</p>
              </div>
              <button
                onClick={onPayBill}
                className="font-bold"
                style={{
                  height: 36,
                  paddingLeft: 20,
                  paddingRight: 20,
                  background: "#3B82F6",
                  color: "#FFFFFF",
                  borderRadius: 10,
                  fontSize: 13.5,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
                }}
              >
                Bayar
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="px-5 mb-6">
          <div className="flex justify-between">
            {QUICK_ACTIONS.map((action) => (
              <div key={action.label} className="flex flex-col items-center gap-2">
                <button
                  className="flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: action.accent,
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                  }}
                >
                  {action.icon}
                </button>
                <span className="font-semibold text-center" style={{ fontSize: 11, color: action.labelColor ?? "#374151", lineHeight: 1.2, maxWidth: 52 }}>
                  {action.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Calendar & Agenda ── */}
        <div className="px-5">
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <p className="font-extrabold" style={{ fontSize: 17, color: "#0F172A", letterSpacing: "-0.02em" }}>Agenda Warga</p>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <span className="font-semibold" style={{ fontSize: 13, color: "#3B82F6" }}>Lihat Semua</span>
            </button>
          </div>

          {/* Month label */}
          <p className="font-semibold mb-3" style={{ fontSize: 13, color: "#64748B" }}>September 2026</p>

          {/* Date strip */}
          <div className="flex gap-2 mb-5">
            {DAYS.map((d) => {
              const active = d.date === activeDay;
              return (
                <button
                  key={d.date}
                  onClick={() => setActiveDay(d.date)}
                  className="flex flex-col items-center justify-center flex-1"
                  style={{
                    height: 64,
                    borderRadius: 16,
                    background: active ? "#0F172A" : "#FFFFFF",
                    border: active ? "none" : "1px solid #E2E8F0",
                    boxShadow: active ? "0 6px 18px rgba(15,23,42,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? "rgba(255,255,255,0.6)" : "#94A3B8" }}>{d.label}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: active ? "#FFFFFF" : "#0F172A", letterSpacing: "-0.03em" }}>{d.date}</span>
                  {/* Event dot */}
                  {EVENTS.some((e) => e.day === d.date) && (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "rgba(255,255,255,0.6)" : "#3B82F6" }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Event cards */}
          <div className="flex flex-col gap-3">
            {filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center py-8" style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                <p className="font-medium" style={{ fontSize: 14, color: "#94A3B8" }}>Tidak ada agenda hari ini</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.title}
                  className="flex gap-3"
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    border: "1px solid #E2E8F0",
                    padding: "14px 16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Color strip */}
                  <div style={{ width: 4, borderRadius: 99, background: event.dot, flexShrink: 0 }} />

                  <div className="flex-1 min-w-0">
                    {/* Tag */}
                    <span
                      className="font-bold inline-block mb-1.5"
                      style={{
                        fontSize: 11,
                        color: event.tagColor,
                        background: event.tagBg,
                        borderRadius: 99,
                        padding: "3px 9px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {event.tag}
                    </span>
                    <p className="font-bold mb-1 leading-snug" style={{ fontSize: 14.5, color: "#0F172A" }}>
                      {event.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="1.7" />
                        <path d="M12 7v5l3 3" stroke="#94A3B8" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#94A3B8" strokeWidth="1.7" />
                        <circle cx="12" cy="9" r="2.5" stroke="#94A3B8" strokeWidth="1.5" />
                      </svg>
                      <span style={{ fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>{event.loc}</span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className="flex items-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom nav bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-around"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid #E2E8F0",
          paddingBottom: 20,
          paddingTop: 10,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {NAV_ITEMS.map((item, i) => {
          const active = activeNav === i;
          return (
            <button
              key={item.label}
              onClick={() => setActiveNav(i)}
              className="flex flex-col items-center gap-1"
              style={{ background: "none", border: "none", cursor: "pointer", minWidth: 56 }}
            >
              {item.icon(active)}
              <span
                className="font-semibold"
                style={{ fontSize: 10.5, color: active ? "#0F172A" : "#94A3B8", letterSpacing: "0.01em" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
