import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { askAI } from "./src/services/ai";
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polyline,
  Polygon,
  G,
  Text as SvgText,
} from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

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

// ── icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = DARK }) => {
  const icons = {
    home: (
      <Path
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
        fill="none"
      />
    ),
    search: (
      <>
        <Circle cx="11" cy="11" r="8" strokeWidth="2" stroke={color} fill="none" />
        <Path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
      </>
    ),
    robot: (
      <>
        <Rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2" stroke={color} fill="none" />
        <Path d="M12 3v5M8 12h.01M16 12h.01M9 16h6" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
        <Path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" strokeWidth="2" stroke={color} fill="none" />
      </>
    ),
    map: (
      <Path
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={color}
        fill="none"
      />
    ),
    scan: (
      <>
        <Path
          d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={color}
          fill="none"
        />
        <Line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    back: <Path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />,
    close: <Path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />,
    navigate: (
      <>
        <Path d="M22 2L11 13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />
        <Path d="M22 2L15 22l-4-9-9-4 19-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />
      </>
    ),
    mic: (
      <>
        <Path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z" strokeWidth="2" stroke={color} fill="none" />
        <Path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
      </>
    ),
    send: (
      <>
        <Line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" strokeLinejoin="round" stroke={color} fill="none" />
      </>
    ),
    location: (
      <>
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2" stroke={color} fill="none" />
        <Circle cx="12" cy="10" r="3" strokeWidth="2" stroke={color} fill="none" />
      </>
    ),
    bell: (
      <>
        <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" stroke={color} fill="none" />
        <Path d="M13.73 21a2 2 0 01-3.46 0" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
      </>
    ),
    chevronDown: <Path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />,
    filter: <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />,
    heart: <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2" stroke={color} fill="none" />,
    plus: (
      <>
        <Line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    star: <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" stroke={color} fill={color} />,
    shelf: (
      <>
        <Line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    arrowUp: (
      <>
        <Line x1="12" y1="19" x2="12" y2="5" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Polyline points="5 12 12 5 19 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />
      </>
    ),
    list: (
      <>
        <Line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    deals: (
      <>
        <Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeWidth="2" stroke={color} fill="none" />
        <Line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    orders: (
      <>
        <Path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeWidth="2" stroke={color} fill="none" />
        <Rect x="9" y="3" width="6" height="4" rx="2" strokeWidth="2" stroke={color} fill="none" />
      </>
    ),
    lightning: <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />,
    keyboard: (
      <>
        <Rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2" stroke={color} fill="none" />
        <Path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
      </>
    ),
    target: (
      <>
        <Circle cx="12" cy="12" r="10" strokeWidth="2" stroke={color} fill="none" />
        <Circle cx="12" cy="12" r="6" strokeWidth="2" stroke={color} fill="none" />
        <Circle cx="12" cy="12" r="2" strokeWidth="2" stroke={color} fill="none" />
      </>
    ),
    fingerprint: (
      <>
        <Path d="M12 10a2 2 0 00-2 2c0 1.11.89 2 2 2a2 2 0 002-2c0-1.11-.89-2-2-2z" strokeWidth="2" stroke={color} fill="none" />
        <Path d="M10.5 2.5a9.5 9.5 0 100 19" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
        <Path d="M13.5 2.5a9.5 9.5 0 010 19" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
      </>
    ),
    smile: (
      <>
        <Circle cx="12" cy="12" r="10" strokeWidth="2" stroke={color} fill="none" />
        <Path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
        <Line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    warning: (
      <>
        <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2" stroke={color} fill="none" />
        <Line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    question: (
      <>
        <Circle cx="12" cy="12" r="10" strokeWidth="2" stroke={color} fill="none" />
        <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeWidth="2" strokeLinecap="round" stroke={color} fill="none" />
        <Line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    crosshair: (
      <>
        <Circle cx="12" cy="12" r="10" strokeWidth="2" stroke={color} fill="none" />
        <Line x1="22" y1="12" x2="18" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="6" y1="12" x2="2" y2="12" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="12" y1="6" x2="12" y2="2" strokeWidth="2" strokeLinecap="round" stroke={color} />
        <Line x1="12" y1="22" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" stroke={color} />
      </>
    ),
    check: <Polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke={color} fill="none" />,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name]}
    </Svg>
  );
};

// ── shared components ────────────────────────────────────────────────────────
const ScanFab = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.scanFab}>
    <Icon name="scan" size={26} color="white" />
  </TouchableOpacity>
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
    <View style={styles.bottomNav}>
      {tabs.map((t) =>
        t.id === "scan" ? (
          <View key="scan" style={{ alignItems: "center", marginTop: -20 }}>
            <ScanFab onPress={onScan} />
          </View>
        ) : (
          <TouchableOpacity
            key={t.id}
            onPress={() => onNav(t.id)}
            activeOpacity={0.7}
            style={styles.bottomNavTab}
          >
            <Icon name={t.icon} size={22} color={active === t.id ? GREEN : GRAY} />
            <Text
              style={{
                fontSize: 10,
                fontWeight: active === t.id ? "600" : "400",
                color: active === t.id ? GREEN : GRAY,
                marginTop: 2,
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const Price = ({ amount, size = 18 }) => (
  <View style={{ flexDirection: "row", alignItems: "baseline" }}>
    <Text style={{ fontSize: size, fontWeight: "700", color: DARK }}>{amount}</Text>
    <Text style={{ fontSize: size - 2, color: GREEN, fontWeight: "600", marginLeft: 2 }}>
      {MANAT}
    </Text>
  </View>
);

const Badge = ({ text, color = GREEN, bg = GREEN_LIGHT }) => (
  <View style={{ backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: "flex-start" }}>
    <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{text}</Text>
  </View>
);

const AllergenBadge = ({ label }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFF7ED",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#FED7AA",
      alignSelf: "flex-start",
    }}
  >
    <Icon name="warning" size={12} color="#C2410C" />
    <Text style={{ color: "#C2410C", fontSize: 11, fontWeight: "600", marginLeft: 4 }}>{label}</Text>
  </View>
);

// ── SCREEN 1: Login ──────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [code, setCode] = useState(["4", "8", "", ""]);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ alignItems: "center", paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: GREEN_LIGHT,
          borderWidth: 2,
          borderColor: GREEN,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: "700", color: GREEN }}>B</Text>
      </View>
      <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 2, color: GREEN, marginBottom: 8 }}>
        BRAVO ON-SITE
      </Text>
      <Text style={{ fontSize: 26, fontWeight: "800", color: DARK, marginBottom: 8, textAlign: "center" }}>
        Welcome to{"\n"}your assistant.
      </Text>
      <Text style={{ fontSize: 14, color: GRAY, textAlign: "center", marginBottom: 36, lineHeight: 21 }}>
        Sign in to access store maps, scan items,{"\n"}and check real-time stock.
      </Text>

      <View
        style={{
          width: "100%",
          backgroundColor: "#F9F9F9",
          borderRadius: 12,
          padding: 4,
          flexDirection: "row",
          marginBottom: 24,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: "white",
            alignItems: "center",
            ...shadow(1, 0.1, 4),
          }}
        >
          <Text style={{ fontWeight: "600", fontSize: 14, color: DARK }}>Phone Number</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" }}>
          <Text style={{ fontWeight: "500", fontSize: 14, color: GRAY }}>Email Address</Text>
        </TouchableOpacity>
      </View>

      <View style={{ width: "100%", marginBottom: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, color: GRAY, marginBottom: 8 }}>
          MOBILE NUMBER
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontSize: 18 }}>🇦🇿</Text>
          <Text style={{ fontWeight: "600", color: DARK, marginLeft: 8 }}>+994</Text>
          <Text style={{ color: "#ccc", marginHorizontal: 8 }}>|</Text>
          <Text style={{ color: "#ccc", fontSize: 14 }}>00 000 00 00</Text>
        </View>
      </View>

      <View style={{ width: "100%", marginBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, color: GRAY }}>
            VERIFICATION CODE
          </Text>
          <Text style={{ fontSize: 13, color: GREEN, fontWeight: "600" }}>Resend</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {code.map((v, i) => (
            <TextInput
              key={i}
              ref={inputRefs[i]}
              maxLength={1}
              value={v}
              keyboardType="number-pad"
              onChangeText={(text) => {
                const n = [...code];
                n[i] = text;
                setCode(n);
                if (text && i < 3) inputRefs[i + 1].current?.focus();
              }}
              style={{
                flex: 1,
                height: 56,
                textAlign: "center",
                fontSize: 22,
                fontWeight: "700",
                borderWidth: 2,
                borderColor: i === 1 ? GREEN : BORDER,
                borderRadius: 12,
                backgroundColor: i === 1 ? GREEN_LIGHT : "white",
                color: DARK,
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, width: "100%" }}>
        <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
        <Text style={{ fontSize: 13, color: GRAY, marginHorizontal: 16 }}>Or use</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
      </View>
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 28 }}>
        {["fingerprint", "smile"].map((name) => (
          <TouchableOpacity
            key={name}
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: DARK,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={name} size={24} color="white" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={onLogin}
        activeOpacity={0.85}
        style={{
          width: "100%",
          paddingVertical: 16,
          borderRadius: 14,
          backgroundColor: GREEN,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Continue to On-Site →</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 12, color: GRAY, textAlign: "center" }}>By continuing, you agree to our</Text>
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        <Text style={{ fontSize: 12, color: DARK, fontWeight: "600", textDecorationLine: "underline" }}>
          Terms
        </Text>
        <Text style={{ fontSize: 12, color: GRAY, marginHorizontal: 8 }}>&</Text>
        <Text style={{ fontSize: 12, color: DARK, fontWeight: "600", textDecorationLine: "underline" }}>
          Privacy Policy
        </Text>
      </View>
    </ScrollView>
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
    <ScrollView style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <View style={{ backgroundColor: "white", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: GREEN,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>B</Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontWeight: "700", fontSize: 15, color: DARK }}>Bravo On-Site</Text>
              <Text style={{ fontSize: 11, color: GRAY }}>Gənclik Mall</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Icon name="bell" size={22} color={GRAY} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={() => onNav("onsite-search")}
          activeOpacity={0.8}
          style={{
            backgroundColor: "white",
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: BORDER,
          }}
        >
          <Icon name="search" size={18} color={GRAY} />
          <Text style={{ fontSize: 14, color: "#aaa", marginLeft: 12, flex: 1 }}>
            Məhsul, brend və ya kateqoriya axtarın
          </Text>
          <TouchableOpacity onPress={() => onNav("scanner")}>
            <Icon name="scan" size={18} color={GREEN} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["#1a1a1a", "#2d2d2d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: "hidden", padding: 20 }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: GREEN,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>PREMIUM FEATURE</Text>
        </View>
        <Text style={{ color: "white", marginBottom: 6, fontSize: 20, fontWeight: "800" }}>
          Find products{"\n"}faster in-store
        </Text>
        <Text style={{ color: "#aaa", marginBottom: 16, fontSize: 13 }}>Navigate aisles & check stock.</Text>
        <TouchableOpacity
          onPress={() => onNav("map")}
          activeOpacity={0.85}
          style={{
            alignSelf: "flex-start",
            backgroundColor: "white",
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ color: DARK, fontSize: 13, fontWeight: "700" }}>Start Navigation →</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: DARK, marginBottom: 14 }}>Quick Actions</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { label: "Store Map", icon: "map", target: "map" },
            { label: "Deals", icon: "deals", target: "onsite" },
            { label: "My List", icon: "list", target: "onsite-search" },
            { label: "Orders", icon: "orders", target: "assistant" },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => onNav(a.target)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 8,
              }}
            >
              <Icon name={a.icon} size={22} color={GREEN} />
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: DARK, textAlign: "center", marginTop: 6 }}
              >
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Shop by Category</Text>
          <Text style={{ fontSize: 13, color: GREEN, fontWeight: "600" }}>See All</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.name}
              activeOpacity={0.8}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ fontSize: 26 }}>{c.emoji}</Text>
              <Text
                style={{ fontSize: 10, fontWeight: "600", color: DARK, textAlign: "center", marginTop: 6 }}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Featured Deals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 12, paddingBottom: 4 }}>
            {deals.map((d) => (
              <View
                key={d.name}
                style={{
                  width: 180,
                  backgroundColor: "white",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: BORDER,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: RED,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "white" }}>{d.discount}</Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 70,
                    backgroundColor: LIGHT_GRAY,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 30 }}>🫒</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: DARK, lineHeight: 16, marginBottom: 2 }}>
                  {d.name}
                </Text>
                <Text style={{ fontSize: 11, color: GRAY, marginBottom: 8 }}>{d.aisle}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                    <Price amount={d.price} size={15} />
                    <Text style={{ fontSize: 11, color: GRAY, textDecorationLine: "line-through", marginLeft: 4 }}>
                      {d.orig}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: GREEN,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="plus" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
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

  const handleTool = (label) => {
    if (label === "Find Product") onNav("onsite-search");
    else if (label === "Ask AI") onNav("assistant");
    else if (label === "Navigate") onNav("map");
    else onNav("scanner");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <View style={{ backgroundColor: "white", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: GREEN,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>B</Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={{ fontWeight: "700", fontSize: 15, color: DARK }}>Bravo On-Site</Text>
              <Text style={{ fontSize: 11, color: GRAY }}>Store Hub</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Icon name="bell" size={22} color={GRAY} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => onNav("onsite-search")}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: LIGHT_GRAY,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Icon name="search" size={16} color={GRAY} />
          <Text style={{ fontSize: 13, color: "#aaa", marginLeft: 12, flex: 1 }}>
            Məhsul, brend və ya kateqoriya axt
          </Text>
          <TouchableOpacity onPress={() => onNav("scanner")}>
            <Icon name="scan" size={16} color={GREEN} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View
        style={{
          margin: 12,
          marginHorizontal: 20,
          backgroundColor: "white",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: BORDER,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: BORDER,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: GRAY, fontWeight: "600", marginBottom: 2 }}>SELECT STORE</Text>
            <Text style={{ fontWeight: "700", fontSize: 15, color: DARK }}>Bravo Gənclik Mall</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: GREEN, fontWeight: "600" }}>Open until 23:00</Text>
            </View>
            <Icon name="chevronDown" size={16} color={GRAY} />
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: DARK, marginBottom: 8 }}>Nearby Branches</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { name: "Bravo 28 Mall", dist: "1.2 km", addr: "Füzuli küçəsi, Bakı" },
              { name: "Bravo Port Baku", dist: "2.5 km", addr: "Neftçilər prospekti" },
            ].map((b) => (
              <View
                key={b.name}
                style={{ flex: 1, backgroundColor: LIGHT_GRAY, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
              >
                <Text style={{ fontWeight: "700", fontSize: 13, color: DARK, marginBottom: 2 }}>
                  {b.name} <Text style={{ fontWeight: "400", color: GRAY }}>{b.dist}</Text>
                </Text>
                <Text style={{ fontSize: 11, color: GRAY, marginBottom: 6 }}>{b.addr}</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN, marginRight: 4 }} />
                  <Text style={{ fontSize: 11, color: GREEN, fontWeight: "600" }}>Open</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 12,
          backgroundColor: GREEN_LIGHT,
          borderRadius: 14,
          padding: 14,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: GREEN,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16 }}>💡</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: "700", fontSize: 13, color: DARK, marginBottom: 4 }}>In-Aisle Tip</Text>
          <Text style={{ fontSize: 12, color: GRAY, lineHeight: 18 }}>
            Looking for fresh bakery items? The Gənclik Mall branch restocks artisanal breads every day at 14:00.
            Head to Aisle 7.
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontWeight: "700", fontSize: 16, color: DARK, marginBottom: 12 }}>On-Site Tools</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {tools.map((t) => (
            <TouchableOpacity
              key={t.label}
              onPress={() => handleTool(t.label)}
              activeOpacity={0.8}
              style={{
                width: "47.5%",
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 14,
                padding: 16,
              }}
            >
              <View style={{ marginBottom: 8 }}>
                <Icon name={t.icon} size={24} color={DARK} />
              </View>
              <Text style={{ fontWeight: "700", fontSize: 13, color: DARK, marginBottom: 2 }}>{t.label}</Text>
              <Text style={{ fontSize: 11, color: GRAY }}>{t.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontWeight: "700", fontSize: 16 }}>In-Store Specials</Text>
          <Text style={{ fontSize: 13, color: GREEN, fontWeight: "600" }}>View All</Text>
        </View>
        {specials.map((s) => (
          <View
            key={s.name}
            style={{
              backgroundColor: "white",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: BORDER,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: LIGHT_GRAY,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
              {s.discount && (
                <View
                  style={{
                    position: "absolute",
                    top: -6,
                    left: -6,
                    backgroundColor: RED,
                    paddingHorizontal: 4,
                    paddingVertical: 1,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 9, fontWeight: "700" }}>{s.discount}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: "600", fontSize: 13, color: DARK, marginBottom: 2 }}>{s.name}</Text>
              <Text style={{ fontSize: 11, color: GRAY }}>{s.aisle}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Price amount={s.price} size={15} />
              {s.orig && (
                <Text style={{ fontSize: 11, color: GRAY, textDecorationLine: "line-through" }}>{s.orig}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <TouchableOpacity onPress={() => onNav("onsite")} style={{ padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: DARK }}>Search Results</Text>
            <Text style={{ fontSize: 12, color: GRAY }}>24 items found for "Milk"</Text>
          </View>
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: LIGHT_GRAY,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 12,
          }}
        >
          <Icon name="search" size={16} color={GRAY} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, fontSize: 14, color: DARK, marginHorizontal: 10, paddingVertical: 0 }}
          />
          <TouchableOpacity>
            <Icon name="close" size={14} color={GRAY} />
          </TouchableOpacity>
          <View style={{ width: 1, height: 16, backgroundColor: BORDER, marginHorizontal: 10 }} />
          <Icon name="filter" size={16} color={GRAY} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8, paddingBottom: 4 }}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: activeFilter === f ? GREEN : BORDER,
                  backgroundColor: activeFilter === f ? GREEN : "white",
                }}
              >
                <Text
                  style={{ color: activeFilter === f ? "white" : DARK, fontSize: 13, fontWeight: "600" }}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {products.map((p) => (
            <TouchableOpacity
              key={p.name}
              onPress={() => onProduct(p)}
              activeOpacity={0.85}
              style={{
                width: "47.5%",
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 100,
                  backgroundColor: LIGHT_GRAY,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 40 }}>{p.emoji}</Text>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: DARK, lineHeight: 16, marginBottom: 2 }}>
                  {p.name}
                </Text>
                <Text style={{ fontSize: 11, color: GRAY, marginBottom: 6 }}>{p.vol}</Text>
                <Price amount={p.price} size={15} />
                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: p.statusColor, marginRight: 4 }} />
                  <Text style={{ fontSize: 11, color: p.statusColor, fontWeight: "600" }}>{p.status}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Icon name="shelf" size={12} color={GRAY} />
                  <Text style={{ fontSize: 11, color: GRAY, marginLeft: 4 }}>{p.aisle}</Text>
                </View>
                <TouchableOpacity
                  style={{
                    paddingVertical: 7,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: BORDER,
                    backgroundColor: "white",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="navigate" size={12} color={GREEN} />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: DARK, marginLeft: 4 }}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ── SCREEN 5: Product Detail ─────────────────────────────────────────────────
