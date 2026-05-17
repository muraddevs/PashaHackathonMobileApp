import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  askAI,
  getInsights,
  analyzeProduct,
  getRecipe,
  isRecipeIntent,
  getMealPlan,
  scanListFromImage,
} from "./src/services/ai";
import { login } from "./src/services/auth";
import {
  getAnalytics,
  findRelevant,
  getCriticalActions,
  getStockHealth,
  recommend,
  getDiscount,
  effectivePrice,
  dietaryTags,
  filterByDiet,
  getRescueItems,
  getTrafficByAisle,
  getPlacementSuggestions,
  getRestockPlan,
  getProducts,
  getMorningMissions,
  aislePopularity,
  getUpcomingDeals,
  premiumPrice,
  totalDiscountPct,
  loyaltyDiscount,
  getListSuggestions,
} from "./src/data/productHelpers";
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

// Apple-style spacing / radius scale. Keep usage consistent across screens.
const R = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};
const SP = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
const SOFT_BG = "#F2F2F7"; // iOS grouped table background
const SUBTLE_BORDER = "#E5E5EA";
const TEXT_MUTED = "#8E8E93";
const TEXT_TITLE = "#1C1C1E";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const submit = () => {
    setError(null);
    try {
      const u = login(username, password);
      onLogin(u);
    } catch (e) {
      setError(e.message);
    }
  };

  const quickFill = (role) => {
    setUsername(role);
    setPassword(role);
    setError(null);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ alignItems: "center", paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      decelerationRate="fast"
      scrollEventThrottle={16}
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
        Welcome back.
      </Text>
      <Text style={{ fontSize: 14, color: GRAY, textAlign: "center", marginBottom: 32, lineHeight: 21 }}>
        Sign in to access store maps, scan items,{"\n"}and check real-time stock.
      </Text>

      <View style={{ width: "100%", marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, color: GRAY, marginBottom: 8 }}>
          USERNAME
        </Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="user or admin"
          placeholderTextColor="#bbb"
          style={{
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: DARK,
          }}
        />
      </View>

      <View style={{ width: "100%", marginBottom: 12 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, color: GRAY, marginBottom: 8 }}>
          PASSWORD
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="••••"
          placeholderTextColor="#bbb"
          onSubmitEditing={submit}
          style={{
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 15,
            color: DARK,
          }}
        />
      </View>

      {error && (
        <View
          style={{
            width: "100%",
            backgroundColor: "#FEF2F2",
            borderWidth: 1,
            borderColor: "#FECACA",
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: RED, fontSize: 13 }}>⚠️ {error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={submit}
        activeOpacity={0.85}
        style={{
          width: "100%",
          paddingVertical: 16,
          borderRadius: 14,
          backgroundColor: GREEN,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Sign in →</Text>
      </TouchableOpacity>

      <View style={{ width: "100%", marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: GRAY, letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>
          QUICK SIGN-IN (DEMO)
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => quickFill("user")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: GREEN_LIGHT,
              borderWidth: 1,
              borderColor: GREEN,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: GREEN }}>Shopper</Text>
            <Text style={{ fontSize: 11, color: GREEN, marginTop: 2 }}>user / user</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => quickFill("admin")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: "#FEF3C7",
              borderWidth: 1,
              borderColor: "#F59E0B",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#B45309" }}>Admin</Text>
            <Text style={{ fontSize: 11, color: "#B45309", marginTop: 2 }}>admin / admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{ fontSize: 12, color: GRAY, textAlign: "center", marginTop: 8 }}>
        By continuing, you agree to our
      </Text>
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        <Text style={{ fontSize: 12, color: DARK, fontWeight: "600", textDecorationLine: "underline" }}>Terms</Text>
        <Text style={{ fontSize: 12, color: GRAY, marginHorizontal: 8 }}>&</Text>
        <Text style={{ fontSize: 12, color: DARK, fontWeight: "600", textDecorationLine: "underline" }}>Privacy Policy</Text>
      </View>
    </ScrollView>
  );
};

// ── SCREEN 2: Home ───────────────────────────────────────────────────────────
const HomeScreen = ({ onNav, shoppingListCount = 0, user, onSearch }) => {
  const categories = [
    { name: "Vegetables", emoji: "🥦", query: "vegetable produce" },
    { name: "Sea Fish", emoji: "🐟", query: "fish seafood" },
    { name: "Eggs", emoji: "🥚", query: "egg dairy" },
    { name: "Fruits", emoji: "🍊", query: "fruit produce" },
  ];
  const deals = [
    { name: "Premium Extra Virgin Olive Oil 1L", aisle: "Aisle 4, Shelf B", price: "10.15", orig: "14.50", discount: "-30%" },
    { name: "Fresh Farm Honey 500g", aisle: "Aisle 2, Shelf A", price: "7.80", orig: "9.50", discount: "-15%" },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: LIGHT_GRAY }} decelerationRate="fast" scrollEventThrottle={16}>
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

      {user?.premium ? (
        <TouchableOpacity
          onPress={() => onNav("premium")}
          activeOpacity={0.9}
          style={{ marginHorizontal: 20, marginBottom: 16 }}
        >
          <LinearGradient
            colors={["#0F172A", "#1E293B", "#334155"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 18, overflow: "hidden", padding: 18 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F59E0B",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }}>
                  👑 {user.tier?.toUpperCase() || "PREMIUM"}
                </Text>
              </View>
              <Text
                style={{
                  color: "#FCD34D",
                  fontSize: 11,
                  fontWeight: "700",
                  marginLeft: 8,
                }}
              >
                Active member
              </Text>
            </View>
            <Text
              style={{
                color: "white",
                marginBottom: 4,
                fontSize: 19,
                fontWeight: "800",
              }}
            >
              Your perks, {user.name?.split(" ")[0] || "shopper"}
            </Text>
            <Text style={{ color: "#CBD5E1", marginBottom: 12, fontSize: 13, lineHeight: 19 }}>
              First in line for tomorrow's markdowns · weekly meal plans
              tuned to your goals
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.18)",
                  borderWidth: 1,
                  borderColor: "rgba(74, 222, 128, 0.5)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                <Text style={{ color: "#86EFAC", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }}>
                  EARLY ACCESS
                </Text>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "800", marginTop: 1 }}>
                  Tomorrow's deals
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "rgba(168, 85, 247, 0.22)",
                  borderWidth: 1,
                  borderColor: "rgba(192, 132, 252, 0.5)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                <Text style={{ color: "#D8B4FE", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }}>
                  MEAL PLAN
                </Text>
                <Text style={{ color: "white", fontSize: 14, fontWeight: "800", marginTop: 1 }}>
                  7 dinners weekly
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
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
            <Text style={{ color: "white", fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
              UNLOCK PREMIUM
            </Text>
          </View>
          <Text style={{ color: "white", marginBottom: 6, fontSize: 20, fontWeight: "800" }}>
            Save more,{"\n"}see deals early
          </Text>
          <Text style={{ color: "#aaa", marginBottom: 16, fontSize: 13 }}>
            24h early access to markdowns + a weekly meal plan tuned to your goals.
          </Text>
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
            <Text style={{ color: DARK, fontSize: 13, fontWeight: "700" }}>Learn more →</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 17, fontWeight: "700", color: TEXT_TITLE, marginBottom: 12 }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[
            { label: "Map", icon: "map", target: "map", tint: "#0EA5E9" },
            { label: "Rescue", icon: "deals", target: "rescue", tint: GREEN },
            {
              label: "My List",
              icon: "list",
              target: "list",
              tint: "#8B5CF6",
              badge: shoppingListCount > 0 ? shoppingListCount : null,
            },
            { label: "Recipes", icon: "robot", target: "assistant", tint: "#F59E0B" },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => onNav(a.target)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: R.md,
                paddingVertical: 14,
                paddingHorizontal: 4,
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                  },
                  android: { elevation: 1 },
                }),
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: `${a.tint}1A`, // 10% alpha
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Icon name={a.icon} size={18} color={a.tint} />
                {a.badge != null && (
                  <View
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -6,
                      backgroundColor: RED,
                      borderRadius: 8,
                      minWidth: 16,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: "white",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 10, fontWeight: "800" }}>
                      {a.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={{ fontSize: 12, fontWeight: "600", color: TEXT_TITLE, textAlign: "center" }}
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
          <TouchableOpacity onPress={() => onSearch && onSearch("")}>
            <Text style={{ fontSize: 13, color: GREEN, fontWeight: "600" }}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.name}
              onPress={() => onSearch && onSearch(c.query || c.name)}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast">
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
    <ScrollView style={{ flex: 1, backgroundColor: LIGHT_GRAY }} decelerationRate="fast" scrollEventThrottle={16}>
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
const SearchScreen = ({
  onProduct,
  onNav,
  onBack,
  onAddToList,
  inList = [],
  user,
  initialQuery,
  onConsumed,
}) => {
  const [query, setQuery] = useState(
    initialQuery != null ? initialQuery : "Milk"
  );
  const [activeFilter, setActiveFilter] = useState("All");
  const [diet, setDiet] = useState(null);
  // If a new initialQuery comes in (e.g. user taps another category tile
  // while we're already on the Search screen), update the field.
  useEffect(() => {
    if (initialQuery != null) {
      setQuery(initialQuery);
      onConsumed && onConsumed();
    }
  }, [initialQuery]);
  const filters = ["All", "Dairy", "Bakery", "Snacks", "Beverages"];
  const diets = [
    { id: "halal", label: "Halal" },
    { id: "vegan", label: "Vegan" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "glutenfree", label: "Gluten-free" },
    { id: "lactosefree", label: "Lactose-free" },
  ];

  const products = useMemo(() => {
    const q = activeFilter === "All" ? query : `${query} ${activeFilter}`;
    let results = findRelevant(q, 60);
    if (diet) results = filterByDiet(results, diet);
    return results.slice(0, 24).map((p) => {
      const statusLabel =
        p.stock_qty === 0 ? "Out of Stock" :
        p.status === "low_stock" || p.status === "expiring" ? "Low Stock" :
        "In Stock";
      const statusColor =
        statusLabel === "Out of Stock" ? RED :
        statusLabel === "Low Stock" ? ORANGE :
        GREEN;
      return {
        ...p,
        displayPrice: effectivePrice(p).toFixed(2),
        statusLabel,
        statusColor,
        emoji: emojiFor(p.category),
      };
    });
  }, [query, activeFilter, diet]);

  const inListIds = new Set(inList.map((p) => p.product_id));
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <TouchableOpacity onPress={onBack || (() => onNav("onsite"))} style={{ padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: DARK }}>Search Results</Text>
            <Text style={{ fontSize: 12, color: GRAY }}>
              {products.length} items found{query ? ` for "${query}"` : ""}
            </Text>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast">
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast">
          <View style={{ flexDirection: "row", gap: 6, paddingTop: 8 }}>
            <Text style={{ fontSize: 11, color: GRAY, fontWeight: "700", letterSpacing: 0.5, alignSelf: "center", marginRight: 4 }}>
              DIET:
            </Text>
            {diets.map((d) => {
              const active = diet === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDiet(active ? null : d.id)}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: active ? GREEN : BORDER,
                    backgroundColor: active ? GREEN_LIGHT : "white",
                  }}
                >
                  <Text style={{ color: active ? GREEN : GRAY, fontSize: 11, fontWeight: "600" }}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }} decelerationRate="fast" scrollEventThrottle={16}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {products.map((p) => (
            <TouchableOpacity
              key={p.product_id}
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
                <Text style={{ fontSize: 12, fontWeight: "600", color: DARK, lineHeight: 16, marginBottom: 2 }} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={{ fontSize: 11, color: GRAY, marginBottom: 4 }}>{p.size}</Text>
                <PriceWithDiscount product={p} size={14} user={user} />
                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: p.statusColor, marginRight: 4 }} />
                  <Text style={{ fontSize: 11, color: p.statusColor, fontWeight: "600" }}>{p.statusLabel}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Icon name="shelf" size={12} color={GRAY} />
                  <Text style={{ fontSize: 11, color: GRAY, marginLeft: 4 }} numberOfLines={1}>
                    {p.location}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation && e.stopPropagation();
                    onAddToList && onAddToList(p);
                  }}
                  style={{
                    paddingVertical: 7,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: inListIds.has(p.product_id) ? GREEN : BORDER,
                    backgroundColor: inListIds.has(p.product_id) ? GREEN_LIGHT : "white",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    name={inListIds.has(p.product_id) ? "check" : "plus"}
                    size={12}
                    color={GREEN}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: inListIds.has(p.product_id) ? GREEN : DARK,
                      marginLeft: 4,
                    }}
                  >
                    {inListIds.has(p.product_id) ? "On List" : "Add to List"}
                  </Text>
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
const ProductScreen = ({ product, onBack, onNav, user, onAddToList, inList = [], onShowRoute }) => {
  const onListAlready = inList.some((x) => x.product_id === product?.product_id);
  const [tab, setTab] = useState("Details");
  const [favorite, setFavorite] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const isAdmin = user?.role === "admin";
  const recommendation = useMemo(() => {
    if (!isAdmin || !product || product.product_id == null) return null;
    return recommend(product);
  }, [isAdmin, product]);

  const fetchAiAnalysis = async () => {
    if (!product) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const text = await analyzeProduct(product);
      setAiAnalysis(text);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Normalise: enriched products come from the catalog; older mock callers
  // (e.g. the scanner) still pass simpler shapes.
  const raw = product || {};
  const isEnriched = raw.product_id != null;
  const p = isEnriched
    ? {
        ...raw,
        emoji: raw.emoji || emojiFor(raw.category),
        displayPrice: raw.price_azn.toFixed(2),
        statusLabel:
          raw.stock_qty === 0 ? "Out of Stock" :
          raw.status === "low_stock" ? "Low Stock" :
          raw.status === "expiring" ? "Expiring Soon" :
          "In Stock",
        statusColor:
          raw.stock_qty === 0 ? RED :
          raw.status === "low_stock" || raw.status === "expiring" ? ORANGE :
          GREEN,
      }
    : {
        name: raw.name || "Milla Full Cream Milk 1L",
        emoji: raw.emoji || "🥛",
        brand: raw.brand || "Milla Dairy",
        displayPrice: raw.price || "2.45",
        statusLabel: raw.status || "In Stock",
        statusColor: raw.statusColor || GREEN,
        location: raw.aisle ? `${raw.aisle} · ${raw.shelf || ""}`.trim() : "Aisle 3 · Shelf B",
        category: "Dairy",
        subcategory: "Milk",
        rating: 4.8,
        units_sold: 120,
        is_fresh: true,
        expires_in_days: 1.2,
        fat_percentage: 3.5,
        size: raw.vol || "1L",
        origin_country: "Azerbaijan",
        stock_qty: 100,
      };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={{ flex: 1 }} decelerationRate="fast" scrollEventThrottle={16}>
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
              <Text style={{ fontSize: 12, fontWeight: "600", color: p.statusColor }}>
                {p.statusLabel} • {p.location}
              </Text>
            </View>
          </View>
        </View>

        {isAdmin && recommendation && (
          <ManagerCard
            product={p}
            recommendation={recommendation}
            aiAnalysis={aiAnalysis}
            aiLoading={aiLoading}
            aiError={aiError}
            onGenerate={fetchAiAnalysis}
          />
        )}

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: GRAY, letterSpacing: 1, marginBottom: 4 }}>
            {(p.brand || "").toUpperCase()}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: DARK, flex: 1 }}>{p.name}</Text>
            <TouchableOpacity onPress={() => setFavorite((v) => !v)} style={{ marginTop: 2, marginLeft: 8 }}>
              <Icon name="heart" size={22} color={favorite ? RED : GRAY} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <Text style={{ fontSize: 14, color: "#F59E0B" }}>★</Text>
            <Text style={{ fontWeight: "600", fontSize: 14, marginLeft: 6 }}>
              {(p.rating || 0).toFixed(1)}
            </Text>
            <Text style={{ color: GRAY, fontSize: 13, marginLeft: 8 }}>
              ({p.units_sold || 0} sold/30d)
            </Text>
            <View style={{ marginLeft: 12 }}>
              {p.product_id != null ? (
                <PriceWithDiscount product={p} size={18} user={user} />
              ) : (
                <Price amount={p.displayPrice} size={18} />
              )}
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {p.is_fresh && p.expires_in_days != null && (
              <AllergenBadge
                label={
                  p.expires_in_days <= 1
                    ? `Expires in ${p.expires_in_days}d`
                    : `Fresh • ${p.expires_in_days}d shelf life`
                }
              />
            )}
            {p.fat_percentage != null && (
              <AllergenBadge label={`Fat ${p.fat_percentage.toFixed(1)}%`} />
            )}
            {p.origin_country && (
              <AllergenBadge label={`Origin: ${p.origin_country}`} />
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              backgroundColor: LIGHT_GRAY,
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              gap: 14,
            }}
          >
            <InfoStat label="Size" value={p.size} />
            <InfoStat label="Category" value={p.subcategory || p.category} />
            <InfoStat label="In stock" value={p.stock_qty} />
            <InfoStat label="Aisle" value={p.location} flex2 />
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
              {p.name} by {p.brand}. {p.size} pack of {p.subcategory || p.category}, sourced from{" "}
              {p.origin_country || "local suppliers"}. Currently stocked at {p.location}.
              {p.is_fresh
                ? ` Fresh item — best consumed within ${p.expires_in_days} day(s).`
                : ` Long shelf-life — approx ${p.expires_in_days} days remaining.`}
            </Text>
          )}
          {tab === "Ingredients" && (
            <Text style={{ fontSize: 14, lineHeight: 24, color: GRAY, marginBottom: 20 }}>
              Ingredient information is not yet available in our catalog for this SKU. Tap "Ask AI"
              above for product-specific dietary, allergen, or substitution advice based on the
              brand and category.
            </Text>
          )}
          {tab === "Nutrition" && (
            <View style={{ marginBottom: 20 }}>
              {[
                p.fat_percentage != null ? ["Fat", `${p.fat_percentage.toFixed(1)}%`] : null,
                ["Size", p.size || "—"],
                ["Origin", p.origin_country || "—"],
                p.is_fresh ? ["Days to expiry", `${p.expires_in_days}`] : null,
                ["Rating", `${(p.rating || 0).toFixed(1)} / 5`],
              ].filter(Boolean).map(([k, v]) => (
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
          onPress={() => p && p.product_id != null && onAddToList && onAddToList(p)}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: onListAlready ? GREEN : BORDER,
            backgroundColor: onListAlready ? GREEN_LIGHT : "white",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={onListAlready ? "check" : "list"} size={16} color={onListAlready ? GREEN : DARK} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: onListAlready ? GREEN : DARK, marginLeft: 6 }}>
            {onListAlready ? "On Your List" : "Add to List"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => (onShowRoute ? onShowRoute(p) : onNav("map"))}
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
const ScannerScreen = ({ onBack, onProduct, onAddToList, onShowRoute }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [found, setFound] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  // mode: "barcode" (live scan) | "list" (photo of a paper shopping list)
  const [mode, setMode] = useState("barcode");
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  // Result of a successful list scan: { items: [string], matched: [{name, product}] }
  const [listResult, setListResult] = useState(null);
  const cameraRef = useRef(null);
  const isWeb = Platform.OS === "web";
  const barcodeTypes = useMemo(
    () => [
      "ean13",
      "ean8",
      "upc_a",
      "upc_e",
      "code128",
      "code39",
    ],
    []
  );

  useEffect(() => {
    if (isWeb) {
      setHasPermission(false);
      return;
    }

    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        setPermissionError(true);
        setHasPermission(false);
      }
    })();
  }, [isWeb]);

  const scannedProduct = {
    name: "Milla Full Cream Milk 1L",
    price: "2.45",
    emoji: "🥛",
    aisle: "Aisle 3",
    shelf: "Shelf B",
    status: "In Stock",
    statusColor: GREEN,
    barcode: scannedData?.data || "Unknown",
  };

  const handleBarCodeScanned = ({ data }) => {
    if (!found) {
      setScannedData({ data });
      setFound(true);
    }
  };

  const resetScanner = () => {
    setFound(false);
    setScannedData(null);
    setListResult(null);
    setListError(null);
  };

  const processImage = async (base64) => {
    if (!base64) return;
    setListLoading(true);
    setListError(null);
    setListResult(null);
    try {
      const result = await scanListFromImage(base64);
      if (!result.matched || result.matched.length === 0) {
        setListError(
          "Couldn't read any products from the list. Try a clearer, better-lit photo."
        );
      } else {
        setListResult(result);
      }
    } catch (err) {
      setListError(err.message || "Could not scan list.");
    } finally {
      setListLoading(false);
    }
  };

  const captureListFromCamera = async () => {
    if (!cameraRef.current || listLoading) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        skipProcessing: true,
      });
      await processImage(photo.base64);
    } catch (err) {
      setListError("Could not capture photo. Please try again.");
    }
  };

  const pickListFromGallery = async () => {
    if (listLoading) return;
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setListError("Gallery permission is required to upload a list photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions
          ? ImagePicker.MediaTypeOptions.Images
          : "Images",
        base64: true,
        quality: 0.5,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.base64) {
        setListError("Could not read the selected image.");
        return;
      }
      await processImage(asset.base64);
    } catch (err) {
      setListError(err.message || "Could not open gallery.");
    }
  };

  const navigateScannedList = () => {
    if (!listResult?.matched?.length) return;
    const products = listResult.matched.map((m) => m.product).filter(Boolean);
    if (onAddToList) {
      for (const p of products) onAddToList(p);
    }
    if (onShowRoute) onShowRoute(products);
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
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={pickListFromGallery}
            disabled={listLoading}
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 18,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              opacity: listLoading ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 16 }}>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginLeft: 12,
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

      {/* Mode toggle: Barcode | List */}
      <View
        style={{
          flexDirection: "row",
          alignSelf: "center",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 18,
          padding: 3,
          marginBottom: 12,
        }}
      >
        {[
          { id: "barcode", label: "Barcode" },
          { id: "list", label: "Scan List" },
        ].map((opt) => {
          const active = mode === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => {
                setMode(opt.id);
                resetScanner();
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 15,
                backgroundColor: active ? GREEN : "transparent",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginBottom: 6 }}>
          {mode === "list" ? "Scan a Shopping List" : "Scan Product..."}
        </Text>
        <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 32 }}>
          {mode === "list"
            ? "Point camera at a written list or upload a photo"
            : "Point camera at barcode or label"}
        </Text>
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
            overflow: "hidden",
          }}
        >
          {hasPermission === null ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : hasPermission === false ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
              <Text style={{ color: "white", fontSize: 14, textAlign: "center" }}>
                {isWeb
                  ? "Camera scanning is not available in a browser. Open the app on a phone to use live scan."
                  : permissionError
                  ? "Unable to access the camera. Please try again later."
                  : "Camera permission is required to scan products."}
              </Text>
              {isWeb ? null : (
                <Text style={{ color: "#aaa", fontSize: 12, marginTop: 8, textAlign: "center" }}>
                  Please allow camera access in your phone settings and reopen the scanner.
                </Text>
              )}
            </View>
          ) : (
            <>
              <CameraView
                ref={cameraRef}
                style={{ flex: 1, width: "100%" }}
                facing="back"
                barcodeScannerSettings={mode === "barcode" ? { barcodeTypes } : undefined}
                onBarcodeScanned={
                  mode === "barcode" && !found ? handleBarCodeScanned : undefined
                }
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "space-between",
                  paddingVertical: 14,
                }}
              >
                <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12 }}>
                  <View style={{ width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
                  <View style={{ width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
                </View>
                <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12 }}>
                  <View style={{ width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
                  <View style={{ width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: GREEN, borderRadius: 2 }} />
                </View>
              </View>
              {listLoading && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.55)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="white" />
                  <Text style={{ color: "white", marginTop: 10, fontWeight: "600" }}>
                    Reading your list...
                  </Text>
                </View>
              )}
            </>
          )}
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
            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>
              {mode === "list" ? "● List Scan" : "● AI Active"}
            </Text>
          </View>
        </View>

        {/* List-mode capture & gallery buttons */}
        {mode === "list" && hasPermission && !listResult && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
            <TouchableOpacity
              onPress={captureListFromCamera}
              disabled={listLoading}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 22,
                paddingVertical: 13,
                borderRadius: 14,
                backgroundColor: GREEN,
                flexDirection: "row",
                alignItems: "center",
                opacity: listLoading ? 0.6 : 1,
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>📸</Text>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "800" }}>
                Capture List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickListFromGallery}
              disabled={listLoading}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 13,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
                flexDirection: "row",
                alignItems: "center",
                opacity: listLoading ? 0.6 : 1,
              }}
            >
              <Text style={{ fontSize: 18, marginRight: 6 }}>🖼️</Text>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>
                Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gallery-only fallback when the camera isn't available (e.g. web). */}
        {mode === "list" && hasPermission === false && !isWeb && (
          <TouchableOpacity
            onPress={pickListFromGallery}
            disabled={listLoading}
            activeOpacity={0.85}
            style={{
              marginTop: 16,
              paddingHorizontal: 22,
              paddingVertical: 13,
              borderRadius: 14,
              backgroundColor: GREEN,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 8 }}>🖼️</Text>
            <Text style={{ color: "white", fontSize: 14, fontWeight: "800" }}>
              Upload from Gallery
            </Text>
          </TouchableOpacity>
        )}

        {listError && (
          <Text
            style={{
              color: "#FCA5A5",
              fontSize: 12,
              marginTop: 12,
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            {listError}
          </Text>
        )}
      </View>

      {listResult && (
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "55%",
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
            <Text style={{ fontSize: 11, fontWeight: "700", color: GREEN, letterSpacing: 1, flex: 1 }}>
              {listResult.matched.length} ITEM{listResult.matched.length === 1 ? "" : "S"} FOUND
            </Text>
            <TouchableOpacity onPress={resetScanner}>
              <Text style={{ fontSize: 11, color: GRAY, fontWeight: "600" }}>Rescan</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            {listResult.matched.map((m, i) => (
              <TouchableOpacity
                key={`${m.product.product_id}-${i}`}
                activeOpacity={0.7}
                onPress={() => onProduct && onProduct(m.product)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth: i < listResult.matched.length - 1 ? 1 : 0,
                  borderBottomColor: BORDER,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: GREEN_LIGHT,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: GREEN, fontWeight: "800", fontSize: 11 }}>
                    {m.product.aisle_num}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: DARK }} numberOfLines={1}>
                    {m.product.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: GRAY }} numberOfLines={1}>
                    "{m.name}" · Aisle {m.product.aisle_num} · {effectivePrice(m.product).toFixed(2)} ₼
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={navigateScannedList}
            activeOpacity={0.85}
            style={{
              marginTop: 14,
              paddingVertical: 13,
              borderRadius: 12,
              backgroundColor: GREEN,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="navigate" size={16} color="white" />
            <Text style={{ color: "white", fontSize: 14, fontWeight: "800", marginLeft: 6 }}>
              Add all & Navigate Store
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {found && mode === "barcode" && (
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
          <View style={{ flexDirection: "row" }}>
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
                marginLeft: 12,
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
  text:
    "Salam! Mən Bravo köməkçisiyəm. Sizə necə kömək edə bilərəm?\n" +
    "Hi! I'm the Bravo assistant — how can I help?\n" +
    "Привет! Я ассистент Bravo. Чем могу помочь?",
};

const RecipeIngredientRow = ({ ingredient, product, onPress, cold }) => {
  const aisleBg = cold ? "#FEF3C7" : GREEN_LIGHT;
  const aisleColor = cold ? "#B45309" : GREEN;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 7,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: aisleBg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}
      >
        <Text style={{ color: aisleColor, fontWeight: "800", fontSize: 12 }}>
          {product.aisle_num || "?"}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: DARK, fontWeight: "600" }} numberOfLines={1}>
          {ingredient.name}
        </Text>
        <Text style={{ fontSize: 11, color: TEXT_MUTED }} numberOfLines={1}>
          {product.name} · Aisle {product.aisle_num} ·{" "}
          {effectivePrice(product).toFixed(2)} ₼
          {cold ? " · less crowded" : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const RecipeCard = ({ recipe, onProduct, onAddAll, onNav, onShowRoute, onAddToList }) => {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 14,
        padding: 12,
        marginTop: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 22, marginRight: 8 }}>🍳</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: GREEN, letterSpacing: 0.5 }}>
            RECIPE
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "800", color: DARK }} numberOfLines={1}>
            {recipe.dish}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 9, fontWeight: "800", color: TEXT_MUTED, letterSpacing: 0.5, marginTop: 2 }}>
        INGREDIENTS
      </Text>
      {recipe.ingredients.map((ing, i) => {
        const p = ing.product;
        if (!p) return null;
        return (
          <RecipeIngredientRow
            key={`ing-${i}-${p.product_id}`}
            ingredient={ing}
            product={p}
            onPress={() => onProduct && onProduct(p)}
            cold={false}
          />
        );
      })}
      {recipe.smart_additions && recipe.smart_additions.length > 0 && (
        <View
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: BORDER,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ fontSize: 14, marginRight: 4 }}>✨</Text>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#B45309", letterSpacing: 0.5 }}>
              SMART ADDITIONS · OFTEN FORGOTTEN
            </Text>
          </View>
          {recipe.smart_additions.map((ing, i) => {
            const p = ing.product;
            if (!p) return null;
            return (
              <RecipeIngredientRow
                key={`add-${i}-${p.product_id}`}
                ingredient={ing}
                product={p}
                onPress={() => onProduct && onProduct(p)}
                cold={aislePopularity(p.aisle_num) < 0.55}
              />
            );
          })}
        </View>
      )}
      {recipe.pairings && recipe.pairings.length > 0 && (
        <View
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 10,
            backgroundColor: "#FEF7E6",
            borderWidth: 1,
            borderColor: "#FBD38D",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ fontSize: 14, marginRight: 4 }}>🥂</Text>
            <Text style={{ fontSize: 10, fontWeight: "800", color: "#B45309", letterSpacing: 0.5 }}>
              PAIRS PERFECTLY WITH
            </Text>
          </View>
          {recipe.pairings.map((pairing, i) => {
            const p = pairing.product;
            if (!p) return null;
            return (
              <View
                key={`pair-${i}-${p.product_id}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 6,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: "#FBD38D",
                }}
              >
                <TouchableOpacity
                  onPress={() => onProduct && onProduct(p)}
                  activeOpacity={0.7}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 18, marginRight: 8 }}>{emojiFor(p.category)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: DARK }} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#92400E" }} numberOfLines={1}>
                      {pairing.reason || `Pairs with ${recipe.dish}`} · {effectivePrice(p).toFixed(2)} ₼
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onAddToList && onAddToList(p)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: "#B45309",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 11, fontWeight: "800" }}>
                    + Cart
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          onPress={onAddAll}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: GREEN,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="list" size={14} color="white" />
          <Text style={{ color: "white", fontSize: 12, fontWeight: "800", marginLeft: 6 }}>
            Add all to list
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            const items = [
              ...recipe.ingredients,
              ...(recipe.smart_additions || []),
            ]
              .map((ing) => ing.product)
              .filter(Boolean);
            if (onShowRoute) onShowRoute(items);
            else onNav && onNav("map");
          }}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: BORDER,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="navigate" size={14} color={DARK} />
          <Text style={{ color: DARK, fontSize: 12, fontWeight: "800", marginLeft: 6 }}>
            Show route
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AssistantScreen = ({
  onNav,
  onProduct,
  onBack,
  onAddToList,
  onShowRoute,
  messages,
  setMessages,
  chatInput,
  setChatInput,
}) => {
  const [loading, setLoading] = useState(false);
  const input = chatInput;
  const setInput = setChatInput;
  const chips = [
    "I want to make pasta today",
    "5 AZN altı qəlyanaltılar",
    "Что приготовить сегодня?",
  ];
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
      // Recipe intent? Route to the recipe flow instead of general chat.
      if (isRecipeIntent(trimmed)) {
        const recipe = await getRecipe(trimmed);
        if (recipe && recipe.ingredients.some((i) => i.product)) {
          const matched = recipe.ingredients.filter((i) => i.product);
          const reply = `For ${recipe.dish}, here's where to find each ingredient in-store:`;
          setMessages((m) => [
            ...m,
            {
              from: "bot",
              text: reply,
              recipe: {
                dish: recipe.dish,
                ingredients: matched,
                smart_additions: recipe.smart_additions || [],
                pairings: recipe.pairings || [],
              },
            },
          ]);
          return;
        }
        // fall through to normal chat if recipe match was empty
      }

      const { text: reply, relevant, suggestions } = await askAI({
        message: trimmed,
        history,
      });
      // Prefer the AI service's parsed suggestions (regex-extracted
      // "<name> — <price> ₼" lines from the reply, then resolved against the
      // catalogue). Fall back to literal name-matching against the relevant
      // set if no suggestions were extracted.
      let mentioned = suggestions || [];
      if (mentioned.length === 0) {
        const replyLower = reply.toLowerCase();
        mentioned = relevant.filter((p) =>
          replyLower.includes(p.name.toLowerCase().split(" ").slice(0, 2).join(" "))
        );
      }
      const products = mentioned.slice(0, 3).map((p) => ({
        ...p, // keep full enriched product so we can navigate to its detail screen
        displayPrice: effectivePrice(p).toFixed(2),
        aisle: p.location || `${p.category} · ${p.subcategory}`,
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
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginRight: 8, padding: 4 }}>
              <Icon name="back" size={22} color={DARK} />
            </TouchableOpacity>
          )}
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
        decelerationRate="fast"
        scrollEventThrottle={16}
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
                  {m.recipe && (
                    <RecipeCard
                      recipe={m.recipe}
                      onProduct={onProduct}
                      onAddAll={() => {
                        const all = [
                          ...m.recipe.ingredients,
                          ...(m.recipe.smart_additions || []),
                        ];
                        for (const ing of all) {
                          if (ing.product) onAddToList && onAddToList(ing.product);
                        }
                      }}
                      onAddToList={onAddToList}
                      onNav={onNav}
                      onShowRoute={onShowRoute}
                    />
                  )}
                  {m.products?.map((p) => (
                    <View
                      key={p.product_id || p.name}
                      style={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: BORDER,
                        borderRadius: 14,
                        padding: 12,
                        marginTop: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => onProduct && onProduct(p)}
                        activeOpacity={0.7}
                        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
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
                          <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontWeight: "600", fontSize: 13, color: DARK, marginBottom: 2 }} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Price amount={p.displayPrice || p.price} size={14} />
                          <Text style={{ fontSize: 11, color: GRAY, marginTop: 2 }} numberOfLines={1}>📍 {p.aisle}</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <TouchableOpacity
                          onPress={() => onProduct && onProduct(p)}
                          style={{
                            flex: 1,
                            paddingVertical: 9,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: BORDER,
                            backgroundColor: "white",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: DARK }}>
                            Details
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => onAddToList && onAddToList(p)}
                          style={{
                            flex: 1,
                            paddingVertical: 9,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: GREEN,
                            backgroundColor: GREEN_LIGHT,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: "700", color: GREEN }}>
                            + List
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => (onShowRoute ? onShowRoute(p) : onNav("map"))}
                          style={{
                            flex: 1,
                            paddingVertical: 9,
                            borderRadius: 10,
                            backgroundColor: GREEN,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon name="navigate" size={12} color="white" />
                          <Text style={{ fontSize: 12, fontWeight: "700", color: "white", marginLeft: 4 }}>
                            Map
                          </Text>
                        </TouchableOpacity>
                      </View>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast">
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10, paddingBottom: 2 }}>
            {chips.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => send(c)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 18,
                  backgroundColor: GREEN_LIGHT,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: GREEN }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: SOFT_BG,
            borderRadius: 22,
            paddingLeft: 16,
            paddingRight: 4,
            paddingVertical: 4,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send(input)}
            placeholder="Soruşun · Ask · Спросите…"
            placeholderTextColor={TEXT_MUTED}
            autoCorrect={false}
            autoCapitalize="sentences"
            autoComplete="off"
            spellCheck={false}
            keyboardType="default"
            textContentType="none"
            multiline={false}
            blurOnSubmit={false}
            returnKeyType="send"
            style={{
              flex: 1,
              fontSize: 15,
              color: TEXT_TITLE,
              paddingVertical: 8,
              paddingRight: 8,
            }}
          />
          <TouchableOpacity
            onPress={() => send(input)}
            disabled={loading || !input.trim()}
            activeOpacity={0.7}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: input.trim() && !loading ? GREEN : "#C7C7CC",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="arrowUp" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ── SCREEN 8: Map / Indoor Navigation ────────────────────────────────────────
