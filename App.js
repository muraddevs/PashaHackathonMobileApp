import { useState, useEffect, useRef } from "react";

const GREEN = "#1A7A4A";
const GREEN_LIGHT = "#E8F5EE";
const GREEN_MID = "#2EA865";
const DARK = "#111";
const GRAY = "#6B7280";
const LIGHT_GRAY = "#F5F5F5";
const BORDER = "#E5E7EB";
const RED = "#EF4444";
const ORANGE = "#F97316";

const MANAT = "₼";

// ── tiny icon helpers ────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor", style = {} }) => {
  const icons = {
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    search: <><circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" /></>,
    robot: <><rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2" /><path d="M12 3v5M8 12h.01M16 12h.01M9 16h6" strokeWidth="2" strokeLinecap="round" /><path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth="2" /></>,
    map: <><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
    scan: <><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" /></>,
    back: <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    close: <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    navigate: <><path d="M22 2L11 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 2L15 22l-4-9-9-4 19-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
    mic: <><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z" strokeWidth="2" /><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8" strokeWidth="2" strokeLinecap="round" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" strokeLinecap="round" /><polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" strokeLinejoin="round" /></>,
    location: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2" /><circle cx="12" cy="10" r="3" strokeWidth="2" /></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" /><path d="M13.73 21a2 2 0 01-3.46 0" strokeWidth="2" strokeLinecap="round" /></>,
    chevronDown: <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2" />,
    plus: <><line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" /></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" />,
    shelf: <><line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" /><line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" /><line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" strokeLinecap="round" /></>,
    arrowUp: <><line x1="12" y1="19" x2="12" y2="5" strokeWidth="2" strokeLinecap="round" /><polyline points="5 12 12 5 19 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" /><line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" /><line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" strokeLinecap="round" /></>,
    deals: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeWidth="2" /><line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" strokeLinecap="round" /></>,
    orders: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeWidth="2" /><rect x="9" y="3" width="6" height="4" rx="2" strokeWidth="2" /></>,
    lightning: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    keyboard: <><rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" strokeWidth="2" strokeLinecap="round" /></>,
    target: <><circle cx="12" cy="12" r="10" strokeWidth="2" /><circle cx="12" cy="12" r="6" strokeWidth="2" /><circle cx="12" cy="12" r="2" strokeWidth="2" /></>,
    fingerprint: <><path d="M12 10a2 2 0 00-2 2c0 1.11.89 2 2 2a2 2 0 002-2c0-1.11-.89-2-2-2z" strokeWidth="2" /><path d="M10.5 2.5a9.5 9.5 0 100 19" strokeWidth="2" strokeLinecap="round" /><path d="M13.5 2.5a9.5 9.5 0 010 19" strokeWidth="2" strokeLinecap="round" /></>,
    smile: <><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="2" strokeLinecap="round" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" strokeLinecap="round" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" strokeLinecap="round" /></>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2" /><line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" /></>,
    question: <><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" /></>,
    crosshair: <><circle cx="12" cy="12" r="10" strokeWidth="2" /><line x1="22" y1="12" x2="18" y2="12" strokeWidth="2" strokeLinecap="round" /><line x1="6" y1="12" x2="2" y2="12" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="6" x2="12" y2="2" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="22" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" /></>,
    check: <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} style={style}>
      {icons[name]}
    </svg>
  );
};

// ── shared components ────────────────────────────────────────────────────────
const ScanFab = ({ onClick }) => (
  <button onClick={onClick} style={{
    width: 60, height: 60, borderRadius: "50%", background: DARK,
    border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.25)", flexShrink: 0,
  }}>
    <Icon name="scan" size={26} color="white" />
  </button>
);

const BottomNav = ({ active, onNav, onScan }) => {
  const tabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "onsite", label: "On-Site", icon: "location" },
    { id: "scan", label: "", icon: "scan" },
    { id: "assistant", label: "Assistant", icon: "robot" },
    { id: "map", label: "Map", icon: "map" },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-around",
      background: "white", borderTop: `1px solid ${BORDER}`,
      paddingBottom: 8, paddingTop: 8, position: "relative",
    }}>
      {tabs.map(t =>
        t.id === "scan" ? (
          <div key="scan" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -20 }}>
            <ScanFab onClick={onScan} />
          </div>
        ) : (
          <button key={t.id} onClick={() => onNav(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, background: "none", border: "none", cursor: "pointer",
            color: active === t.id ? GREEN : GRAY, minWidth: 48, padding: "2px 0",
          }}>
            <Icon name={t.icon} size={22} color={active === t.id ? GREEN : GRAY} />
            <span style={{ fontSize: 10, fontWeight: active === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        )
      )}
    </div>
  );
};