const ProductScreen = ({ product, onBack, onNav }) => {
  const [tab, setTab] = useState("Details");
  const p =
    product || {
      name: "Milla Full Cream Milk 1L",
      price: "2.45",
      emoji: "🥛",
      aisle: "Aisle 3",
      shelf: "Shelf B",
      status: "In Stock",
      statusColor: GREEN,
    };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ backgroundColor: LIGHT_GRAY, paddingVertical: 20, position: "relative" }}>
          <TouchableOpacity
            onPress={onBack}
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: BORDER,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Icon name="back" size={18} color={DARK} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNav("assistant")}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: GREEN_LIGHT,
              borderWidth: 1,
              borderColor: GREEN,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              zIndex: 10,
            }}
          >
            <Icon name="robot" size={14} color={GREEN} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: GREEN, marginLeft: 6 }}>Ask AI</Text>
          </TouchableOpacity>
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={{ fontSize: 100 }}>{p.emoji}</Text>
          </View>
          <View style={{ alignItems: "center", marginTop: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: p.statusColor || GREEN,
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 12, fontWeight: "600", color: p.statusColor || GREEN }}>
                {p.status || "In Stock"} ({p.aisle} • {p.shelf})
              </Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: GRAY, letterSpacing: 1, marginBottom: 4 }}>
            MILLA DAIRY
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: DARK, flex: 1 }}>{p.name}</Text>
            <TouchableOpacity style={{ marginTop: 2, marginLeft: 8 }}>
              <Icon name="heart" size={22} color={GRAY} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: "#F59E0B" }}>★</Text>
            <Text style={{ fontWeight: "600", fontSize: 14, marginLeft: 8 }}>4.8</Text>
            <Text style={{ color: GRAY, fontSize: 13, marginLeft: 8 }}>(120 Reviews)</Text>
            <View style={{ marginLeft: 8 }}>
              <Price amount={p.price} size={18} />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            <AllergenBadge label="Contains Dairy" />
            <AllergenBadge label="Lactose" />
          </View>

          <View style={{ flexDirection: "row", borderBottomWidth: 2, borderBottomColor: BORDER, marginBottom: 16 }}>
            {["Details", "Ingredients", "Nutrition"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: tab === t ? GREEN : "transparent",
                  borderTopLeftRadius: tab === t ? 8 : 0,
                  borderTopRightRadius: tab === t ? 8 : 0,
                }}
              >
                <Text
                  style={{
                    fontWeight: tab === t ? "700" : "400",
                    fontSize: 14,
                    color: tab === t ? "white" : GRAY,
                  }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === "Details" && (
            <Text style={{ fontSize: 14, lineHeight: 24, color: GRAY, marginBottom: 20 }}>
              Premium quality full cream milk sourced from local farms. Rich in calcium and essential vitamins,
              perfect for your daily nutrition needs. Pasteurized and homogenized for freshness.
            </Text>
          )}
          {tab === "Ingredients" && (
            <Text style={{ fontSize: 14, lineHeight: 24, color: GRAY, marginBottom: 20 }}>
              Full cream milk (100%). Contains milk proteins, fat (min 3.5%), lactose, vitamins A, D, B12, and
              minerals including calcium and phosphorus.
            </Text>
          )}
          {tab === "Nutrition" && (
            <View style={{ marginBottom: 20 }}>
              {[
                ["Energy", "270 kJ / 64 kcal"],
                ["Fat", "3.5g"],
                ["Protein", "3.2g"],
                ["Carbohydrates", "4.7g"],
                ["Calcium", "120mg"],
              ].map(([k, v]) => (
                <View
                  key={k}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: BORDER,
                  }}
                >
                  <Text style={{ fontSize: 13, color: GRAY }}>{k}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: DARK }}>{v}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={{ fontSize: 15, fontWeight: "700", marginBottom: 12 }}>Similar Products</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            {[
              { name: "Azersun Milk 2.5%", price: "2.30", emoji: "🥛" },
              { name: "Palsud Fresh Milk", price: "2.60", emoji: "🥛" },
            ].map((sp) => (
              <View
                key={sp.name}
                style={{ flex: 1, backgroundColor: LIGHT_GRAY, borderRadius: 12, padding: 12, position: "relative" }}
              >
                <TouchableOpacity style={{ position: "absolute", top: 8, right: 8, zIndex: 5 }}>
                  <Icon name="heart" size={16} color={GRAY} />
                </TouchableOpacity>
                <Text style={{ fontSize: 40, textAlign: "center", marginBottom: 6 }}>{sp.emoji}</Text>
                <Text style={{ fontSize: 11, fontWeight: "600", color: DARK, marginBottom: 4 }}>{sp.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Price amount={sp.price} size={13} />
                  <TouchableOpacity
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: GREEN,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="plus" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          flexDirection: "row",
          gap: 12,
          backgroundColor: "white",
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: BORDER,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="list" size={16} color={DARK} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: DARK, marginLeft: 6 }}>Add to List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onNav("map")}
          style={{
            flex: 1.5,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: GREEN,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="navigate" size={16} color="white" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "white", marginLeft: 6 }}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── SCREEN 6: AI Scanner ─────────────────────────────────────────────────────
const ScannerScreen = ({ onBack, onProduct }) => {
  const [found, setFound] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFound(true), 1500);
    return () => clearTimeout(t);
  }, []);
  const scannedProduct = {
    name: "Milla Full Cream Milk 1L",
    price: "2.45",
    emoji: "🥛",
    aisle: "Aisle 3",
    shelf: "Shelf B",
    status: "In Stock",
    statusColor: GREEN,
  };
  return (
    <View style={{ flex: 1, backgroundColor: DARK }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 18,
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="back" size={18} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 17, fontWeight: "700" }}>AI Scanner</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 18,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="lightning" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 18,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="keyboard" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginBottom: 6 }}>Scan Product...</Text>
        <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>Point camera at barcode or label</Text>
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            maxHeight: 260,
            borderWidth: 2,
            borderColor: GREEN,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.05)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ position: "absolute", top: -2, left: -2, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
          <View style={{ position: "absolute", top: -2, right: -2, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
          <View style={{ position: "absolute", bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
          <View style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              backgroundColor: GREEN,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>● AI Active</Text>
          </View>
          <Text style={{ fontSize: 60, opacity: 0.3 }}>🥛</Text>
        </View>
      </View>

      {found && (
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: BORDER,
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginRight: 6 }} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: GREEN, letterSpacing: 1 }}>PRODUCT FOUND</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                width: 52,
                height: 52,
                backgroundColor: LIGHT_GRAY,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28 }}>{scannedProduct.emoji}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: "700", fontSize: 15, color: DARK, marginBottom: 4 }}>
                {scannedProduct.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Price amount={scannedProduct.price} size={15} />
                <Text style={{ fontSize: 12, color: GRAY }}>
                  {scannedProduct.aisle} · {scannedProduct.shelf}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => onProduct(scannedProduct)}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: BORDER,
                backgroundColor: "white",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: DARK }}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor: GREEN,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="navigate" size={14} color="white" />
              <Text style={{ fontSize: 14, fontWeight: "700", color: "white", marginLeft: 6 }}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ── SCREEN 7: Assistant ──────────────────────────────────────────────────────