// Two mock supermarket floor plans. Department blocks include their aisle
// number so we can highlight the one matching the selected product's
// aisle_num. Routes are computed dynamically from entrance to the target.
// ── Supermarket floor plan ──────────────────────────────────────────────────
// 12 aisles laid out as 3 rows of 4 — each aisle is a walkable corridor
// flanked by two parallel SHELF UNITS. Horizontal "halls" run between the
// shelf rows; a central "highway" connects the entrance, halls, and cashiers.
//
//   ┌──────────────────────────────────────────────┐
//   │   ◯ ◯ ◯ ◯  ← cashiers       (TOP)            │
//   │ ▮ ║ ▮  ▮ ║ ▮  ▮ ║ ▮  ▮ ║ ▮  ← aisles 1-4    │
//   │ ─────── hall ───────                        │
//   │ ▮ ║ ▮  ▮ ║ ▮  ▮ ║ ▮  ▮ ║ ▮  ← aisles 5-8    │
//   │ ─────── hall ───────                        │
//   │ ▮ ║ ▮  ▮ ║ ▮  ▮ ║ ▮  ▮ ║ ▮  ← aisles 9-12   │
//   │              ENTRY ↑                         │
//   └──────────────────────────────────────────────┘
const PLAN_W = 380;
const PLAN_H = 560;
const MARGIN_X = 12;
const ROW_H = 110;
const HALL_H = 30;
const TOP_OFFSET = 70; // space for cashiers
const ENTRY_OFFSET = 32;

