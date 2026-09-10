import { useState } from "react";

const BILL_ITEMS = [
  { label: "Iuran Kas RT", amount: "Rp 30.000", info: null },
  { label: "Iuran Sampah & Kebersihan", amount: "Rp 20.000", info: null },
];

const PAYMENT_METHODS = [
  {
    id: "qris",
    title: "QRIS Instant",
    subtitle: "Scan sekali, bayar dari mana saja",
    logos: ["BCA", "GoPay", "OVO", "Dana", "SPay"],
    logoColors: ["#005BAA", "#00AED6", "#4C3494", "#118EEA", "#EE4D2D"],
    badge: "Rekomendasi",
  },
  {
    id: "va",
    title: "Virtual Account Bank",
    subtitle: "Transfer via ATM, m-Banking, atau iBanking",
    logos: ["BCA", "Mandiri", "BRI", "BNI"],
    logoColors: ["#005BAA", "#003D7C", "#F15A29", "#FF6600"],
    badge: null,
  },
  {
    id: "cash",
    title: "Bayar Tunai ke Bendahara",
    subtitle: "Upload bukti setelah membayar langsung",
    logos: [],
    logoColors: [],
    badge: null,
  },
];

interface Props {
  onBack: () => void;
}

export default function InvoiceScreen({ onBack }: Props) {
  const [selected, setSelected] = useState("qris");
  const [tooltip, setTooltip] = useState(false);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === selected)!;

  const ctaLabel =
    selected === "qris"
      ? "Bayar Rp 52.000 via QRIS"
      : selected === "va"
      ? "Bayar Rp 52.000 via Virtual Account"
      : "Konfirmasi & Upload Bukti";

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
      {/* Status bar */}
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

      {/* Top nav */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 40, height: 40, borderRadius: 12, background: "#FFFFFF", border: "1px solid #E2E8F0", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p className="font-extrabold" style={{ fontSize: 17, color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Rincian Tagihan</p>
          <p className="font-medium" style={{ fontSize: 12.5, color: "#64748B" }}>Pak Hendra · RT 03 / RW 05</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: 110 }}>

        {/* ── Invoice card ── */}
        <div
          className="mb-4"
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Card header */}
          <div
            className="flex items-start justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #F1F5F9" }}
          >
            <div>
              <p className="font-bold" style={{ fontSize: 14.5, color: "#0F172A", lineHeight: 1.3 }}>
                Tagihan Iuran Bulanan
              </p>
              <p className="font-semibold mt-0.5" style={{ fontSize: 13, color: "#64748B" }}>
                September 2026
              </p>
            </div>
            <span
              className="font-bold flex-shrink-0"
              style={{
                fontSize: 11.5,
                color: "#B45309",
                background: "#FEF3C7",
                border: "1px solid #FDE68A",
                borderRadius: 99,
                padding: "4px 11px",
                marginTop: 2,
              }}
            >
              ⏳ Menunggu Pembayaran
            </span>
          </div>

          {/* Invoice meta row */}
          <div className="flex gap-0 px-5 py-3" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="flex-1">
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>No. Tagihan</p>
              <p style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>#INV-2026-09-047</p>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Jatuh Tempo</p>
              <p style={{ fontSize: 13, color: "#EF4444", fontWeight: 700, marginTop: 2 }}>30 Sep 2026</p>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Periode</p>
              <p style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>Sep 2026</p>
            </div>
          </div>

          {/* Line items */}
          <div className="px-5 pt-4 pb-2">
            {BILL_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{item.amount}</span>
              </div>
            ))}

            {/* Subtotal */}
            <div
              className="flex items-center justify-between py-3 mb-3"
              style={{ borderTop: "1px dashed #E2E8F0", borderBottom: "1px dashed #E2E8F0" }}
            >
              <span style={{ fontSize: 13.5, color: "#64748B", fontWeight: 600 }}>Subtotal Iuran</span>
              <span style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 700 }}>Rp 50.000</span>
            </div>

            {/* Service fee */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 13.5, color: "#64748B", fontWeight: 500 }}>Biaya Layanan Aplikasi</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setTooltip(true)}
                    onMouseLeave={() => setTooltip(false)}
                    onClick={() => setTooltip((v) => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#94A3B8" strokeWidth="1.7" />
                      <path d="M12 11v5" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="12" cy="8" r="1" fill="#94A3B8" />
                    </svg>
                  </button>
                  {tooltip && (
                    <div
                      className="absolute z-10"
                      style={{
                        bottom: 22,
                        left: -80,
                        width: 190,
                        background: "#1E293B",
                        color: "#E2E8F0",
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 10,
                        padding: "8px 12px",
                        lineHeight: 1.45,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                      }}
                    >
                      Biaya pemeliharaan platform RtHub
                      <div
                        style={{
                          position: "absolute",
                          bottom: -5,
                          left: 84,
                          width: 10,
                          height: 10,
                          background: "#1E293B",
                          transform: "rotate(45deg)",
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 700 }}>Rp 2.000</span>
            </div>

            {/* Total divider */}
            <div style={{ height: 1, background: "#0F172A", marginBottom: 14, opacity: 0.12 }} />

            {/* Total */}
            <div className="flex items-center justify-between mb-5">
              <span style={{ fontSize: 15, color: "#0F172A", fontWeight: 700 }}>Total Tagihan</span>
              <span style={{ fontSize: 26, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Rp 52.000
              </span>
            </div>
          </div>
        </div>

        {/* ── Payment method selection ── */}
        <p className="font-extrabold mb-3" style={{ fontSize: 15.5, color: "#0F172A", letterSpacing: "-0.02em" }}>
          Pilih Metode Pembayaran
        </p>

        <div className="flex flex-col gap-3 mb-2">
          {PAYMENT_METHODS.map((method) => {
            const active = selected === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setSelected(method.id)}
                className="w-full text-left"
                style={{
                  background: active ? "#F0F9FF" : "#FFFFFF",
                  borderRadius: 16,
                  border: active ? "2px solid #0F172A" : "1.5px solid #E2E8F0",
                  padding: "14px 16px",
                  cursor: "pointer",
                  boxShadow: active ? "0 4px 16px rgba(15,23,42,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
                  transition: "all 0.15s",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Radio */}
                  <div
                    className="flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: active ? "none" : "2px solid #CBD5E1",
                      background: active ? "#0F172A" : "transparent",
                    }}
                  >
                    {active && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF" }} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: 14.5, color: "#0F172A", fontWeight: 700 }}>{method.title}</span>
                      {method.badge && (
                        <span style={{ fontSize: 10.5, color: "#059669", background: "#D1FAE5", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12.5, color: "#64748B", fontWeight: 500, marginTop: 2 }}>{method.subtitle}</p>

                    {/* Bank logos */}
                    {method.logos.length > 0 && (
                      <div className="flex gap-2 mt-2.5 flex-wrap">
                        {method.logos.map((logo, idx) => (
                          <div
                            key={logo}
                            className="flex items-center justify-center font-bold"
                            style={{
                              height: 26,
                              paddingLeft: 10,
                              paddingRight: 10,
                              borderRadius: 7,
                              background: method.logoColors[idx],
                              color: "#FFFFFF",
                              fontSize: 10,
                              letterSpacing: "0.02em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {logo}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cash upload prompt */}
                    {method.id === "cash" && active && (
                      <div
                        className="flex items-center gap-2 mt-3"
                        style={{
                          background: "#FFF7ED",
                          border: "1px dashed #FCD34D",
                          borderRadius: 10,
                          padding: "10px 12px",
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: 12.5, color: "#92400E", fontWeight: 600 }}>Tap untuk upload bukti transfer</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 mt-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>
            Transaksi dienkripsi &amp; aman melalui sistem RtHub
          </span>
        </div>
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5"
        style={{
          paddingBottom: 28,
          paddingTop: 14,
          background: "rgba(248,250,252,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid #E2E8F0",
        }}
      >
        {/* Amount summary strip */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Total yang dibayar</span>
          <span style={{ fontSize: 17, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.03em" }}>Rp 52.000</span>
        </div>

        <button
          className="w-full font-bold flex items-center justify-center gap-2"
          style={{
            height: 56,
            background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
            color: "#FFFFFF",
            borderRadius: 16,
            fontSize: 15.5,
            letterSpacing: "-0.01em",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(15,23,42,0.3)",
          }}
        >
          {selected === "qris" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1.7" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1.7" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1.7" />
              <rect x="5.5" y="5.5" width="3" height="3" rx="0.5" fill="white" />
              <rect x="15.5" y="5.5" width="3" height="3" rx="0.5" fill="white" />
              <rect x="5.5" y="15.5" width="3" height="3" rx="0.5" fill="white" />
              <path d="M14 14h2v2h-2zM17 14h3M17 17v3M14 17h1M20 17h1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          {selected === "va" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="white" strokeWidth="1.7" />
              <path d="M3 10h18" stroke="white" strokeWidth="1.7" />
            </svg>
          )}
          {selected === "cash" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {ctaLabel}
        </button>

        {/* Home indicator */}
        <div className="flex justify-center mt-3">
          <div style={{ width: 134, height: 5, borderRadius: 99, background: "rgba(15,23,42,0.15)" }} />
        </div>
      </div>
    </div>
  );
}