const INITIAL_BOT_GREETING = {
  from: "bot",
  text: "Salam! Mən Bravo alış-veriş asistanıyam. Sizə necə kömək edə bilərəm?",
};

const AssistantScreen = ({ onNav }) => {
  const [messages, setMessages] = useState([INITIAL_BOT_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chips = ["5 AZN altı qəlyanaltılar", "Halal protein", "Allergensiz"];
  const scrollRef = useRef();
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { from: "user", text: trimmed };
    const history = messages;
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { text: reply, relevant } = await askAI({
        message: trimmed,
        history,
      });
      const products = relevant.slice(0, 2).map((p) => ({
        name: p.name,
        price: parseFloat(p.price_azn).toFixed(2),
        aisle: `${p.category} · ${p.subcategory}`,
        emoji: emojiFor(p.category),
      }));
      setMessages((m) => [...m, { from: "bot", text: reply, products }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: "bot", text: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_BOT_GREETING]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: GREEN,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>B</Text>
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: "700", fontSize: 15, color: DARK }}>Bravo On-Site</Text>
            <Text style={{ fontSize: 11, color: GREEN }}>AI Assistant</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={clearChat}
          style={{
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: GRAY }}>Clear Chat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
      >
        <Text style={{ textAlign: "center", fontSize: 12, color: GRAY, marginBottom: 16 }}>Bugün, 14:30</Text>
        {messages.map((m, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            {m.from === "bot" ? (
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: LIGHT_GRAY,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="robot" size={16} color={GREEN} />
                </View>
                <View style={{ maxWidth: "80%", marginLeft: 10 }}>
                  <View
                    style={{
                      backgroundColor: LIGHT_GRAY,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 16,
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      marginBottom: m.products ? 8 : 0,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: DARK, lineHeight: 21 }}>{m.text}</Text>
                  </View>
                  {m.products?.map((p) => (
                    <View
                      key={p.name}
                      style={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: BORDER,
                        borderRadius: 14,
                        padding: 12,
                        marginTop: 8,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            backgroundColor: LIGHT_GRAY,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontWeight: "600", fontSize: 13, color: DARK, marginBottom: 2 }}>
                            {p.name}
                          </Text>
                          <Price amount={p.price} size={14} />
                          <Text style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>📍 {p.aisle}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => onNav("map")}
                        style={{
                          paddingVertical: 9,
                          borderRadius: 10,
                          backgroundColor: GREEN,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="navigate" size={14} color="white" />
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "white", marginLeft: 6 }}>
                          Start Navigation
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <View
                  style={{
                    backgroundColor: GREEN,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 4,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    maxWidth: "75%",
                  }}
                >
                  <Text style={{ fontSize: 14, color: "white" }}>{m.text}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: LIGHT_GRAY,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="robot" size={16} color={GREEN} />
            </View>
            <View
              style={{
                marginLeft: 10,
                backgroundColor: LIGHT_GRAY,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="small" color={GREEN} />
              <Text style={{ fontSize: 14, color: GRAY, marginLeft: 8 }}>Axtarıram...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: BORDER, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10, paddingBottom: 2 }}>
            {chips.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => send(c)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: BORDER,
                  backgroundColor: "white",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "500", color: DARK }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: LIGHT_GRAY,
            borderRadius: 24,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send(input)}
            placeholder="Məhsul axtarın və ya soruşun..."
            placeholderTextColor="#999"
            style={{ flex: 1, fontSize: 14, color: DARK, paddingVertical: 0 }}
          />
          <TouchableOpacity style={{ marginHorizontal: 8 }}>
            <Icon name="mic" size={20} color={GRAY} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: GREEN,
              opacity: loading || !input.trim() ? 0.5 : 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ── SCREEN 8: Map / Indoor Navigation ────────────────────────────────────────
const MapScreen = ({ onBack }) => {
  const aisles = [
    { id: 1, x: 60, y: 60, w: 80, h: 100, label: "Aisle 1" },
    { id: 2, x: 160, y: 60, w: 80, h: 100, label: "Aisle 2" },
    { id: 3, x: 260, y: 60, w: 80, h: 100, label: "Aisle 3" },
    { id: 4, x: 60, y: 200, w: 70, h: 120, label: "Aisle 4" },
    { id: 5, x: 160, y: 200, w: 90, h: 120, label: "Aisle 5", active: true },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </TouchableOpacity>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: DARK }}>Indoor Navigation</Text>
            <Text style={{ fontSize: 12, color: GREEN, fontWeight: "600" }}>Bravo On-Site</Text>
          </View>
          <TouchableOpacity onPress={onBack}>
            <Icon name="close" size={22} color={GRAY} />
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              backgroundColor: LIGHT_GRAY,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>🥔</Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: "700", fontSize: 14, color: DARK }}>Lays Classic Çipsi 150q</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
              <Badge text="2.80 ₼" />
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                <Icon name="shelf" size={12} color={GRAY} />
                <Text style={{ fontSize: 12, color: GRAY, marginLeft: 4 }}>Aisle 5, Shelf B</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ alignItems: "center", marginTop: 10 }}>
          <View
            style={{
              backgroundColor: GREEN,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: "row",
            }}
          >
            <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>2 min</Text>
            <Text style={{ color: "white", fontSize: 13, fontWeight: "700", marginHorizontal: 12 }}>•</Text>
            <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>45m</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: "#F0F0EB" }}>
        <Svg width="100%" height="100%" viewBox="0 0 380 320">
          {[40, 80, 120, 160, 200, 240, 280, 320].map((y) => (
            <Line key={`h-${y}`} x1="0" y1={y} x2="380" y2={y} stroke="#E0DDD5" strokeWidth="1" />
          ))}
          {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
            <Line key={`v-${x}`} x1={x} y1="0" x2={x} y2="320" stroke="#E0DDD5" strokeWidth="1" />
          ))}
          {aisles.map((a) => (
            <G key={a.id}>
              <Rect
                x={a.x}
                y={a.y}
                width={a.w}
                height={a.h}
                rx="6"
                fill={a.active ? GREEN_LIGHT : "white"}
                stroke={a.active ? GREEN : "#D0CCC0"}
                strokeWidth={a.active ? 2 : 1}
              />
              <SvgText
                x={a.x + a.w / 2}
                y={a.y + a.h / 2}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={a.active ? GREEN : GRAY}
              >
                {a.label}
              </SvgText>
            </G>
          ))}
          <Polyline
            points="205,290 205,200 140,200 140,160"
            fill="none"
            stroke={GREEN}
            strokeWidth="3"
            strokeDasharray="8,4"
            strokeLinecap="round"
          />
          <Circle cx="205" cy="240" r="10" fill={RED} />
          <Circle cx="205" cy="240" r="6" fill="white" />
          <Circle cx="140" cy="165" r="10" fill="white" stroke={GREEN} strokeWidth="2" />
          <Circle cx="140" cy="165" r="5" fill={GREEN} />
        </Svg>

        <View style={{ position: "absolute", right: 16, top: 16 }}>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: BORDER,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: DARK }}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              backgroundColor: "white",
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderColor: BORDER,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: DARK }}>−</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 16,
            bottom: 8,
            width: 40,
            height: 40,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="crosshair" size={20} color={GREEN} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: BORDER,
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: GREEN,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="arrowUp" size={24} color="white" />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: GRAY, letterSpacing: 1 }}>
              CURRENT INSTRUCTION
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: DARK, marginVertical: 2 }}>Go straight 20m</Text>
            <Text style={{ fontSize: 13, color: GRAY }}>towards Bakery section</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: LIGHT_GRAY,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <Icon name="question" size={16} color={GRAY} />
          <Text style={{ fontSize: 13, color: GRAY, marginLeft: 8 }}>
            Then <Text style={{ fontWeight: "700", color: DARK }}>turn left at Bakery</Text>
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: DARK }}>🔊 Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: "#FEE2E2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: RED }}>🟥 End Route</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
      case "login":
        return <LoginScreen onLogin={() => nav("home")} />;
      case "home":
        return <HomeScreen onNav={nav} />;
      case "onsite":
        return <OnSiteScreen onNav={nav} />;
      case "onsite-search":
        return <SearchScreen onProduct={handleProduct} onNav={nav} />;
      case "product":
        return <ProductScreen product={selectedProduct} onBack={goBack} onNav={nav} />;
      case "scanner":
        return <ScannerScreen onBack={goBack} onProduct={handleProduct} />;
      case "assistant":
        return <AssistantScreen onNav={nav} />;
      case "map":
        return <MapScreen onBack={goBack} />;
      default:
        return <HomeScreen onNav={nav} />;
    }
  };

  const noBottomNav = ["login", "scanner"].includes(screen);
  const activeTab =
    ["home", "onsite", "onsite-search", "assistant", "map"].find((t) => screen.startsWith(t)) || "home";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: screen === "scanner" ? DARK : "white" }}>
      <StatusBar barStyle={screen === "scanner" ? "light-content" : "dark-content"} />
      <View style={{ flex: 1, backgroundColor: "white" }}>{renderScreen()}</View>
      {!noBottomNav && <BottomNav active={activeTab} onNav={nav} onScan={() => nav("scanner")} />}
    </SafeAreaView>
  );
}

function emojiFor(category = "") {
  const c = category.toLowerCase();
  if (c.includes("dairy")) return "🥛";
  if (c.includes("bak")) return "🍞";
  if (c.includes("meat")) return "🥩";
  if (c.includes("fish") || c.includes("sea")) return "🐟";
  if (c.includes("fruit")) return "🍎";
  if (c.includes("veg")) return "🥦";
  if (c.includes("snack") || c.includes("chip")) return "🥔";
  if (c.includes("bev") || c.includes("drink")) return "🥤";
  if (c.includes("clean") || c.includes("household")) return "🧴";
  if (c.includes("baby")) return "🍼";
  if (c.includes("pet")) return "🐶";
  return "🛒";
}

function shadow(offsetY, opacity, radius) {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation: Math.round(radius / 2) },
    default: {},
  });
}

const styles = StyleSheet.create({
  scanFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: DARK,
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottomNavTab: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 48,
    paddingVertical: 2,
  },
});