// 4 aisle columns
const COL_COUNT = 4;
const AVAILABLE_W = PLAN_W - MARGIN_X * 2;
const COL_W = AVAILABLE_W / COL_COUNT;
const SHELF_W = 18;
const WALK_W = COL_W - SHELF_W * 2 - 8; // walkway between the two shelves

const ROW_Y = [
  TOP_OFFSET,
  TOP_OFFSET + ROW_H + HALL_H,
  TOP_OFFSET + (ROW_H + HALL_H) * 2,
];

// Aisle definitions. Each aisle has two shelf units and a walkway between.
const AISLES = [
  { id: 1, row: 0, col: 0, label: "Bakery", color: "#FEF3C7" },
  { id: 2, row: 0, col: 1, label: "Produce", color: "#DCFCE7" },
  { id: 3, row: 0, col: 2, label: "Dairy", color: "#DBEAFE" },
  { id: 4, row: 0, col: 3, label: "Meat & Fish", color: "#FECACA" },
  { id: 5, row: 1, col: 0, label: "Beverages", color: "#E0E7FF" },
  { id: 6, row: 1, col: 1, label: "Snacks", color: "#FCE7F3" },
  { id: 7, row: 1, col: 2, label: "Pantry", color: "#FFF7ED" },
  { id: 8, row: 1, col: 3, label: "Frozen", color: "#CFFAFE" },
  { id: 9, row: 2, col: 0, label: "Cleaning", color: "#E5E7EB" },
  { id: 10, row: 2, col: 1, label: "Personal Care", color: "#FCE7F3" },
  { id: 11, row: 2, col: 2, label: "Baby", color: "#FEE2E2" },
  { id: 12, row: 2, col: 3, label: "Pet", color: "#FEF3C7" },
];

// Geometry helpers
function aisleGeom(aisle) {
  const a = AISLES.find((x) => x.id === aisle);
  if (!a) return null;
  const colLeft = MARGIN_X + a.col * COL_W + 4;
  const walkX = colLeft + SHELF_W + WALK_W / 2; // centre of the walkway
  const rowTop = ROW_Y[a.row];
  return {
    aisle,
    label: a.label,
    color: a.color,
    row: a.row,
    leftShelf: { x: colLeft, y: rowTop, w: SHELF_W, h: ROW_H },
    rightShelf: { x: colLeft + SHELF_W + WALK_W, y: rowTop, w: SHELF_W, h: ROW_H },
    walkway: { x: colLeft + SHELF_W, y: rowTop, w: WALK_W, h: ROW_H },
    centre: { x: walkX, y: rowTop + ROW_H / 2 },
    walkX,
    rowTop,
    rowBottom: rowTop + ROW_H,
  };
}

// Horizontal halls between rows (and entrance/cashier areas)
const HALL_Y = {
  top: TOP_OFFSET - HALL_H / 2 - 6, // below cashiers, above row 0
  mid1: ROW_Y[0] + ROW_H + HALL_H / 2, // between rows 0 and 1
  mid2: ROW_Y[1] + ROW_H + HALL_H / 2, // between rows 1 and 2
  bottom: ROW_Y[2] + ROW_H + HALL_H / 2 + 4, // between row 2 and entrance
};

// The corridor *below* a given aisle's row — used to plot route exits.
const ROW_EXIT_Y = [HALL_Y.mid1, HALL_Y.mid2, HALL_Y.bottom];

// Central "highway" x — vertical corridor down the middle for inter-row movement
const HIGHWAY_X = PLAN_W / 2;

// Plan metadata (we expose just the bits the screen actually uses)
const FLOOR_PLANS = [
  {
    name: "Gənclik Mall",
    entrance: { x: HIGHWAY_X, y: PLAN_H - ENTRY_OFFSET },
    cashiers: [
      { x: MARGIN_X + 16, y: 24, w: 56, h: 22 },
      { x: MARGIN_X + 92, y: 24, w: 56, h: 22 },
      { x: MARGIN_X + 168, y: 24, w: 56, h: 22 },
      { x: MARGIN_X + 244, y: 24, w: 56, h: 22 },
    ],
  },
  {
    name: "28 Mall",
    entrance: { x: PLAN_W - 60, y: PLAN_H - ENTRY_OFFSET },
    cashiers: [
      { x: MARGIN_X + 40, y: 24, w: 56, h: 22 },
      { x: MARGIN_X + 110, y: 24, w: 56, h: 22 },
      { x: MARGIN_X + 180, y: 24, w: 56, h: 22 },
    ],
  },
];