const Price = ({ amount, size = 18 }) => (
  <span style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
    <span style={{ fontSize: size, fontWeight: 700, color: DARK }}>{amount}</span>
    <span style={{ fontSize: size - 2, color: GREEN, fontWeight: 600 }}>{MANAT}</span>
  </span>
);

const Badge = ({ text, color = GREEN, bg = GREEN_LIGHT }) => (
  <span style={{
    background: bg, color, fontSize: 11, fontWeight: 600,
    padding: "2px 8px", borderRadius: 20, display: "inline-block",
  }}>{text}</span>
);

const AllergenBadge = ({ label }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#FFF7ED", color: "#C2410C", fontSize: 11, fontWeight: 600,
    padding: "3px 8px", borderRadius: 20, border: "1px solid #FED7AA",
  }}>
    <Icon name="warning" size={12} color="#C2410C" />
    {label}
  </span>
);

// ── SCREEN 1: Login ──────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [code, setCode] = useState(["4", "8", "", ""]);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 32px", background: "white", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: GREEN_LIGHT, border: `2px solid ${GREEN}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: GREEN }}>B</span>
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: GREEN, margin: "0 0 8px" }}>BRAVO ON-SITE</p>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: DARK, margin: "0 0 8px", textAlign: "center" }}>Welcome to<br />your assistant.</h1>
      <p style={{ fontSize: 14, color: GRAY, textAlign: "center", margin: "0 0 36px", lineHeight: 1.5 }}>
        Sign in to access store maps, scan items,<br />and check real-time stock.
      </p>

      <div style={{ width: "100%", background: "#F9F9F9", borderRadius: 12, padding: 4, display: "flex", marginBottom: 24 }}>
        <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "white", border: "none", fontWeight: 600, fontSize: 14, color: DARK, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>Phone Number</button>
        <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "transparent", border: "none", fontWeight: 500, fontSize: 14, color: GRAY, cursor: "pointer" }}>Email Address</button>
      </div>

      <div style={{ width: "100%", marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: GRAY, margin: "0 0 8px" }}>MOBILE NUMBER</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px" }}>
          <span style={{ fontSize: 18 }}>🇦🇿</span>
          <span style={{ fontWeight: 600, color: DARK }}>+994</span>
          <span style={{ color: "#ccc" }}>|</span>
          <span style={{ color: "#ccc", fontSize: 14 }}>00 000 00 00</span>
        </div>
      </div>

      <div style={{ width: "100%", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: GRAY, margin: 0 }}>VERIFICATION CODE</p>
          <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>Resend</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {code.map((v, i) => (
            <input key={i} ref={inputRefs[i]} maxLength={1} value={v}
              onChange={e => {
                const n = [...code]; n[i] = e.target.value;
                setCode(n);
                if (e.target.value && i < 3) inputRefs[i + 1].current?.focus();
              }}
              style={{
                flex: 1, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700,
                border: `2px solid ${i === 1 ? GREEN : BORDER}`, borderRadius: 12,
                background: i === 1 ? GREEN_LIGHT : "white", color: DARK,
                outline: "none",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
        <span style={{ fontSize: 13, color: GRAY }}>Or use</span>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        {["fingerprint", "smile"].map(name => (
          <button key={name} style={{ width: 56, height: 56, borderRadius: 14, border: `1px solid ${BORDER}`, background: DARK, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name={name} size={24} color="white" />
          </button>
        ))}
      </div>

      <button onClick={onLogin} style={{
        width: "100%", padding: "16px 0", borderRadius: 14, background: GREEN,
        color: "white", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16,
      }}>
        Continue to On-Site →
      </button>
      <p style={{ fontSize: 12, color: GRAY, textAlign: "center" }}>By continuing, you agree to our</p>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 12, color: DARK, fontWeight: 600, textDecoration: "underline" }}>Terms</span>
        <span style={{ fontSize: 12, color: GRAY }}>&</span>
        <span style={{ fontSize: 12, color: DARK, fontWeight: 600, textDecoration: "underline" }}>Privacy Policy</span>
      </div>
    </div>
  );
};

// ── SCREEN 2: Home ───────────────────────────────────────────────────────────
const HomeScreen = ({ onNav }) => {
  const categories = [
    { name: "Vegetables", emoji: "🥦" },
    { name: "Sea Fish", emoji: "🐟" },
    { name: "Eggs", emoji: "🥚" },
    { name: "Fruits", emoji: "🍊" },
  ];
  const deals = [
    { name: "Premium Extra Virgin Olive Oil 1L", aisle: "Aisle 4, Shelf B", price: "10.15", orig: "14.50", discount: "-30%" },
    { name: "Fresh Farm Honey 500g", aisle: "Aisle 2, Shelf A", price: "7.80", orig: "9.50", discount: "-15%" },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: LIGHT_GRAY }}>
      <div style={{ background: "white", padding: "16px 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>B</span>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: DARK }}>Bravo On-Site</p>
              <p style={{ margin: 0, fontSize: 11, color: GRAY }}>Gənclik Mall</p>
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="bell" size={22} color={GRAY} />
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 20px" }}>
        <div style={{ background: "white", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: `1px solid ${BORDER}` }}>
          <Icon name="search" size={18} color={GRAY} />
          <span style={{ fontSize: 14, color: "#aaa" }}>Məhsul, brend və ya kateqoriya axtarın</span>
          <div style={{ marginLeft: "auto" }}>
            <Icon name="scan" size={18} color={GREEN} />
          </div>
        </div>
      </div>

      <div style={{ margin: "0 20px 16px", background: DARK, borderRadius: 16, overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "20px", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)" }}>
          <div style={{ display: "inline-block", background: GREEN, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, marginBottom: 8, letterSpacing: 1 }}>PREMIUM FEATURE</div>
          <h2 style={{ color: "white", margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Find products<br />faster in-store</h2>
          <p style={{ color: "#aaa", margin: "0 0 16px", fontSize: 13 }}>Navigate aisles & check stock.</p>
          <button onClick={() => onNav("map")} style={{ background: "white", color: DARK, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            Start Navigation →
          </button>
        </div>
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: DARK }}>Quick Actions</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "Store Map", icon: "map" },
            { label: "Deals", icon: "deals" },
            { label: "My List", icon: "list" },
            { label: "Orders", icon: "orders" },
          ].map(a => (
            <button key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "white", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 8px", cursor: "pointer" }}>
              <Icon name={a.icon} size={22} color={GREEN} />
              <span style={{ fontSize: 11, fontWeight: 600, color: DARK, textAlign: "center" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Shop by Category</h3>
          <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>See All</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {categories.map(c => (
            <button key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "white", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 4px", cursor: "pointer" }}>
              <span style={{ fontSize: 26 }}>{c.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: DARK, textAlign: "center" }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Featured Deals</h3>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {deals.map(d => (
            <div key={d.name} style={{ minWidth: 180, background: "white", borderRadius: 14, border: `1px solid ${BORDER}`, padding: 12, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "white", background: RED, padding: "2px 6px", borderRadius: 6 }}>{d.discount}</span>
              </div>
              <div style={{ width: "100%", height: 70, background: LIGHT_GRAY, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, fontSize: 30 }}>🫒</div>
              <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{d.name}</p>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: GRAY }}>{d.aisle}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <Price amount={d.price} size={15} />
                  <span style={{ fontSize: 11, color: GRAY, textDecoration: "line-through", marginLeft: 4 }}>{d.orig}</span>
                </div>
                <button style={{ width: 28, height: 28, borderRadius: "50%", background: GREEN, border: "none", color: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="plus" size={16} color="white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── SCREEN 3: On-Site Hub ────────────────────────────────────────────────────
const OnSiteScreen = ({ onNav }) => {
  const tools = [
    { icon: "scan", label: "Scan Product", sub: "Check price & details" },
    { icon: "search", label: "Find Product", sub: "Search store inventory" },
    { icon: "question", label: "Ask AI", sub: "Get recipes & advice" },
    { icon: "map", label: "Navigate", sub: "Find items in aisles" },
  ];
  const specials = [
    { name: "Seasonal Fruit Basket", aisle: "Aisle 1 · Produce", price: "12.50", orig: "15.80", discount: "-20%", emoji: "🍎" },
    { name: "Premium Olive Oil 1L", aisle: "Aisle 4 · Pantry", price: "14.50", emoji: "🫒" },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: LIGHT_GRAY }}>
      <div style={{ background: "white", padding: "16px 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>B</span>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: DARK }}>Bravo On-Site</p>
              <p style={{ margin: 0, fontSize: 11, color: GRAY }}>Store Hub</p>
            </div>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="bell" size={22} color={GRAY} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: LIGHT_GRAY, borderRadius: 12, padding: "10px 14px" }}>
          <Icon name="search" size={16} color={GRAY} />
          <span style={{ fontSize: 13, color: "#aaa" }}>Məhsul, brend və ya kateqoriya axt</span>
          <Icon name="scan" size={16} color={GREEN} style={{ marginLeft: "auto" }} />
        </div>
      </div>

      <div style={{ margin: "12px 20px", background: "white", borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 11, color: GRAY, fontWeight: 600 }}>SELECT STORE</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: DARK }}>Bravo Gənclik Mall</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginBottom: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
              <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Open until 23:00</span>
            </div>
            <Icon name="chevronDown" size={16} color={GRAY} />
          </div>
        </div>

        <div style={{ padding: "12px 16px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: DARK }}>Nearby Branches</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[{ name: "Bravo 28 Mall", dist: "1.2 km", addr: "Füzuli küçəsi, Bakı" }, { name: "Bravo Port Baku", dist: "2.5 km", addr: "Neftçilər prospekti" }].map(b => (
              <div key={b.name} style={{ background: LIGHT_GRAY, borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13, color: DARK }}>{b.name} <span style={{ fontWeight: 400, color: GRAY }}>{b.dist}</span></p>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: GRAY }}>{b.addr}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
                  <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>Open</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ margin: "0 20px 12px", background: GREEN_LIGHT, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12 }}>
        <div style={{ width: 32, height: 32, background: GREEN, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          💡
        </div>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13, color: DARK }}>In-Aisle Tip</p>
          <p style={{ margin: 0, fontSize: 12, color: GRAY, lineHeight: 1.5 }}>Looking for fresh bakery items? The Gənclik Mall branch restocks artisanal breads every day at 14:00. Head to Aisle 7.</p>
        </div>
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 16, color: DARK }}>On-Site Tools</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {tools.map(t => (
            <button key={t.label} onClick={() => t.label === "Find Product" ? onNav("onsite-search") : t.label === "Ask AI" ? onNav("assistant") : t.label === "Navigate" ? onNav("map") : onNav("scanner")} style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px", textAlign: "left", cursor: "pointer" }}>
              <div style={{ marginBottom: 8 }}><Icon name={t.icon} size={24} color={DARK} /></div>
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13, color: DARK }}>{t.label}</p>
              <p style={{ margin: 0, fontSize: 11, color: GRAY }}>{t.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>In-Store Specials</p>
          <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>View All</span>
        </div>
        {specials.map(s => (
          <div key={s.name} style={{ background: "white", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "12px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, background: LIGHT_GRAY, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, position: "relative" }}>
              {s.emoji}
              {s.discount && <span style={{ position: "absolute", top: -6, left: -6, background: RED, color: "white", fontSize: 9, fontWeight: 700, padding: "1px 4px", borderRadius: 4 }}>{s.discount}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, color: DARK }}>{s.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: GRAY }}>{s.aisle}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <Price amount={s.price} size={15} />
              {s.orig && <p style={{ margin: 0, fontSize: 11, color: GRAY, textDecoration: "line-through" }}>{s.orig}</p>}
            </div>
            <Icon name="chevronDown" size={16} color={GRAY} style={{ transform: "rotate(-90deg)" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── SCREEN 4: Search Results ─────────────────────────────────────────────────
const SearchScreen = ({ onProduct, onNav }) => {
  const [query, setQuery] = useState("Milk");
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Dairy", "Lactose Free", "Halal"];
  const products = [
    { name: "Milla Full Cream Milk 1L", vol: "1000 ml", price: "2.45", status: "In Stock", statusColor: GREEN, aisle: "Aisle 3 · Shelf B", emoji: "🥛" },
    { name: "Azərsüd Half Fat Milk 1L", vol: "1000 ml", price: "2.20", status: "Low Stock", statusColor: ORANGE, aisle: "Aisle 3 · Shelf A", emoji: "🥛" },
    { name: "Alpro Almond Milk Unsweetened", vol: "1000 ml", price: "6.50", status: "In Stock", statusColor: GREEN, aisle: "Aisle 4 · Vegan", emoji: "🌾" },
    { name: "President Lactose Free Milk", vol: "1000 ml", price: "4.80", status: "Out of Stock", statusColor: RED, aisle: "Aisle 3 · Shelf C", emoji: "🥛" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button onClick={() => onNav("onsite")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: DARK }}>Search Results</h2>
            <p style={{ margin: 0, fontSize: 12, color: GRAY }}>24 items found for "Milk"</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: LIGHT_GRAY, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
          <Icon name="search" size={16} color={GRAY} />
          <input value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: DARK, outline: "none" }} />
          <button style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="close" size={14} color={GRAY} /></button>
          <div style={{ width: 1, height: 16, background: BORDER }} />
          <Icon name="filter" size={16} color={GRAY} />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: `1px solid ${activeFilter === f ? GREEN : BORDER}`, background: activeFilter === f ? GREEN : "white", color: activeFilter === f ? "white" : DARK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {products.map(p => (
            <div key={p.name} onClick={() => onProduct(p)} style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: 100, background: LIGHT_GRAY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{p.emoji}</div>
              <div style={{ padding: "10px 10px 12px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{p.name}</p>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: GRAY }}>{p.vol}</p>
                <Price amount={p.price} size={15} />
                <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "6px 0" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.statusColor }} />
                  <span style={{ fontSize: 11, color: p.statusColor, fontWeight: 600 }}>{p.status}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                  <Icon name="shelf" size={12} color={GRAY} />
                  <span style={{ fontSize: 11, color: GRAY }}>{p.aisle}</span>
                </div>
                <button style={{ width: "100%", padding: "7px 0", borderRadius: 10, border: `1px solid ${BORDER}`, background: "white", fontSize: 12, fontWeight: 600, color: DARK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Icon name="navigate" size={12} color={GREEN} /> Navigate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── SCREEN 5: Product Detail ─────────────────────────────────────────────────
const ProductScreen = ({ product, onBack, onNav }) => {
  const [tab, setTab] = useState("Details");
  const p = product || { name: "Milla Full Cream Milk 1L", price: "2.45", emoji: "🥛", aisle: "Aisle 3", shelf: "Shelf B", status: "In Stock", statusColor: GREEN };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white", overflowY: "auto" }}>
      <div style={{ position: "relative", background: LIGHT_GRAY, paddingTop: 20, paddingBottom: 20 }}>
        <button onClick={onBack} style={{ position: "absolute", top: 16, left: 16, width: 36, height: 36, borderRadius: "50%", background: "white", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="back" size={18} color={DARK} />
        </button>
        <button onClick={() => onNav("assistant")} style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 6, background: GREEN_LIGHT, border: `1px solid ${GREEN}`, color: GREEN, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20, cursor: "pointer" }}>
          <Icon name="robot" size={14} color={GREEN} /> Ask AI
        </button>
        <div style={{ display: "flex", justifyContent: "center", fontSize: 100, marginTop: 16 }}>{p.emoji}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "4px 14px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.statusColor || GREEN }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: p.statusColor || GREEN }}>{p.status || "In Stock"} ({p.aisle} • {p.shelf})</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: GRAY, letterSpacing: 1 }}>MILLA DAIRY</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: DARK, flex: 1 }}>{p.name}</h1>
          <button style={{ background: "none", border: "none", cursor: "pointer", marginTop: 2 }}>
            <Icon name="heart" size={22} color={GRAY} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#F59E0B" }}>★</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>4.8</span>
          <span style={{ color: GRAY, fontSize: 13 }}>(120 Reviews)</span>
          <Price amount={p.price} size={18} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <AllergenBadge label="Contains Dairy" />
          <AllergenBadge label="Lactose" />
        </div>

        <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${BORDER}`, marginBottom: 16 }}>
          {["Details", "Ingredients", "Nutrition"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontWeight: tab === t ? 700 : 400, fontSize: 14, color: tab === t ? "white" : GRAY, background: tab === t ? GREEN : "transparent", borderRadius: tab === t ? "8px 8px 0 0" : 0 }}>{t}</button>
          ))}
        </div>

        {tab === "Details" && <p style={{ fontSize: 14, lineHeight: 1.7, color: GRAY, margin: "0 0 20px" }}>Premium quality full cream milk sourced from local farms. Rich in calcium and essential vitamins, perfect for your daily nutrition needs. Pasteurized and homogenized for freshness.</p>}
        {tab === "Ingredients" && <p style={{ fontSize: 14, lineHeight: 1.7, color: GRAY, margin: "0 0 20px" }}>Full cream milk (100%). Contains milk proteins, fat (min 3.5%), lactose, vitamins A, D, B12, and minerals including calcium and phosphorus.</p>}
        {tab === "Nutrition" && (
          <div style={{ marginBottom: 20 }}>
            {[["Energy", "270 kJ / 64 kcal"], ["Fat", "3.5g"], ["Protein", "3.2g"], ["Carbohydrates", "4.7g"], ["Calcium", "120mg"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 13, color: GRAY }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Similar Products</h3>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[{ name: "Azersun Milk 2.5%", price: "2.30", emoji: "🥛" }, { name: "Palsud Fresh Milk", price: "2.60", emoji: "🥛" }].map(sp => (
            <div key={sp.name} style={{ flex: 1, background: LIGHT_GRAY, borderRadius: 12, padding: "12px", position: "relative" }}>
              <button style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer" }}><Icon name="heart" size={16} color={GRAY} /></button>
              <div style={{ fontSize: 40, textAlign: "center", marginBottom: 6 }}>{sp.emoji}</div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: DARK }}>{sp.name}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Price amount={sp.price} size={13} />
                <button style={{ width: 24, height: 24, borderRadius: "50%", background: GREEN, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Icon name="plus" size={14} color="white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 12, background: "white", position: "sticky", bottom: 0 }}>
        <button style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: `1px solid ${BORDER}`, background: "white", fontSize: 14, fontWeight: 600, color: DARK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon name="list" size={16} color={DARK} /> Add to List
        </button>
        <button onClick={() => onNav("map")} style={{ flex: 1.5, padding: "14px 0", borderRadius: 12, background: GREEN, border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon name="navigate" size={16} color="white" /> Navigate
        </button>
      </div>
    </div>
  );
};

// ── SCREEN 6: AI Scanner ─────────────────────────────────────────────────────
const ScannerScreen = ({ onBack, onProduct }) => {
  const [found, setFound] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFound(true), 1500);
    return () => clearTimeout(t);
  }, []);
  const scannedProduct = { name: "Milla Full Cream Milk 1L", price: "2.45", emoji: "🥛", aisle: "Aisle 3", shelf: "Shelf B", status: "In Stock", statusColor: GREEN };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: DARK, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", zIndex: 10 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="back" size={18} color="white" />
        </button>
        <h2 style={{ color: "white", margin: 0, fontSize: 17, fontWeight: 700 }}>AI Scanner</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="lightning" size={18} color="white" />
          </button>
          <button style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="keyboard" size={18} color="white" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
        <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Scan Product...</h2>
        <p style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>Point camera at barcode or label</p>
        <div style={{ width: "100%", aspectRatio: "1", maxHeight: 260, border: `2px solid ${GREEN}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "rgba(255,255,255,0.05)" }}>
          {/* corner accents */}
          {[["0 0", "0 0"], ["auto 0", "0 0"], ["0 auto", "0 0"], ["auto auto", "0 0"]].map((_, i) => (
            <div key={i} style={{ position: "absolute", width: 20, height: 20, borderColor: GREEN, borderStyle: "solid", borderWidth: 0, ...[{ borderTopWidth: 3, borderLeftWidth: 3, top: -2, left: -2 }, { borderTopWidth: 3, borderRightWidth: 3, top: -2, right: -2 }, { borderBottomWidth: 3, borderLeftWidth: 3, bottom: -2, left: -2 }, { borderBottomWidth: 3, borderRightWidth: 3, bottom: -2, right: -2 }][i], borderRadius: 2 }} />
          ))}
          <div style={{ position: "absolute", top: 8, right: 12, background: GREEN, color: "white", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
            ● AI Active
          </div>
          <div style={{ fontSize: 60, opacity: 0.3 }}>🥛</div>
        </div>
      </div>

      {found && (
        <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px" }}>
          <div style={{ width: 40, height: 4, background: BORDER, borderRadius: 2, margin: "0 auto 16px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1 }}>PRODUCT FOUND</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, background: LIGHT_GRAY, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{scannedProduct.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: DARK }}>{scannedProduct.name}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Price amount={scannedProduct.price} size={15} />
                <span style={{ fontSize: 12, color: GRAY }}>{scannedProduct.aisle} · {scannedProduct.shelf}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => onProduct(scannedProduct)} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: `1px solid ${BORDER}`, background: "white", fontSize: 14, fontWeight: 600, color: DARK, cursor: "pointer" }}>View Details</button>
            <button style={{ flex: 1, padding: "13px 0", borderRadius: 12, background: GREEN, border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icon name="navigate" size={14} color="white" /> Navigate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── SCREEN 7: Assistant ──────────────────────────────────────────────────────
const AssistantScreen = ({ onNav }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Salam! Mən Bravo alış-veriş asistanıyam. Sizə necə kömək edə bilərəm?" },
    { from: "user", text: "5 AZN altı qəlyanaltılar" },
    { from: "bot", text: "Budur 5 AZN-dən ucuz bəzi populyar qəlyanaltı seçimləri:", products: [
      { name: "Lays Classic Çipsi 150q", price: "2.80", aisle: "Sıra 4, Rəf B", emoji: "🥔" },
      { name: "Qarışıq Çərəz 100q", price: "4.50", aisle: "Sıra 2, Rəf A", emoji: "🥜" },
    ]},
  ]);
  const [input, setInput] = useState("");
  const chips = ["5 AZN altı qəlyanaltılar", "Halal protein", "Allergensiz"];
  const endRef = useRef();
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { from: "user", text }, { from: "bot", text: "Axtarıram..." }]);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 700 }}>B</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: DARK }}>Bravo On-Site</p>
            <p style={{ margin: 0, fontSize: 11, color: GREEN }}>AI Assistant</p>
          </div>
        </div>
        <button style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: GRAY }}>Clear Chat</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <div style={{ textAlign: "center", fontSize: 12, color: GRAY, marginBottom: 16 }}>Bugün, 14:30</div>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            {m.from === "bot" ? (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: LIGHT_GRAY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="robot" size={16} color={GREEN} />
                </div>
                <div style={{ maxWidth: "80%" }}>
                  <div style={{ background: LIGHT_GRAY, borderRadius: "4px 16px 16px 16px", padding: "10px 14px", marginBottom: m.products ? 8 : 0 }}>
                    <p style={{ margin: 0, fontSize: 14, color: DARK, lineHeight: 1.5 }}>{m.text}</p>
                  </div>
                  {m.products?.map(p => (
                    <div key={p.name} style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px", marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                        <div style={{ width: 44, height: 44, background: LIGHT_GRAY, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{p.emoji}</div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, color: DARK }}>{p.name}</p>
                          <Price amount={p.price} size={14} />
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: GRAY }}>📍 {p.aisle}</p>
                        </div>
                      </div>
                      <button onClick={() => onNav("map")} style={{ width: "100%", padding: "9px 0", borderRadius: 10, background: GREEN, border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <Icon name="navigate" size={14} color="white" /> Start Navigation
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: GREEN, borderRadius: "16px 4px 16px 16px", padding: "10px 16px", maxWidth: "75%" }}>
                  <p style={{ margin: 0, fontSize: 14, color: "white" }}>{m.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 20px 12px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
          {chips.map(c => (
            <button key={c} onClick={() => send(c)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: `1px solid ${BORDER}`, background: "white", fontSize: 12, fontWeight: 500, color: DARK, cursor: "pointer" }}>{c}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: LIGHT_GRAY, borderRadius: 24, padding: "8px 14px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="Məhsul axtarın və ya soruşun..." style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, outline: "none", color: DARK }} />
          <button style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="mic" size={20} color={GRAY} /></button>
          <button onClick={() => send(input)} style={{ width: 36, height: 36, borderRadius: "50%", background: GREEN, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Icon name="send" size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── SCREEN 8: Map / Indoor Navigation ───────────────────────────────────────
const MapScreen = ({ onBack }) => {
  const [routing, setRouting] = useState(true);
  const aisles = [
    { id: 1, x: 60, y: 60, w: 80, h: 100, label: "Aisle 1" },
    { id: 2, x: 160, y: 60, w: 80, h: 100, label: "Aisle 2" },
    { id: 3, x: 260, y: 60, w: 80, h: 100, label: "Aisle 3" },
    { id: 4, x: 60, y: 200, w: 70, h: 120, label: "Aisle 4" },
    { id: 5, x: 160, y: 200, w: 90, h: 120, label: "Aisle 5", active: true },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      <div style={{ padding: "14px 20px 10px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: DARK }}>Indoor Navigation</h2>
            <p style={{ margin: 0, fontSize: 12, color: GREEN, fontWeight: 600 }}>Bravo On-Site</p>
          </div>
          <button onClick={onBack} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="close" size={22} color={GRAY} />
          </button>
        </div>

        <div style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, background: LIGHT_GRAY, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🥔</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: DARK }}>Lays Classic Çipsi 150q</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
              <Badge text="2.80 ₼" />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="shelf" size={12} color={GRAY} />
                <span style={{ fontSize: 12, color: GRAY }}>Aisle 5, Shelf B</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <div style={{ background: GREEN, color: "white", fontSize: 13, fontWeight: 700, padding: "6px 16px", borderRadius: 20, display: "flex", gap: 12 }}>
            <span>2 min</span>
            <span>•</span>
            <span>45m</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, background: "#F0F0EB", position: "relative", overflow: "hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 380 320" style={{ position: "absolute", inset: 0 }}>
          {/* grid lines */}
          {[40, 80, 120, 160, 200, 240, 280, 320].map(y => <line key={y} x1="0" y1={y} x2="380" y2={y} stroke="#E0DDD5" strokeWidth="1" />)}
          {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => <line key={x} x1={x} y1="0" x2={x} y2="320" stroke="#E0DDD5" strokeWidth="1" />)}

          {/* aisles */}
          {aisles.map(a => (
            <g key={a.id}>
              <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="6" fill={a.active ? GREEN_LIGHT : "white"} stroke={a.active ? GREEN : "#D0CCC0"} strokeWidth={a.active ? 2 : 1} />
              <text x={a.x + a.w / 2} y={a.y + a.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="600" fill={a.active ? GREEN : GRAY}>{a.label}</text>
            </g>
          ))}

          {/* route path */}
          <polyline points="205,290 205,200 140,200 140,160" fill="none" stroke={GREEN} strokeWidth="3" strokeDasharray="8,4" strokeLinecap="round" />

          {/* destination pin */}
          <circle cx="205" cy="240" r="10" fill={RED} />
          <circle cx="205" cy="240" r="6" fill="white" />

          {/* user location */}
          <circle cx="140" cy="165" r="10" fill="white" stroke={GREEN} strokeWidth="2" />
          <circle cx="140" cy="165" r="5" fill={GREEN} />
        </svg>

        {/* zoom controls */}
        <div style={{ position: "absolute", right: 16, top: 16, display: "flex", flexDirection: "column", gap: 2 }}>
          <button style={{ width: 36, height: 36, background: "white", border: `1px solid ${BORDER}`, borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, fontWeight: 700, color: DARK }}>+</button>
          <button style={{ width: 36, height: 36, background: "white", border: `1px solid ${BORDER}`, borderRadius: "0 0 8px 8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, fontWeight: 700, color: DARK }}>−</button>
        </div>
        <button style={{ position: "absolute", right: 16, bottom: 8, width: 40, height: 40, background: "white", border: `1px solid ${BORDER}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="crosshair" size={20} color={GREEN} />
        </button>
      </div>

      <div style={{ background: "white", borderTop: `1px solid ${BORDER}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="arrowUp" size={24} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: GRAY, letterSpacing: 1 }}>CURRENT INSTRUCTION</p>
            <p style={{ margin: "2px 0 2px", fontSize: 20, fontWeight: 800, color: DARK }}>Go straight 20m</p>
            <p style={{ margin: 0, fontSize: 13, color: GRAY }}>towards Bakery section</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: LIGHT_GRAY, borderRadius: 10, marginBottom: 12 }}>
          <Icon name="question" size={16} color={GRAY} />
          <span style={{ fontSize: 13, color: GRAY }}>Then <strong>turn left at Bakery</strong></span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${BORDER}`, background: "white", fontSize: 14, fontWeight: 600, color: DARK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            🔊 Voice
          </button>
          <button onClick={() => setRouting(false)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, background: "#FEE2E2", border: "none", fontSize: 14, fontWeight: 700, color: RED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            🟥 End Route
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [prevScreen, setPrevScreen] = useState(null);

  const nav = (to) => {
    setPrevScreen(screen);
    setScreen(to);
  };

  const goBack = () => {
    setScreen(prevScreen || "home");
  };

  const handleProduct = (p) => {
    setSelectedProduct(p);
    nav("product");
  };

  const renderScreen = () => {
    switch (screen) {
      case "login": return <LoginScreen onLogin={() => nav("home")} />;
      case "home": return <HomeScreen onNav={nav} />;
      case "onsite": return <OnSiteScreen onNav={nav} />;
      case "onsite-search": return <SearchScreen onProduct={handleProduct} onNav={nav} />;
      case "product": return <ProductScreen product={selectedProduct} onBack={goBack} onNav={nav} />;
      case "scanner": return <ScannerScreen onBack={goBack} onProduct={handleProduct} />;
      case "assistant": return <AssistantScreen onNav={nav} />;
      case "map": return <MapScreen onBack={goBack} />;
      default: return <HomeScreen onNav={nav} />;
    }
  };

  const noBottomNav = ["login", "scanner"].includes(screen);
  const activeTab = ["home", "onsite", "onsite-search", "assistant", "map"].find(t => screen.startsWith(t)) || "home";

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#E5E7EB" }}>
      <div style={{
        width: "min(100%, 420px)",
        height: "min(100dvh, 860px)",
        background: "white",
        borderRadius: "clamp(0px, calc((100dvh - 860px) * 999), 36px)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        {/* status bar */}
        <div style={{ background: screen === "scanner" ? DARK : "white", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 6px", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: screen === "scanner" ? "white" : DARK }}>9:41</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: screen === "scanner" ? "white" : DARK }}>●●●●</span>
            <span style={{ fontSize: 11, color: screen === "scanner" ? "white" : DARK }}>WiFi</span>
            <span style={{ fontSize: 11, color: screen === "scanner" ? "white" : DARK }}>🔋</span>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {renderScreen()}
        </div>

        {!noBottomNav && (
          <BottomNav
            active={activeTab}
            onNav={nav}
            onScan={() => nav("scanner")}
          />
        )}
      </div>
    </div>
  );
}