// Build a Manhattan (axis-aligned) path so the route always travels through
// halls and aisle walkways — never diagonally through a shelf. The strategy
// for every stop is: hall → highway → highway → target-hall → aisle-column
// → walk into aisle → walk back out. Always going via HIGHWAY_X keeps every
// segment perpendicular.
function buildRoute(stops, plan) {
  if (!stops.length) return [];
  const pts = [];
  const start = plan.entrance;
  pts.push(start);

  // Walk from the entrance along the bottom hall to the central highway.
  pts.push({ x: HIGHWAY_X, y: HALL_Y.bottom });

  let prevExitY = HALL_Y.bottom;
  for (let i = 0; i < stops.length; i++) {
    const g = stops[i].g;
    const exitY = ROW_EXIT_Y[g.row];

    // 1. Always get back to the highway via the previous hall (no-op if
    //    we're already there).
    pts.push({ x: HIGHWAY_X, y: prevExitY });
    // 2. Travel along the highway to the target row's hall.
    if (prevExitY !== exitY) {
      pts.push({ x: HIGHWAY_X, y: exitY });
    }
    // 3. Walk along that hall to the target aisle's walkway entrance.
    pts.push({ x: g.walkX, y: exitY });
    // 4. Walk into the aisle to the centre (the stop pin).
    pts.push({ x: g.walkX, y: g.centre.y });
    // 5. Walk back out of the aisle to the hall.
    pts.push({ x: g.walkX, y: exitY });

    prevExitY = exitY;
  }

  // After the final stop, walk to the cashier wall.
  pts.push({ x: HIGHWAY_X, y: prevExitY });
  pts.push({ x: HIGHWAY_X, y: HALL_Y.top });
  const cashier = plan.cashiers[Math.floor(plan.cashiers.length / 2)];
  pts.push({ x: cashier.x + cashier.w / 2, y: HALL_Y.top });
  pts.push({ x: cashier.x + cashier.w / 2, y: cashier.y + cashier.h + 4 });

  return pts;
}

const MapScreen = ({ onBack, product, products, shoppingList = [], onProduct, onNav }) => {
  const [demoItems, setDemoItems] = useState(null);

  const loadDemo = () => {
    const all = getProducts();
    const wantedAisles = [2, 4, 6, 9, 11];
    const picks = wantedAisles
      .map((aisle) => all.find((p) => p.aisle_num === aisle && p.stock_qty > 0))
      .filter(Boolean);
    setDemoItems(picks);
  };

  // Priority: explicit demo items > products array (from "Start Route") >
  // single product > user's shopping list.
  const items = demoItems && demoItems.length > 0
    ? demoItems
    : Array.isArray(products) && products.length > 0
    ? products
    : product
    ? [product]
    : shoppingList;
  const usingShoppingList =
    !demoItems && !products?.length && !product && shoppingList.length > 0;
  const usingDemo = !!demoItems;

  // Pick a mock floor plan deterministically from the first item.
  const seedId = items[0]?.product_id || product?.product_id;
  const planIdx = seedId
    ? Math.abs(parseInt(seedId, 10) || 0) % FLOOR_PLANS.length
    : 0;
  const plan = FLOOR_PLANS[planIdx];

  // Stops sorted by aisle for an efficient walking route.
  const stops = items
    .map((p) => {
      const a = parseInt(p.aisle_num, 10);
      const g = aisleGeom(a);
      if (!g) return null;
      return { product: p, aisle: a, g };
    })
    .filter(Boolean)
    .sort((a, b) => a.aisle - b.aisle);

  const routePts = buildRoute(stops, plan);
  const routePoints = routePts.map((pt) => `${pt.x},${pt.y}`).join(" ");

  // Walking distance / time estimate.
  let pixelDist = 0;
  for (let i = 1; i < routePts.length; i++) {
    pixelDist +=
      Math.abs(routePts[i].x - routePts[i - 1].x) +
      Math.abs(routePts[i].y - routePts[i - 1].y);
  }
  const meters = Math.max(1, Math.round(pixelDist * 0.15));
  const mins = Math.max(1, Math.round(meters / 50));

  const isMulti = stops.length > 1;
  const firstItem = items[0];
  const productName = isMulti
    ? `${stops.length} items on your list`
    : firstItem?.name || "Select a product";
  const productEmoji = isMulti
    ? "🛒"
    : firstItem?.category
    ? emojiFor(firstItem.category)
    : "🛒";
  const productPrice = isMulti
    ? `${stops.length} stops`
    : firstItem?.price_azn != null
    ? `${parseFloat(firstItem.price_azn).toFixed(2)} ₼`
    : "—";
  const productLocation = isMulti
    ? stops.map((s) => `A${s.aisle}`).join(" → ")
    : stops[0]
    ? `Aisle ${stops[0].aisle} · ${stops[0].g.label}`
    : firstItem?.location || "Unknown location";

  const target = stops[0]
    ? { aisle: stops[0].aisle, label: stops[0].g.label }
    : null;

  const start = plan.entrance;
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
            <Text style={{ fontSize: 22 }}>{productEmoji}</Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: "700", fontSize: 14, color: DARK }} numberOfLines={1}>
              {productName}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
              <Badge text={productPrice} />
              <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                <Icon name="shelf" size={12} color={GRAY} />
                <Text style={{ fontSize: 12, color: GRAY, marginLeft: 4 }} numberOfLines={1}>
                  {productLocation}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 11, color: GRAY, fontWeight: "600" }}>
            🏬 {plan.name}
          </Text>
          <View
            style={{
              backgroundColor: GREEN,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: "row",
            }}
          >
            <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>
              {mins} min
            </Text>
            <Text
              style={{ color: "white", fontSize: 13, fontWeight: "700", marginHorizontal: 12 }}
            >
              •
            </Text>
            <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>{meters}m</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: "#EFE9DA" }}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}>
          {/* Outer store walls */}
          <Rect
            x="4"
            y="4"
            width={PLAN_W - 8}
            height={PLAN_H - 8}
            rx="10"
            fill="#FDFBF5"
            stroke="#8B7E5F"
            strokeWidth="3"
          />

          {/* Subtle tiled-floor pattern for the halls */}
          {Array.from({ length: 18 }, (_, i) => (
            <Line
              key={`floorH-${i}`}
              x1="6"
              x2={PLAN_W - 6}
              y1={30 + i * 30}
              y2={30 + i * 30}
              stroke="#E5DEC8"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <Line
              key={`floorV-${i}`}
              x1={20 + i * 40}
              x2={20 + i * 40}
              y1="6"
              y2={PLAN_H - 6}
              stroke="#E5DEC8"
              strokeWidth="0.5"
            />
          ))}

          {/* Cashier counter back-wall (a single bar along the top) */}
          <Rect
            x={MARGIN_X}
            y={20}
            width={PLAN_W - MARGIN_X * 2}
            height={32}
            rx="4"
            fill="#1E40AF"
            opacity="0.07"
          />
          <SvgText
            x={PLAN_W - MARGIN_X - 6}
            y={36}
            textAnchor="end"
            fontSize="8"
            fontWeight="700"
            fill="#1E40AF"
            opacity="0.7"
          >
            CHECKOUTS
          </SvgText>

          {/* Individual cashiers */}
          {plan.cashiers.map((c, i) => (
            <G key={`c-${i}`}>
              <Rect
                x={c.x}
                y={c.y}
                width={c.w}
                height={c.h}
                rx="3"
                fill="#1E40AF"
                opacity="0.18"
                stroke="#1E40AF"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
              <SvgText
                x={c.x + c.w / 2}
                y={c.y + c.h / 2 + 3}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#1E3A8A"
              >
                ◯ {i + 1}
              </SvgText>
            </G>
          ))}

          {/* Horizontal halls (lighter background to suggest walkable space) */}
          {[HALL_Y.top, HALL_Y.mid1, HALL_Y.mid2, HALL_Y.bottom].map((y, i) => (
            <Rect
              key={`hall-${i}`}
              x={MARGIN_X}
              y={y - HALL_H / 2}
              width={PLAN_W - MARGIN_X * 2}
              height={HALL_H}
              fill="#F7F1E0"
              stroke="#D7CDAD"
              strokeWidth="0.5"
            />
          ))}

          {/* Aisles: two parallel shelf units with a walkway between */}
          {AISLES.map((a) => {
            const g = aisleGeom(a.id);
            const active = stops.some((s) => s.aisle === a.id);
            const labelStroke = active ? GREEN : "#7A6F52";

            const shelf = (s, key) => (
              <G key={key}>
                <Rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  rx="2"
                  fill={active ? "#BDF2D2" : a.color}
                  stroke={active ? GREEN : "#8B7E5F"}
                  strokeWidth={active ? 1.5 : 1}
                />
                {/* Horizontal lines = individual shelf planks */}
                {[0.18, 0.36, 0.54, 0.72, 0.9].map((f, i) => (
                  <Line
                    key={i}
                    x1={s.x + 1.5}
                    x2={s.x + s.w - 1.5}
                    y1={s.y + s.h * f}
                    y2={s.y + s.h * f}
                    stroke={active ? GREEN : "#A89878"}
                    strokeOpacity="0.55"
                    strokeWidth="0.7"
                  />
                ))}
              </G>
            );

            return (
              <G key={a.id}>
                {/* Walkway floor (light strip between the two shelves) */}
                <Rect
                  x={g.walkway.x}
                  y={g.walkway.y}
                  width={g.walkway.w}
                  height={g.walkway.h}
                  fill={active ? "#E8F8EF" : "#FAF6E9"}
                />
                {shelf(g.leftShelf, "L")}
                {shelf(g.rightShelf, "R")}
                {/* Department label above */}
                <SvgText
                  x={g.centre.x}
                  y={g.rowTop - 4}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="800"
                  fill={labelStroke}
                >
                  {a.label.toUpperCase()}
                </SvgText>
                {/* Aisle number in the walkway */}
                <SvgText
                  x={g.centre.x}
                  y={g.rowBottom - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill={active ? GREEN : "#7A6F52"}
                  opacity={active ? 1 : 0.6}
                >
                  {a.id}
                </SvgText>
              </G>
            );
          })}

          {/* Route — drawn AFTER shelves, so it sits on top */}
          {stops.length > 0 && (
            <Polyline
              points={routePoints}
              fill="none"
              stroke={GREEN}
              strokeWidth="4.5"
              strokeDasharray="9,5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
          )}

          {/* You-are-here marker at entrance */}
          <G>
            <Circle cx={start.x} cy={start.y} r="12" fill="white" stroke={GREEN} strokeWidth="2.5" />
            <Circle cx={start.x} cy={start.y} r="6" fill={GREEN} />
            <Rect
              x={start.x - 24}
              y={start.y + 14}
              width="48"
              height="14"
              rx="3"
              fill={GREEN}
            />
            <SvgText
              x={start.x}
              y={start.y + 24}
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill="white"
            >
              ENTRANCE
            </SvgText>
          </G>

          {/* Stop pins (numbered) */}
          {stops.map((s, i) => (
            <G key={`stop-${s.product.product_id}`}>
              <Circle cx={s.g.centre.x} cy={s.g.centre.y} r="15" fill={RED} opacity="0.2" />
              <Circle
                cx={s.g.centre.x}
                cy={s.g.centre.y}
                r="11"
                fill={RED}
                stroke="white"
                strokeWidth="2"
              />
              <SvgText
                x={s.g.centre.x}
                y={s.g.centre.y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="white"
              >
                {isMulti ? i + 1 : "★"}
              </SvgText>
            </G>
          ))}
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
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: GRAY, letterSpacing: 1 }}>
              {usingDemo
                ? "DEMO ROUTE"
                : usingShoppingList
                ? "FROM YOUR LIST"
                : "CURRENT INSTRUCTION"}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: DARK, marginVertical: 2 }} numberOfLines={1}>
              {isMulti
                ? `Stop 1 of ${stops.length}: Aisle ${stops[0].aisle}`
                : target
                ? `Head to Aisle ${target.aisle}`
                : "Pick an item to navigate"}
            </Text>
            <Text style={{ fontSize: 13, color: GRAY }} numberOfLines={1}>
              {isMulti
                ? `${stops[0].g.label} · ${stops[0].product.name}`
                : target
                ? `${target.label} section · ${meters}m`
                : "Add items to your list or search a product"}
            </Text>
          </View>
        </View>
        {stops.length === 0 && (
          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={loadDemo}
              style={{
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: GREEN,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "800", fontSize: 13 }}>
                ✨ Try a demo route through 5 aisles
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => onNav && onNav("list")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: BORDER,
                  backgroundColor: "white",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="list" size={13} color={DARK} />
                <Text style={{ color: DARK, fontWeight: "700", fontSize: 12, marginLeft: 6 }}>
                  My List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onNav && onNav("onsite-search")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: BORDER,
                  backgroundColor: "white",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="search" size={13} color={DARK} />
                <Text style={{ color: DARK, fontWeight: "700", fontSize: 12, marginLeft: 6 }}>
                  Search
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {isMulti && (
          <View
            style={{
              backgroundColor: LIGHT_GRAY,
              borderRadius: 10,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 11, color: GRAY, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6 }}>
              ROUTE ({stops.length} STOPS · {meters}m · ~{mins} MIN)
            </Text>
            {stops.map((s, i) => (
              <View
                key={s.product.product_id}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: i === stops.length - 1 ? 0 : 6 }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: GREEN,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 10, fontWeight: "800" }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 12, color: DARK, flex: 1 }} numberOfLines={1}>
                  <Text style={{ fontWeight: "700" }}>Aisle {s.aisle}</Text> · {s.product.name}
                </Text>
              </View>
            ))}
          </View>
        )}
        {!isMulti && target && (
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
            <Text style={{ fontSize: 13, color: GRAY, marginLeft: 8, flex: 1 }}>
              Then look for{" "}
              <Text style={{ fontWeight: "700", color: DARK }}>
                shelf {firstItem?.shelf_letter || "B"}
              </Text>{" "}
              · {target.label}
            </Text>
          </View>
        )}
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
            onPress={onBack}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: "#FEE2E2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: RED }}>End Route</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ── Reusable: discounted price chip ─────────────────────────────────────────
const PriceWithDiscount = ({ product, size = 14, user }) => {
  const d = getDiscount(product);
  const loyalty = loyaltyDiscount(user);
  const finalForBuyer = premiumPrice(product, user);
  const totalPct = totalDiscountPct(product, user);

  // No discount of any kind — show the plain price.
  if (d.pct <= 0 && loyalty <= 0) {
    return <Price amount={product.price_azn.toFixed(2)} size={size} />;
  }

  const showStrike = d.pct > 0 || loyalty > 0;
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
      <Price amount={finalForBuyer.toFixed(2)} size={size} />
      {showStrike && (
        <Text
          style={{
            fontSize: size - 4,
            color: GRAY,
            textDecorationLine: "line-through",
            marginLeft: 6,
          }}
        >
          {product.price_azn.toFixed(2)} ₼
        </Text>
      )}
      {d.pct > 0 && (
        <View
          style={{
            marginLeft: 6,
            backgroundColor: "#FEE2E2",
            paddingHorizontal: 5,
            paddingVertical: 1,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: RED, fontSize: 10, fontWeight: "800" }}>-{d.pct}%</Text>
        </View>
      )}
      {loyalty > 0 && (
        <View
          style={{
            marginLeft: 6,
            backgroundColor: "#FEF3C7",
            paddingHorizontal: 5,
            paddingVertical: 1,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#B45309", fontSize: 10, fontWeight: "800" }}>
            👑 −{loyalty}%
          </Text>
        </View>
      )}
    </View>
  );
};

// ── SCREEN 12: Premium perks (early-access deals + loyalty) ────────────────
// ── SCREEN 13: Weekly Meal Plan (premium) ──────────────────────────────────
const GOALS = [
  { id: "weightloss", label: "Weight loss", emoji: "🪶" },
  { id: "maintain", label: "Maintain", emoji: "⚖️" },
  { id: "musclegain", label: "Muscle gain", emoji: "💪" },
  { id: "healthy", label: "Healthy eating", emoji: "🥗" },
];
const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary" },
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "active", label: "Active" },
];
const DIET_PREFS = [
  { id: "halal", label: "Halal" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "glutenfree", label: "Gluten-free" },
  { id: "lactosefree", label: "Lactose-free" },
  { id: "quick", label: "Quick (≤30 min)" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "azerbaijani", label: "Azerbaijani" },
  { id: "comfort", label: "Comfort" },
];

const MealPlanScreen = ({ user, onBack, onProduct, onAddToList, onShowRoute }) => {
  const [goal, setGoal] = useState("maintain");
  const [weight, setWeight] = useState("72");
  const [height, setHeight] = useState("172");
  const [age, setAge] = useState("28");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("moderate");
  const [prefs, setPrefs] = useState(new Set(["halal"]));
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const togglePref = (id) =>
    setPrefs((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMealPlan({
        preferences: [...prefs],
        goal,
        bodyMeasures: {
          weight: parseFloat(weight) || 70,
          height: parseFloat(height) || 170,
          age: parseInt(age, 10) || 30,
          gender,
          activity,
        },
        language: "en",
      });
      if (!result) throw new Error("Could not generate plan — try again.");
      setPlan(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addAll = () => {
    if (!plan) return;
    for (const d of plan.days) {
      for (const ing of d.ingredients) {
        if (ing.product) onAddToList && onAddToList(ing.product);
      }
    }
  };

  const showWeekRoute = () => {
    if (!plan) return;
    const items = plan.days
      .flatMap((d) => d.ingredients.map((i) => i.product))
      .filter(Boolean);
    if (onShowRoute) onShowRoute(items);
  };

  const totalIngredients = plan
    ? plan.days.reduce((s, d) => s + d.ingredients.filter((i) => i.product).length, 0)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: SUBTLE_BORDER,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Icon name="back" size={22} color={DARK} />
        </TouchableOpacity>
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: TEXT_TITLE }}>
            🍳 Weekly Meal Plan
          </Text>
          <Text style={{ fontSize: 11, color: TEXT_MUTED }}>
            7 dinners, tuned to your goal
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        decelerationRate="fast"
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* Goal */}
        <Text style={mealStyles.sectionLabel}>YOUR GOAL</Text>
        <View style={{ paddingHorizontal: 12, marginBottom: 14 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {GOALS.map((g) => {
              const active = goal === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGoal(g.id)}
                  activeOpacity={0.7}
                  style={{
                    flexGrow: 1,
                    minWidth: "47%",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: R.md,
                    backgroundColor: active ? GREEN : "white",
                    borderWidth: 1,
                    borderColor: active ? GREEN : SUBTLE_BORDER,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 8 }}>{g.emoji}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: active ? "white" : TEXT_TITLE,
                    }}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Body measurements */}
        <Text style={mealStyles.sectionLabel}>YOU</Text>
        <View
          style={{
            marginHorizontal: 12,
            backgroundColor: "white",
            borderRadius: R.md,
            padding: 12,
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <BodyInput label="Weight" suffix="kg" value={weight} onChange={setWeight} />
            <BodyInput label="Height" suffix="cm" value={height} onChange={setHeight} />
            <BodyInput label="Age" suffix="yrs" value={age} onChange={setAge} />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <SegmentedToggle
              label="Gender"
              value={gender}
              onChange={setGender}
              options={[
                { id: "male", label: "Male" },
                { id: "female", label: "Female" },
              ]}
            />
          </View>
          <Text style={{ fontSize: 10, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 0.5, marginTop: 10, marginBottom: 6 }}>
            ACTIVITY
          </Text>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            {ACTIVITY_LEVELS.map((a) => {
              const active = activity === a.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setActivity(a.id)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 16,
                    backgroundColor: active ? GREEN : SOFT_BG,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : TEXT_TITLE }}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dietary preferences */}
        <Text style={mealStyles.sectionLabel}>PREFERENCES</Text>
        <View style={{ paddingHorizontal: 12, marginBottom: 14 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {DIET_PREFS.map((d) => {
              const active = prefs.has(d.id);
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => togglePref(d.id)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 16,
                    backgroundColor: active ? GREEN_LIGHT : "white",
                    borderWidth: 1,
                    borderColor: active ? GREEN : SUBTLE_BORDER,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? GREEN : TEXT_MUTED }}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Generate button */}
        <View style={{ paddingHorizontal: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={generate}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: loading ? "#94A3B8" : GREEN,
              paddingVertical: 14,
              borderRadius: R.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={{ color: "white", fontWeight: "800", fontSize: 14, marginLeft: 8 }}>
                  Planning your week…
                </Text>
              </>
            ) : (
              <Text style={{ color: "white", fontWeight: "800", fontSize: 14 }}>
                {plan ? "Re-generate plan" : "Generate my week"}
              </Text>
            )}
          </TouchableOpacity>
          {error && (
            <Text style={{ color: RED, fontSize: 12, marginTop: 8, paddingHorizontal: 4 }}>
              ⚠️ {error}
            </Text>
          )}
        </View>

        {/* Result */}
        {plan && (
          <View style={{ paddingHorizontal: 12 }}>
            <View
              style={{
                backgroundColor: "#F5F3FF",
                borderRadius: R.md,
                padding: 12,
                marginBottom: 12,
                borderLeftWidth: 3,
                borderLeftColor: "#8B5CF6",
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#7C3AED", letterSpacing: 0.5, marginBottom: 4 }}>
                YOUR WEEK · {plan.calorieTarget ? `~${plan.calorieTarget} KCAL/DAY` : "TUNED PLAN"}
              </Text>
              <Text style={{ fontSize: 13, color: TEXT_TITLE, lineHeight: 19 }}>{plan.intro}</Text>
            </View>

            {plan.days.map((d, i) => (
              <DayCard
                key={`${i}-${d.day}`}
                day={d}
                onProduct={onProduct}
                onAddToList={onAddToList}
              />
            ))}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <TouchableOpacity
                onPress={addAll}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: R.md,
                  backgroundColor: GREEN,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="list" size={14} color="white" />
                <Text style={{ color: "white", fontSize: 13, fontWeight: "800", marginLeft: 6 }}>
                  Add all · {totalIngredients} items
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={showWeekRoute}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: R.md,
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: SUBTLE_BORDER,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="navigate" size={14} color={DARK} />
                <Text style={{ color: TEXT_TITLE, fontSize: 13, fontWeight: "800", marginLeft: 6 }}>
                  Route the store
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const mealStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
});

const BodyInput = ({ label, suffix, value, onChange }) => (
  <View style={{ flex: 1 }}>
    <Text style={{ fontSize: 10, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 0.5, marginBottom: 4 }}>
      {label.toUpperCase()}
    </Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SOFT_BG,
        borderRadius: R.sm,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        style={{ flex: 1, fontSize: 15, fontWeight: "700", color: TEXT_TITLE, paddingVertical: 0 }}
      />
      <Text style={{ fontSize: 11, color: TEXT_MUTED, marginLeft: 4 }}>{suffix}</Text>
    </View>
  </View>
);

const SegmentedToggle = ({ label, value, onChange, options }) => (
  <View style={{ flex: 1 }}>
    <Text style={{ fontSize: 10, fontWeight: "700", color: TEXT_MUTED, letterSpacing: 0.5, marginBottom: 4 }}>
      {label.toUpperCase()}
    </Text>
    <View
      style={{
        flexDirection: "row",
        backgroundColor: SOFT_BG,
        borderRadius: R.sm,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 7,
              alignItems: "center",
              backgroundColor: active ? "white" : "transparent",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: active ? "700" : "500", color: active ? TEXT_TITLE : TEXT_MUTED }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const DayCard = ({ day, onProduct, onAddToList }) => {
  const [expanded, setExpanded] = useState(false);
  const validIngredients = day.ingredients.filter((i) => i.product);

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: R.md,
        marginBottom: 8,
        overflow: "hidden",
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          },
          android: { elevation: 1 },
        }),
      }}
    >
      <TouchableOpacity
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.85}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F5F3FF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#7C3AED", fontSize: 11, fontWeight: "800" }}>
            {(day.day || "").slice(0, 3).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: TEXT_TITLE }} numberOfLines={2}>
            {day.dish}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2, flexWrap: "wrap" }}>
            {day.calories ? (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: 4,
                  marginRight: 5,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "800", color: "#B45309" }}>
                  {day.calories} kcal
                </Text>
              </View>
            ) : null}
            {day.protein_g ? (
              <View
                style={{
                  backgroundColor: "#DBEAFE",
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderRadius: 4,
                  marginRight: 5,
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "800", color: "#1E40AF" }}>
                  {day.protein_g}g protein
                </Text>
              </View>
            ) : null}
            <Text style={{ fontSize: 11, color: TEXT_MUTED }}>
              {validIngredients.length} ingredients
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 16, color: "#C7C7CC", marginLeft: 4 }}>
          {expanded ? "›" : "›"}
        </Text>
      </TouchableOpacity>

      {expanded && validIngredients.length > 0 && (
        <View
          style={{
            paddingHorizontal: 12,
            paddingBottom: 12,
            borderTopWidth: 0.5,
            borderTopColor: SUBTLE_BORDER,
          }}
        >
          {validIngredients.map((ing, i) => (
            <RecipeIngredientRow
              key={`${i}-${ing.product.product_id}`}
              ingredient={ing}
              product={ing.product}
              onPress={() => onProduct && onProduct(ing.product)}
              cold={false}
            />
          ))}
          <TouchableOpacity
            onPress={() => {
              for (const ing of validIngredients) {
                if (ing.product) onAddToList && onAddToList(ing.product);
              }
            }}
            style={{
              marginTop: 8,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: GREEN_LIGHT,
              alignItems: "center",
            }}
          >
            <Text style={{ color: GREEN, fontWeight: "800", fontSize: 12 }}>
              + Add {validIngredients.length} items to list
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const PremiumScreen = ({ user, onBack, onProduct, onAddToList, onNav }) => {
  const upcoming = useMemo(() => getUpcomingDeals(40), []);
  const totalPreviewSaving = upcoming.reduce(
    (s, p) => s + p.price_azn * (p.previewDiscount / 100),
    0
  );

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: SUBTLE_BORDER,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </TouchableOpacity>
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: TEXT_TITLE }}>
              👑 Premium
            </Text>
            <Text style={{ fontSize: 12, color: TEXT_MUTED }}>
              {user?.tier || "Member"} tier · {user?.name}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {/* Perks overview */}
        <View style={{ paddingHorizontal: 12, paddingTop: 14 }}>
          <LinearGradient
            colors={["#0F172A", "#1E293B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: R.lg, padding: 16, marginBottom: 14 }}
          >
            <Text
              style={{
                color: "#FCD34D",
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              YOUR PERKS
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontSize: 26, fontWeight: "800" }}>
                  24h
                </Text>
                <Text style={{ color: "#CBD5E1", fontSize: 11, marginTop: 2 }}>
                  Early access to deals
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontSize: 26, fontWeight: "800" }}>
                  7
                </Text>
                <Text style={{ color: "#CBD5E1", fontSize: 11, marginTop: 2 }}>
                  Dinners planned weekly
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "rgba(252,211,77,0.15)",
                borderLeftWidth: 3,
                borderLeftColor: "#FCD34D",
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "white", fontSize: 12, lineHeight: 17 }}>
                Estimated savings on the {upcoming.length} previews below:{" "}
                <Text style={{ fontWeight: "800" }}>
                  ~{totalPreviewSaving.toFixed(0)} ₼
                </Text>
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Sunday Meal Plan CTA */}
        <View style={{ paddingHorizontal: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => onNav && onNav("mealplan")}
            activeOpacity={0.9}
            style={{ borderRadius: R.lg, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#7C3AED", "#9333EA", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 6 }}>🍳</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "800",
                    letterSpacing: 1,
                    color: "#F3E8FF",
                  }}
                >
                  NEW THIS SUNDAY
                </Text>
              </View>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "800", marginBottom: 4 }}>
                Your week of dinners
              </Text>
              <Text style={{ color: "#E9D5FF", fontSize: 12, lineHeight: 17, marginBottom: 10 }}>
                7 dinners, tuned to your goal (weight loss, muscle gain, healthy
                eating) and dietary preferences. Each ingredient is mapped to
                its aisle — one tap and the whole week is on your shopping
                list.
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: "800" }}>
                  Build my week →
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Upcoming deals list */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14 }}>⏰</Text>
          <Text
            style={{
              fontWeight: "800",
              fontSize: 15,
              color: TEXT_TITLE,
              marginLeft: 6,
              flex: 1,
            }}
          >
            Tomorrow's markdowns (preview)
          </Text>
          <Text style={{ fontSize: 11, color: TEXT_MUTED }}>{upcoming.length}</Text>
        </View>

        <View style={{ paddingHorizontal: 12 }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: R.md,
              overflow: "hidden",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                },
                android: { elevation: 1 },
              }),
            }}
          >
            {upcoming.map((p, i) => (
              <UpcomingDealRow
                key={p.product_id}
                product={p}
                onPress={() => onProduct(p)}
                onAddToList={() => onAddToList && onAddToList(p)}
                isLast={i === upcoming.length - 1}
                user={user}
              />
            ))}
            {upcoming.length === 0 && (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: TEXT_MUTED, fontSize: 13 }}>
                  No upcoming markdowns right now. 🎯
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const UpcomingDealRow = ({ product, onPress, onAddToList, isLast }) => {
  const previewFinal =
    Math.round(product.price_azn * (1 - product.previewDiscount / 100) * 100) /
    100;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: SUBTLE_BORDER,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#FEF3C7",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>{emojiFor(product.category)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: TEXT_TITLE }} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 1 }} numberOfLines={1}>
          Activates in {product.activeInDays}d · {product.location}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: GREEN }}>
            {previewFinal.toFixed(2)} ₼
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: TEXT_MUTED,
              textDecorationLine: "line-through",
              marginLeft: 6,
            }}
          >
            {product.price_azn.toFixed(2)} ₼
          </Text>
          <View
            style={{
              backgroundColor: "#FEF3C7",
              paddingHorizontal: 5,
              paddingVertical: 1,
              borderRadius: 4,
              marginLeft: 6,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "800", color: "#B45309" }}>
              👑 −{product.previewDiscount}%
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation && e.stopPropagation();
          onAddToList();
        }}
        style={{
          marginLeft: 8,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: GREEN,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="plus" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ── SCREEN 10: Rescue Today (marked-down items) ─────────────────────────────
const RescueScreen = ({ onProduct, onBack, onAddToList, onShowRoute, user }) => {
  const items = useMemo(() => getRescueItems(60), []);
  const totalSaving = items.reduce(
    (s, p) => s + (p.price_azn - effectivePrice(p)),
    0
  );

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </TouchableOpacity>
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: DARK }}>
              💚 Rescue Today
            </Text>
            <Text style={{ fontSize: 12, color: GRAY }}>
              Marked-down items — fresh stock that needs to move
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: GREEN_LIGHT,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
            gap: 14,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: GREEN, letterSpacing: 0.5 }}>
              ITEMS
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: GREEN }}>
              {items.length}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: GREEN, letterSpacing: 0.5 }}>
              TOTAL SAVING
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: GREEN }}>
              {totalSaving.toFixed(2)} ₼
            </Text>
          </View>
          <View style={{ flex: 1.5 }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: GREEN, letterSpacing: 0.5 }}>
              WHY IT MATTERS
            </Text>
            <Text style={{ fontSize: 11, color: GREEN }}>
              Buying these reduces food waste
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {items.map((p) => (
          <TouchableOpacity
            key={p.product_id}
            onPress={() => onProduct(p)}
            activeOpacity={0.85}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              padding: 12,
              marginBottom: 8,
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
              <Text style={{ fontSize: 24 }}>{emojiFor(p.category)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: DARK }}
                numberOfLines={1}
              >
                {p.name}
              </Text>
              <Text style={{ fontSize: 11, color: GRAY, marginTop: 1 }} numberOfLines={1}>
                {p.location}
              </Text>
              <View style={{ marginTop: 4 }}>
                <PriceWithDiscount product={p} size={14} user={user} />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#FEF3C7",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  marginTop: 4,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#B45309" }}>
                  {p.discount.reason}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation && e.stopPropagation();
                onAddToList && onAddToList(p);
              }}
              style={{
                marginLeft: 8,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: GREEN,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="plus" size={18} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {items.length === 0 && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text style={{ color: GRAY }}>Nothing marked down right now. 👍</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ── SCREEN 11: Shopping List ─────────────────────────────────────────────────
const ListScreen = ({ list, onProduct, onRemove, onClear, onBack, onStartRoute, onAddToList, user }) => {
  // Demo helper: pulls 4 distinct products from across different aisles so a
  // user can immediately see a multi-stop route on the map.
  const seedDemoItems = () => {
    if (!onAddToList) return;
    const all = getProducts();
    const wantedAisles = [2, 4, 6, 9]; // produce, meat, snacks, cleaning
    for (const aisle of wantedAisles) {
      const pick = all.find((p) => p.aisle_num === aisle && p.stock_qty > 0);
      if (pick) onAddToList(pick);
    }
  };
  // Sort items by aisle so the UI matches the actual walking order.
  const sorted = useMemo(
    () => [...list].sort((a, b) => (a.aisle_num || 99) - (b.aisle_num || 99)),
    [list]
  );
  const subtotal = list.reduce((s, p) => s + premiumPrice(p, user), 0);
  const original = list.reduce((s, p) => s + p.price_azn, 0);
  const saving = original - subtotal;

  // "Often bought with" — products that complement what's already in the
  // list. Recomputes whenever the list contents change.
  const suggestions = useMemo(
    () => getListSuggestions(list, 4),
    [list]
  );

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
            <Icon name="back" size={22} color={DARK} />
          </TouchableOpacity>
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: DARK }}>My List</Text>
            <Text style={{ fontSize: 12, color: GRAY }}>
              {list.length} item{list.length === 1 ? "" : "s"} · {subtotal.toFixed(2)} ₼
            </Text>
          </View>
          {list.length > 0 && (
            <TouchableOpacity
              onPress={onClear}
              style={{
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: GRAY }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {sorted.map((p) => (
          <TouchableOpacity
            key={p.product_id}
            onPress={() => onProduct(p)}
            activeOpacity={0.85}
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: BORDER,
              padding: 10,
              marginBottom: 6,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: GREEN_LIGHT,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Text style={{ color: GREEN, fontWeight: "800", fontSize: 11 }}>
                {p.aisle_num}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: DARK }} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={{ fontSize: 11, color: GRAY }} numberOfLines={1}>
                {p.location}
              </Text>
              <View style={{ marginTop: 2 }}>
                <PriceWithDiscount product={p} size={13} user={user} />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => onRemove(p.product_id)}
              style={{ padding: 6 }}
            >
              <Icon name="close" size={16} color={GRAY} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        {list.length > 0 && suggestions.length > 0 && (
          <View
            style={{
              marginTop: 14,
              backgroundColor: "white",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, marginRight: 4 }}>✨</Text>
              <Text style={{ fontSize: 10, fontWeight: "800", color: GREEN, letterSpacing: 0.5 }}>
                OFTEN BOUGHT WITH YOUR LIST
              </Text>
            </View>
            {suggestions.map((p, i) => (
              <View
                key={p.product_id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: BORDER,
                }}
              >
                <TouchableOpacity
                  onPress={() => onProduct(p)}
                  activeOpacity={0.7}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: GREEN_LIGHT,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: GREEN, fontWeight: "800", fontSize: 11 }}>
                      {p.aisle_num}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: DARK }} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: GRAY }} numberOfLines={1}>
                      {p.reason} · {effectivePrice(p).toFixed(2)} ₼
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onAddToList && onAddToList(p)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: GREEN,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 11, fontWeight: "800" }}>
                    + Add
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {list.length === 0 && (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🛒</Text>
            <Text style={{ color: DARK, fontWeight: "700", fontSize: 14, marginBottom: 4 }}>
              Your list is empty
            </Text>
            <Text style={{ color: GRAY, fontSize: 12, textAlign: "center", marginBottom: 16 }}>
              Add items from search, the AI assistant, or Rescue Today and we'll
              route you through the store.
            </Text>
            <TouchableOpacity
              onPress={seedDemoItems}
              activeOpacity={0.85}
              style={{
                backgroundColor: GREEN_LIGHT,
                borderWidth: 1,
                borderColor: GREEN,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: GREEN, fontWeight: "800", fontSize: 13 }}>
                ✨ Try with 4 demo items
              </Text>
            </TouchableOpacity>
            <Text style={{ color: GRAY, fontSize: 10, marginTop: 6 }}>
              Drops products from aisles 2, 4, 6, 9 so you can see the route immediately.
            </Text>
          </View>
        )}
      </ScrollView>

      {list.length > 0 && (
        <View
          style={{
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: BORDER,
            padding: 12,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: GRAY }}>Subtotal</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: DARK }}>
              {subtotal.toFixed(2)} ₼
              {saving > 0.005 && (
                <Text style={{ fontSize: 11, color: GREEN, fontWeight: "700" }}>
                  {"  "}(saved {saving.toFixed(2)} ₼)
                </Text>
              )}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onStartRoute}
            activeOpacity={0.85}
            style={{
              backgroundColor: GREEN,
              paddingVertical: 13,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="navigate" size={16} color="white" />
            <Text style={{ color: "white", fontSize: 14, fontWeight: "800", marginLeft: 6 }}>
              Start In-Store Route
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ── SCREEN 9: Admin Dashboard ───────────────────────────────────────────────
const SEVERITY_COLOR = {
  expiring: "#DC2626",
  low_stock: "#EF4444",
  overstocked: "#F97316",
};
const SEVERITY_LABEL = {
  expiring: "EXPIRING",
  low_stock: "LOW STOCK",
  overstocked: "OVERSTOCK",
};

const AdminScreen = ({ user, onLogout, onSelect }) => {
  const analytics = useMemo(() => getAnalytics(), []);
  const health = useMemo(() => getStockHealth(), []);
  const traffic = useMemo(() => getTrafficByAisle(), []);
  const missions = useMemo(() => getMorningMissions(), []);
  const topCategories = useMemo(
    () => analytics.categories.slice(0, 5),
    [analytics]
  );

  const [tab, setTab] = useState("restock");
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [missionDone, setMissionDone] = useState(new Set());
  const [missionSnoozed, setMissionSnoozed] = useState(new Set());
  const [missionExpanded, setMissionExpanded] = useState(null);
  const activeMissions = missions.filter(
    (m) => !missionDone.has(m.id) && !missionSnoozed.has(m.id)
  );
  const totalImpact = activeMissions.reduce((s, m) => s + m.impact, 0);

  const approveMission = (m) =>
    setMissionDone((s) => new Set([...s, m.id]));
  const snoozeMission = (m) =>
    setMissionSnoozed((s) => new Set([...s, m.id]));

  const loadInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const text = await getInsights();
      setInsights(text);
    } catch (e) {
      setInsightsError(e.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  const list =
    tab === "restock" ? analytics.lowStock :
    tab === "overstock" ? analytics.overstocked :
    analytics.expiring;

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_GRAY }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 10,
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
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#FEF3C7",
              borderWidth: 1.5,
              borderColor: "#F59E0B",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#B45309", fontWeight: "800", fontSize: 14 }}>A</Text>
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text style={{ fontWeight: "800", fontSize: 15, color: DARK }}>Admin</Text>
            <Text style={{ fontSize: 11, color: GRAY }}>
              {user?.name || "Manager"} · Gənclik Mall
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onLogout}
          style={{
            borderWidth: 1,
            borderColor: BORDER,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600", color: GRAY }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {/* Morning Mission — today's 3 highest-impact actions */}
        <View style={{ paddingHorizontal: 12, paddingTop: 14, paddingBottom: 4 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 6 }}>☀️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "800", fontSize: 16, color: TEXT_TITLE }}>
                Morning Mission
              </Text>
              <Text style={{ fontSize: 11, color: TEXT_MUTED }}>
                {activeMissions.length === 0
                  ? "All clear — nothing to action right now."
                  : `${activeMissions.length} action${
                      activeMissions.length === 1 ? "" : "s"
                    } · ₼${totalImpact.toLocaleString()} impact today`}
              </Text>
            </View>
          </View>
          {activeMissions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              expanded={missionExpanded === m.id}
              onToggleExpand={() =>
                setMissionExpanded((cur) => (cur === m.id ? null : m.id))
              }
              onApprove={() => approveMission(m)}
              onSnooze={() => snoozeMission(m)}
              onTap={() => onSelect(m.product)}
            />
          ))}
          {activeMissions.length === 0 && missions.length > 0 && (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: R.md,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 6 }}>🎯</Text>
              <Text style={{ fontWeight: "700", fontSize: 13, color: TEXT_TITLE }}>
                Today's missions are handled
              </Text>
              <Text style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>
                Approved {missionDone.size} · Snoozed {missionSnoozed.size}
              </Text>
            </View>
          )}
        </View>

        {/* Compact KPI strip — counts only, no big cards */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "white",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: BORDER,
          }}
        >
          <KpiInline label="Revenue 30d" value={`${(analytics.totalRevenue / 1000).toFixed(0)}K ₼`} />
          <KpiInline label="Expiring" value={analytics.expiring.length} accent="#DC2626" />
          <KpiInline label="Low stock" value={analytics.lowStock.length} accent={RED} />
          <KpiInline label="Overstock" value={analytics.overstocked.length} accent={ORANGE} last />
        </View>

        {/* AI Store Manager — soft, light, scannable. Was a heavy dark card. */}
        <View style={{ paddingHorizontal: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={loadInsights}
            disabled={insightsLoading}
            activeOpacity={0.85}
            style={{
              backgroundColor: "white",
              borderRadius: R.md,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                },
                android: { elevation: 1 },
              }),
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: `${GREEN}1A`,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Icon name="robot" size={16} color={GREEN} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: TEXT_TITLE }}>
                AI Store Manager
              </Text>
              <Text style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 1 }} numberOfLines={1}>
                {insightsLoading
                  ? "Analyzing…"
                  : insights
                  ? "Briefing ready · tap to refresh"
                  : "Tap for a 130-word manager briefing"}
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "700", color: GREEN }}>
              {insights ? "Refresh" : "Generate"}
            </Text>
          </TouchableOpacity>
          {insightsError && (
            <Text style={{ color: RED, fontSize: 12, marginTop: 6, paddingHorizontal: 4 }}>
              ⚠️ {insightsError}
            </Text>
          )}
          {insights && !insightsLoading && (
            <View
              style={{
                backgroundColor: SOFT_BG,
                borderRadius: R.md,
                padding: 12,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 13, color: TEXT_TITLE, lineHeight: 19 }}>
                {insights}
              </Text>
            </View>
          )}
        </View>

        {/* Charts: Stock Health + Top Categories */}
        <SectionHeader title="At a glance" />
        <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: R.md,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              ...adminShadow(),
            }}
          >
            <Donut health={health} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontWeight: "700", fontSize: 13, color: TEXT_TITLE, marginBottom: 8 }}>
                Stock health
              </Text>
              <Legend color={GREEN} label="Healthy" value={health.ok} total={health.total} />
              <Legend color="#EF4444" label="Low" value={health.low} total={health.total} />
              <Legend color="#F97316" label="Over" value={health.over} total={health.total} />
              <Legend color="#DC2626" label="Expiring" value={health.exp} total={health.total} />
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: R.md,
              padding: 14,
              ...adminShadow(),
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 13, color: TEXT_TITLE, marginBottom: 10 }}>
              Top categories · 30-day revenue
            </Text>
            <CategoryBars categories={topCategories} />
          </View>
        </View>

        {/* Aisle Traffic — compact list */}
        <SectionHeader title="Aisle traffic this week" />
        <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: R.md,
              padding: 12,
              ...adminShadow(),
            }}
          >
            {traffic.slice(0, 6).map((a, i) => {
              const max = traffic[0].visitors;
              const w = `${Math.max(8, (a.visitors / max) * 100)}%`;
              const isHigh = i < 2;
              const isLow = i >= 4;
              return (
                <View
                  key={a.aisle}
                  style={{
                    marginBottom: i === 5 ? 0 : 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: TEXT_TITLE, fontWeight: "600" }}>
                      A{a.aisle} · {a.name}{" "}
                      {isHigh ? "🔥" : isLow ? "🐢" : ""}
                    </Text>
                    <Text style={{ fontSize: 11, color: TEXT_MUTED }}>
                      {a.visitors.toLocaleString()}
                    </Text>
                  </View>
                  <View
                    style={{ height: 4, backgroundColor: SOFT_BG, borderRadius: 2, overflow: "hidden" }}
                  >
                    <View
                      style={{
                        height: 4,
                        backgroundColor: isHigh ? GREEN : isLow ? "#D1D1D6" : GREEN_MID,
                        width: w,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Full lists — iOS grouped-table-style rows */}
        <SectionHeader title="Inventory issues" />
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 12,
            backgroundColor: SOFT_BG,
            borderRadius: 10,
            padding: 3,
            marginBottom: 10,
          }}
        >
          {[
            { id: "restock", label: `Restock · ${analytics.lowStock.length}` },
            { id: "overstock", label: `Over · ${analytics.overstocked.length}` },
            { id: "expiring", label: `Exp · ${analytics.expiring.length}` },
          ].map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: tab === t.id ? "white" : "transparent",
                alignItems: "center",
                ...(tab === t.id
                  ? Platform.select({
                      ios: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 2,
                      },
                      android: { elevation: 1 },
                    })
                  : {}),
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: tab === t.id ? "700" : "500",
                  color: tab === t.id ? TEXT_TITLE : TEXT_MUTED,
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 12 }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: R.md,
              overflow: "hidden",
              ...adminShadow(),
            }}
          >
            {list.slice(0, 30).map((p, i) => (
              <InventoryRow
                key={p.product_id}
                product={p}
                onPress={() => onSelect(p)}
                isLast={i === Math.min(list.length, 30) - 1}
              />
            ))}
            {list.length === 0 && (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: TEXT_MUTED, fontSize: 13 }}>
                  Nothing flagged in this bucket. 🎉
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

function adminShadow() {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: { elevation: 1 },
    default: {},
  });
}

const SectionHeader = ({ title }) => (
  <Text
    style={{
      fontSize: 13,
      fontWeight: "700",
      color: TEXT_MUTED,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      paddingHorizontal: 16,
      marginBottom: 8,
      marginTop: 4,
    }}
  >
    {title}
  </Text>
);

const InventoryRow = ({ product, onPress, isLast }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.6}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderBottomWidth: isLast ? 0 : 0.5,
      borderBottomColor: SUBTLE_BORDER,
    }}
  >
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: SEVERITY_COLOR[product.status] || GRAY,
        marginRight: 12,
      }}
    />
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: TEXT_TITLE }} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 1 }} numberOfLines={1}>
        A{product.aisle_num} · Stk {product.stock_qty} · Sold/30d {product.units_sold}
        {product.is_fresh ? ` · Exp ${product.expires_in_days}d` : ""}
      </Text>
    </View>
    <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: TEXT_TITLE }}>
        {product.price_azn.toFixed(2)} ₼
      </Text>
      <Text style={{ fontSize: 14, color: "#C7C7CC", marginTop: -2 }}>›</Text>
    </View>
  </TouchableOpacity>
);

const KpiInline = ({ label, value, accent, last }) => (
  <View
    style={{
      flex: 1,
      borderRightWidth: last ? 0 : 1,
      borderRightColor: BORDER,
      paddingHorizontal: 6,
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 9, color: GRAY, fontWeight: "700", letterSpacing: 0.5 }}>
      {label.toUpperCase()}
    </Text>
    <Text
      style={{
        fontSize: 16,
        fontWeight: "800",
        color: accent || DARK,
        marginTop: 1,
      }}
    >
      {value}
    </Text>
  </View>
);

const ManagerCard = ({ product, recommendation, aiAnalysis, aiLoading, aiError, onGenerate }) => {
  const color = SEVERITY_COLOR[product.status] || GREEN;
  const tag =
    SEVERITY_LABEL[product.status] ||
    (recommendation.severity === 0 ? "HEALTHY" : "REVIEW");
  return (
    <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 4 }}>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: BORDER,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: color,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>⚡</Text>
            <Text style={{ color: "white", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
              {tag} · MANAGER VIEW
            </Text>
          </View>
          <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
            {recommendation.action}
          </Text>
        </View>

        <View style={{ padding: 14 }}>
          <Text style={{ fontSize: 13, color: DARK, lineHeight: 19 }}>
            {recommendation.narrative}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 10, gap: 8, flexWrap: "wrap" }}>
            {recommendation.markdownPct > 0 && (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#B45309" }}>
                  ↓ {recommendation.markdownPct}% markdown
                </Text>
              </View>
            )}
            {recommendation.reorderQty > 0 && (
              <View
                style={{
                  backgroundColor: "#DBEAFE",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#1E40AF" }}>
                  + Reorder {recommendation.reorderQty} units
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginTop: 12,
              gap: 10,
              backgroundColor: LIGHT_GRAY,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <ManagerStat label="Stock" value={product.stock_qty} />
            <ManagerStat label="Sold/30d" value={product.units_sold} />
            <ManagerStat
              label="Days cover"
              value={product.days_of_stock > 99 ? "99+" : product.days_of_stock}
            />
            {product.is_fresh && (
              <ManagerStat label="Expires" value={`${product.expires_in_days}d`} />
            )}
            <ManagerStat
              label="Revenue/30d"
              value={`${Math.round(product.units_sold * product.price_azn)} ₼`}
            />
            <ManagerStat
              label="Stock value"
              value={`${Math.round(product.stock_qty * product.price_azn)} ₼`}
            />
          </View>

          <View
            style={{
              marginTop: 12,
              borderTopWidth: 1,
              borderTopColor: BORDER,
              paddingTop: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: DARK,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="robot" size={14} color={GREEN} />
              </View>
              <Text style={{ fontWeight: "800", fontSize: 13, color: DARK, marginLeft: 8, flex: 1 }}>
                AI Analysis
              </Text>
              <TouchableOpacity
                onPress={onGenerate}
                disabled={aiLoading}
                style={{
                  backgroundColor: GREEN,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  opacity: aiLoading ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>
                  {aiAnalysis ? "Refresh" : "Generate"}
                </Text>
              </TouchableOpacity>
            </View>
            {aiLoading && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" color={GREEN} />
                <Text style={{ color: GRAY, marginLeft: 8, fontSize: 12 }}>
                  Generating tailored analysis…
                </Text>
              </View>
            )}
            {aiError && (
              <Text style={{ color: RED, fontSize: 12 }}>⚠️ {aiError}</Text>
            )}
            {aiAnalysis && !aiLoading && (
              <Text style={{ fontSize: 13, color: DARK, lineHeight: 19 }}>{aiAnalysis}</Text>
            )}
            {!aiAnalysis && !aiLoading && !aiError && (
              <Text style={{ fontSize: 12, color: GRAY, fontStyle: "italic" }}>
                Tap "Generate" for a tailored AI analysis of this specific SKU's
                situation and recommended action.
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const ManagerStat = ({ label, value }) => (
  <View style={{ minWidth: "30%" }}>
    <Text style={{ fontSize: 10, fontWeight: "700", color: GRAY, letterSpacing: 0.5 }}>
      {label.toUpperCase()}
    </Text>
    <Text style={{ fontSize: 13, fontWeight: "800", color: DARK, marginTop: 2 }}>{value}</Text>
  </View>
);

const MISSION_THEME = {
  discount: { color: "#F97316", emoji: "↓", verb: "DISCOUNT" },
  restock: { color: "#1E40AF", emoji: "+", verb: "REORDER" },
  move: { color: "#8B5CF6", emoji: "→", verb: "MOVE" },
};

// Coloured / bold call-to-action block shown when the manager taps "Why?".
// Highlights the exact numbers and the source / destination aisles so it's
// scannable in under a second.
const MissionDetailHighlight = ({ mission, theme }) => {
  if (mission.type === "move" && mission.suggestion?.topHotAisles) {
    const from = mission.suggestion.currentAisle;
    const dests = mission.suggestion.topHotAisles;
    const moveUnits = mission.suggestion.moveUnits;
    return (
      <View
        style={{
          backgroundColor: `${theme.color}14`,
          borderLeftWidth: 4,
          borderLeftColor: theme.color,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: R.sm,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "800", color: theme.color, letterSpacing: 0.5, marginBottom: 6 }}>
          SUGGESTED MOVE
        </Text>
        <Text style={{ fontSize: 14, color: TEXT_TITLE, lineHeight: 22 }}>
          Move{" "}
          <Text style={{ fontWeight: "800", color: TEXT_TITLE, backgroundColor: "#FEF3C7" }}>
            {" "}{moveUnits} units of {mission.product.name}{" "}
          </Text>
          {"\n"}from{" "}
          <Text style={{ fontWeight: "800", color: "#DC2626" }}>
            Aisle {from} ({mission.suggestion.currentDept})
          </Text>
          {"  →  to "}
          <Text style={{ fontWeight: "800", color: GREEN }}>
            Aisle{dests.length > 1 ? "s" : ""}{" "}
            {dests.map((a, i) => (
              <Text key={a.aisle}>
                {a.aisle}
                {i < dests.length - 1 ? (i === dests.length - 2 ? " or " : ", ") : ""}
              </Text>
            ))}
          </Text>
        </Text>
        <View style={{ flexDirection: "row", marginTop: 10, gap: 6, flexWrap: "wrap" }}>
          {dests.map((a) => (
            <View
              key={a.aisle}
              style={{
                backgroundColor: GREEN,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: "white", fontSize: 11, fontWeight: "800" }}>
                A{a.aisle} · {a.name} · {a.visitors.toLocaleString()}/wk 🔥
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (mission.type === "discount" && mission.recommendation) {
    const pct = mission.recommendation.markdownPct;
    return (
      <View
        style={{
          backgroundColor: `${theme.color}14`,
          borderLeftWidth: 4,
          borderLeftColor: theme.color,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: R.sm,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "800", color: theme.color, letterSpacing: 0.5, marginBottom: 6 }}>
          SUGGESTED MARKDOWN
        </Text>
        <Text style={{ fontSize: 14, color: TEXT_TITLE, lineHeight: 22 }}>
          Drop the price of{" "}
          <Text style={{ fontWeight: "800", backgroundColor: "#FEF3C7" }}>
            {" "}{mission.product.name}{" "}
          </Text>
          by{" "}
          <Text style={{ fontWeight: "800", color: theme.color, fontSize: 18 }}>
            −{pct}%
          </Text>
          {" "}for{" "}
          <Text style={{ fontWeight: "800", color: TEXT_TITLE }}>5 days</Text>
          {". New shelf price: "}
          <Text style={{ fontWeight: "800", color: GREEN }}>
            {(mission.product.price_azn * (1 - pct / 100)).toFixed(2)} ₼
          </Text>
          {" (was "}
          <Text style={{ textDecorationLine: "line-through", color: TEXT_MUTED }}>
            {mission.product.price_azn.toFixed(2)} ₼
          </Text>
          {")"}
        </Text>
      </View>
    );
  }

  if (mission.type === "restock") {
    const p = mission.product;
    const daily = Math.round(p.units_sold / 30);
    return (
      <View
        style={{
          backgroundColor: `${theme.color}14`,
          borderLeftWidth: 4,
          borderLeftColor: theme.color,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderRadius: R.sm,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "800", color: theme.color, letterSpacing: 0.5, marginBottom: 6 }}>
          SUGGESTED REORDER
        </Text>
        <Text style={{ fontSize: 14, color: TEXT_TITLE, lineHeight: 22 }}>
          Order{" "}
          <Text style={{ fontWeight: "800", color: theme.color, fontSize: 18 }}>
            {p.reorderQty} units
          </Text>
          {" of "}
          <Text style={{ fontWeight: "800", backgroundColor: "#FEF3C7" }}>
            {" "}{p.name}{" "}
          </Text>
          {" — "}
          <Text style={{ fontWeight: "800", color: "#DC2626" }}>
            {p.urgency.toUpperCase()}
          </Text>
          {`. Selling ~${daily} units/day, only `}
          <Text style={{ fontWeight: "800", color: TEXT_TITLE }}>
            {p.days_of_stock} day{p.days_of_stock === 1 ? "" : "s"} of stock
          </Text>
          {" left."}
        </Text>
      </View>
    );
  }

  return null;
};

const MissionCard = ({ mission, expanded, onToggleExpand, onApprove, onSnooze, onTap }) => {
  const theme = MISSION_THEME[mission.type] || { color: GREEN, emoji: "•", verb: "ACTION" };
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: R.md,
        marginBottom: 10,
        overflow: "hidden",
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
          },
          android: { elevation: 2 },
        }),
      }}
    >
      {/* Coloured spine + impact badge at the top */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: `${theme.color}14`,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.color,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ color: "white", fontWeight: "800", fontSize: 14 }}>
            {theme.emoji}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "800", letterSpacing: 0.8, color: theme.color }}>
            {theme.verb} · {mission.impactLabel}
          </Text>
          <Text style={{ fontWeight: "800", fontSize: 18, color: TEXT_TITLE, marginTop: 1 }}>
            ₼ +{mission.impact.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Product + action */}
      <TouchableOpacity onPress={onTap} activeOpacity={0.7} style={{ padding: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: TEXT_TITLE }} numberOfLines={1}>
          {mission.product.name}
        </Text>
        <Text style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }} numberOfLines={1}>
          {mission.product.brand} · Aisle {mission.product.aisle_num} ·{" "}
          {mission.product.location}
        </Text>
        <View
          style={{
            backgroundColor: SOFT_BG,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: R.sm,
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, color: TEXT_TITLE, fontWeight: "600", flex: 1 }}>
            {mission.action}
          </Text>
        </View>

        {expanded && (
          <View style={{ marginTop: 12 }}>
            <MissionDetailHighlight mission={mission} theme={theme} />
            <Text style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 18, marginTop: 10 }}>
              {mission.narrative}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Action row */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 0.5,
          borderTopColor: SUBTLE_BORDER,
        }}
      >
        <TouchableOpacity
          onPress={onToggleExpand}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRightWidth: 0.5,
            borderRightColor: SUBTLE_BORDER,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT_MUTED }}>
            {expanded ? "Hide" : "Why?"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSnooze}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderRightWidth: 0.5,
            borderRightColor: SUBTLE_BORDER,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: TEXT_MUTED }}>
            Snooze
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onApprove}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "800", color: theme.color }}>
            Approve
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CriticalCard = ({ product, onPress }) => {
  const rec = product.recommendation;
  const color = SEVERITY_COLOR[product.status] || GRAY;
  const tag = SEVERITY_LABEL[product.status] || "ACTION";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 6,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: color,
          paddingHorizontal: 10,
          paddingVertical: 4,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "white", fontSize: 9, fontWeight: "800", letterSpacing: 1 }}>
          {tag} · {rec.action.toUpperCase()}
        </Text>
        <Text style={{ color: "white", fontSize: 9, fontWeight: "700" }}>
          {product.location}
        </Text>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "800", color: DARK }} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={{ fontSize: 12, color: DARK, lineHeight: 17, marginTop: 4 }} numberOfLines={3}>
          {rec.narrative}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 6, gap: 6, flexWrap: "wrap" }}>
          {rec.markdownPct > 0 && (
            <View
              style={{
                backgroundColor: "#FEF3C7",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 5,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#B45309" }}>
                ↓ {rec.markdownPct}%
              </Text>
            </View>
          )}
          {rec.reorderQty > 0 && (
            <View
              style={{
                backgroundColor: "#DBEAFE",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 5,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "800", color: "#1E40AF" }}>
                +{rec.reorderQty} units
              </Text>
            </View>
          )}
          <View
            style={{
              backgroundColor: LIGHT_GRAY,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 5,
            }}
          >
            <Text style={{ fontSize: 10, color: GRAY }}>
              Stk <Text style={{ color: DARK, fontWeight: "700" }}>{product.stock_qty}</Text> · Sold{" "}
              <Text style={{ color: DARK, fontWeight: "700" }}>{product.units_sold}</Text>
              {product.is_fresh && (
                <>
                  {" "}· Exp{" "}
                  <Text style={{ color: DARK, fontWeight: "700" }}>{product.expires_in_days}d</Text>
                </>
              )}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Donut = ({ health }) => {
  const SIZE = 88;
  const R = 36;
  const C = 2 * Math.PI * R;
  const segs = [
    { v: health.ok, color: GREEN },
    { v: health.low, color: "#EF4444" },
    { v: health.over, color: "#F97316" },
    { v: health.exp, color: "#DC2626" },
  ];
  const total = health.total || 1;
  let offset = 0;
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={LIGHT_GRAY} strokeWidth={14} fill="none" />
      {segs.map((s, i) => {
        const frac = s.v / total;
        const dash = frac * C;
        const el = (
          <Circle
            key={i}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={s.color}
            strokeWidth={14}
            fill="none"
            strokeDasharray={`${dash} ${C - dash}`}
            strokeDashoffset={-offset}
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
      <SvgText
        x={SIZE / 2}
        y={SIZE / 2 - 2}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={GRAY}
      >
        TOTAL
      </SvgText>
      <SvgText
        x={SIZE / 2}
        y={SIZE / 2 + 14}
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill={DARK}
      >
        {health.total.toLocaleString()}
      </SvgText>
    </Svg>
  );
};

const Legend = ({ color, label, value, total }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
      <View
        style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 8 }}
      />
      <Text style={{ fontSize: 12, color: DARK, fontWeight: "600", flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 12, color: GRAY, marginLeft: 4 }}>
        {value.toLocaleString()} · {pct}%
      </Text>
    </View>
  );
};

const CategoryBars = ({ categories }) => {
  const max = Math.max(1, ...categories.map((c) => c.revenue));
  const COLORS = ["#16A34A", "#0EA5E9", "#8B5CF6", "#F59E0B", "#EC4899"];
  return (
    <View>
      {categories.map((c, i) => {
        const w = `${Math.max(8, (c.revenue / max) * 100)}%`;
        return (
          <View key={c.category} style={{ marginBottom: 10 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: DARK }} numberOfLines={1}>
                {c.category}
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: DARK }}>
                {Math.round(c.revenue / 1000).toLocaleString()}K ₼
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 4, overflow: "hidden" }}>
              <View style={{ height: 8, backgroundColor: COLORS[i % COLORS.length], width: w, borderRadius: 4 }} />
            </View>
            <Text style={{ fontSize: 10, color: GRAY, marginTop: 2 }}>
              {c.count} SKUs · {c.units.toLocaleString()} units sold
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const KpiCard = ({ label, value, accent }) => (
  <View
    style={{
      width: "47.5%",
      backgroundColor: "white",
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: accent,
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderTopColor: BORDER,
      borderRightColor: BORDER,
      borderBottomColor: BORDER,
      paddingHorizontal: 12,
      paddingVertical: 10,
    }}
  >
    <Text style={{ fontSize: 10, fontWeight: "700", color: GRAY, letterSpacing: 1 }}>
      {label.toUpperCase()}
    </Text>
    <Text style={{ fontSize: 18, fontWeight: "800", color: DARK, marginTop: 2 }}>{value}</Text>
  </View>
);

const StatChip = ({ label, value }) => (
  <View
    style={{
      backgroundColor: LIGHT_GRAY,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    }}
  >
    <Text style={{ fontSize: 10, color: GRAY }}>
      {label}: <Text style={{ color: DARK, fontWeight: "700" }}>{value}</Text>
    </Text>
  </View>
);

// ── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [stack, setStack] = useState(["login"]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);
  // Chat state lives at the root so the conversation survives tab switches.
  const [chatMessages, setChatMessages] = useState([INITIAL_BOT_GREETING]);
  const [chatInput, setChatInput] = useState("");
  // Seed query when the user lands on Search via a category tile / link.
  const [pendingSearch, setPendingSearch] = useState(null);

  const searchFor = (query) => {
    setPendingSearch(query || "");
    nav("onsite-search");
  };
  const [routeProducts, setRouteProducts] = useState(null);

  const addToList = (product) => {
    if (!product) return;
    setShoppingList((s) =>
      s.some((p) => p.product_id === product.product_id) ? s : [...s, product]
    );
  };
  const removeFromList = (productId) =>
    setShoppingList((s) => s.filter((p) => p.product_id !== productId));
  const clearList = () => setShoppingList([]);

  const screen = stack[stack.length - 1];

  // Inline navigation pushes onto the stack so back-button can pop back
  // along the path (chat → product → map → back goes map → product → chat).
  const nav = (to) =>
    setStack((s) => (s[s.length - 1] === to ? s : [...s, to]));

  // Bottom-nav taps are tab switches, not pushes — reset the stack so the
  // tab is the only entry.
  const switchTab = (to) => setStack([to]);

  const goBack = () =>
    setStack((s) => {
      if (s.length > 1) return s.slice(0, -1);
      // Stack is at the root and the user hit back — fall back to home (or
      // admin dashboard for admins). Avoids stuck back buttons on screens
      // reached via the bottom nav (Map / Scanner).
      const home = user?.role === "admin" ? "admin" : "home";
      return s[0] === home ? s : [home];
    });

  const handleProduct = (p) => {
    setSelectedProduct(p);
    nav("product");
  };

  const handleLogin = (u) => {
    setUser(u);
    setStack([u.role === "admin" ? "admin" : "home"]);
  };

  const handleLogout = () => {
    setUser(null);
    setStack(["login"]);
    setSelectedProduct(null);
    setShoppingList([]);
    setChatMessages([INITIAL_BOT_GREETING]);
    setChatInput("");
  };

  const canGoBack = stack.length > 1;

  const handleNavigateList = () => {
    if (shoppingList.length === 0) return;
    setRouteProducts(shoppingList);
    nav("map");
  };

  // Whenever any "Show route / Navigate / Map" action is fired in the app
  // we hand the relevant product(s) to the map so the route is set
  // automatically — no manual list curation needed.
  const handleShowRoute = (productOrList) => {
    if (!productOrList) return;
    const list = Array.isArray(productOrList) ? productOrList : [productOrList];
    const filtered = list.filter((p) => p && p.product_id != null);
    if (filtered.length === 0) return;
    setSelectedProduct(filtered[0]);
    setRouteProducts(filtered.length > 1 ? filtered : null);
    nav("map");
  };

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <LoginScreen onLogin={handleLogin} />;
      case "admin":
        return (
          <AdminScreen
            user={user}
            onLogout={handleLogout}
            onSelect={handleProduct}
          />
        );
      case "home":
        return (
          <HomeScreen
            onNav={nav}
            shoppingListCount={shoppingList.length}
            user={user}
            onSearch={searchFor}
          />
        );
      case "premium":
        return (
          <PremiumScreen
            user={user}
            onBack={goBack}
            onProduct={handleProduct}
            onAddToList={addToList}
            onNav={nav}
          />
        );
      case "mealplan":
        return (
          <MealPlanScreen
            user={user}
            onBack={goBack}
            onProduct={handleProduct}
            onAddToList={addToList}
            onShowRoute={handleShowRoute}
          />
        );
      case "onsite":
        return <OnSiteScreen onNav={nav} />;
      case "onsite-search":
        return (
          <SearchScreen
            onProduct={handleProduct}
            onNav={nav}
            onBack={goBack}
            onAddToList={addToList}
            inList={shoppingList}
            onShowRoute={handleShowRoute}
            user={user}
            initialQuery={pendingSearch}
            onConsumed={() => setPendingSearch(null)}
          />
        );
      case "product":
        return (
          <ProductScreen
            product={selectedProduct}
            onBack={goBack}
            onNav={nav}
            user={user}
            onAddToList={addToList}
            inList={shoppingList}
            onShowRoute={handleShowRoute}
          />
        );
      case "scanner":
        return (
          <ScannerScreen
            onBack={goBack}
            onProduct={handleProduct}
            onAddToList={addToList}
            onShowRoute={handleShowRoute}
          />
        );
      case "assistant":
        return (
          <AssistantScreen
            onNav={nav}
            onProduct={handleProduct}
            onBack={canGoBack ? goBack : null}
            onAddToList={addToList}
            onShowRoute={handleShowRoute}
            messages={chatMessages}
            setMessages={setChatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
          />
        );
      case "map":
        return (
          <MapScreen
            onBack={() => {
              setRouteProducts(null);
              goBack();
            }}
            product={selectedProduct}
            products={routeProducts}
            shoppingList={shoppingList}
            onProduct={handleProduct}
            onNav={nav}
          />
        );
      case "rescue":
        return (
          <RescueScreen
            onProduct={handleProduct}
            onBack={goBack}
            onAddToList={addToList}
            onShowRoute={handleShowRoute}
            user={user}
          />
        );
      case "list":
        return (
          <ListScreen
            list={shoppingList}
            onProduct={handleProduct}
            onRemove={removeFromList}
            onClear={clearList}
            onBack={goBack}
            onStartRoute={handleNavigateList}
            onAddToList={addToList}
            user={user}
          />
        );
      default:
        return <HomeScreen onNav={nav} shoppingListCount={shoppingList.length} />;
    }
  };

  const noBottomNav =
    ["login", "scanner", "admin", "rescue", "list", "premium", "mealplan"].includes(screen) ||
    user?.role === "admin";
  const activeTab =
    ["home", "onsite", "onsite-search", "assistant", "map"].find((t) =>
      screen.startsWith(t)
    ) || "home";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: screen === "scanner" ? DARK : "white" }}
    >
      <StatusBar
        barStyle={screen === "scanner" ? "light-content" : "dark-content"}
      />
      <View style={{ flex: 1, backgroundColor: "white" }}>{renderScreen()}</View>
      {!noBottomNav && (
        <BottomNav
          active={activeTab}
          onNav={switchTab}
          onScan={() => switchTab("scanner")}
        />
      )}
    </SafeAreaView>
  );
}

const InfoStat = ({ label, value, flex2 }) => (
  <View style={{ minWidth: flex2 ? "55%" : "40%" }}>
    <Text style={{ fontSize: 10, fontWeight: "700", color: GRAY, letterSpacing: 1 }}>
      {label.toUpperCase()}
    </Text>
    <Text style={{ fontSize: 13, fontWeight: "700", color: DARK, marginTop: 2 }}>
      {value ?? "—"}
    </Text>
  </View>
);

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
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 0.5,
    borderTopColor: "#D1D1D6",
    paddingTop: 8,
    paddingBottom: 10,
  },
  bottomNavTab: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 56,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});
