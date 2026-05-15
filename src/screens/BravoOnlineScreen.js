import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DARK_GREEN, MID_GREEN, ACCENT_GREEN } from '../constants/colors';

const PRODUCTS = [
  { id: 1, name: 'Milk 1L', price: 2.49, category: 'Dairy', emoji: '🥛', inStock: true },
  { id: 2, name: 'Bread Loaf', price: 1.99, category: 'Bakery', emoji: '🍞', inStock: true },
  { id: 3, name: 'Eggs (12)', price: 3.89, category: 'Dairy', emoji: '🥚', inStock: true },
  { id: 4, name: 'Chicken 1kg', price: 6.49, category: 'Meat', emoji: '🍗', inStock: true },
  { id: 5, name: 'Tomatoes 1kg', price: 1.29, category: 'Veggies', emoji: '🍅', inStock: true },
  { id: 6, name: 'Rice 2kg', price: 3.49, category: 'Grains', emoji: '🍚', inStock: true },
  { id: 7, name: 'Orange Juice', price: 2.79, category: 'Drinks', emoji: '🍊', inStock: false },
  { id: 8, name: 'Yogurt 500g', price: 1.59, category: 'Dairy', emoji: '🫙', inStock: true },
  { id: 9, name: 'Butter 200g', price: 2.19, category: 'Dairy', emoji: '🧈', inStock: true },
  { id: 10, name: 'Pasta 500g', price: 1.49, category: 'Grains', emoji: '🍝', inStock: true },
  { id: 11, name: 'Apple 1kg', price: 1.99, category: 'Fruits', emoji: '🍎', inStock: true },
  { id: 12, name: 'Water 6-pack', price: 2.29, category: 'Drinks', emoji: '💧', inStock: true },
];

const CATEGORIES = ['All', 'Dairy', 'Bakery', 'Meat', 'Veggies', 'Fruits', 'Grains', 'Drinks'];

export default function BravoOnlineScreen() {
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('shop'); // shop | cart

  const filtered = useMemo(
    () =>
      PRODUCTS.filter((p) => {
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [activeCategory, search]
  );

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) =>
    setCart((c) => {
      if ((c[id] || 0) <= 1) {
        const n = { ...c };
        delete n[id];
        return n;
      }
      return { ...c, [id]: c[id] - 1 };
    });

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((p) => p.id === +id);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  if (view === 'cart') {
    const cartItems = Object.entries(cart).map(([id, qty]) => ({
      ...PRODUCTS.find((p) => p.id === +id),
      qty,
    }));
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[DARK_GREEN, MID_GREEN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cartHeader}
        >
          <View style={styles.cartHeaderRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setView('shop')}>
              <Text style={styles.backBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.cartTitle}>My Cart</Text>
          </View>
          <Text style={styles.cartSub}>
            {totalItems} item{totalItems !== 1 ? 's' : ''} · {totalPrice.toFixed(2)} AZN
          </Text>
        </LinearGradient>

        <View style={{ padding: 16 }}>
          {cartItems.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 48 }}>🛒</Text>
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartDesc}>Add some items to get started</Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => setView('shop')}
              >
                <Text style={styles.browseBtnText}>Browse Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemIcon}>
                    <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>
                      {(item.price * item.qty).toFixed(2)} AZN
                    </Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtnLight}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Text style={{ color: '#333', fontSize: 16 }}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{item.qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtnDark}
                      onPress={() => addToCart(item.id)}
                    >
                      <Text style={{ color: '#fff', fontSize: 16 }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryLabel}>{totalPrice.toFixed(2)} AZN</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text style={[styles.summaryLabel, { color: ACCENT_GREEN, fontWeight: '600' }]}>
                    Free
                  </Text>
                </View>
                <View style={styles.summaryTotal}>
                  <Text style={styles.summaryTotalText}>Total</Text>
                  <Text style={styles.summaryTotalText}>{totalPrice.toFixed(2)} AZN</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 16 }}>
                <LinearGradient
                  colors={[DARK_GREEN, ACCENT_GREEN]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.checkoutBtn}
                >
                  <Text style={styles.checkoutBtnText}>
                    Checkout · {totalPrice.toFixed(2)} AZN
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f0' }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={[DARK_GREEN, MID_GREEN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Bravo Online</Text>
              <Text style={styles.headerSub}>Fresh delivery to your door</Text>
            </View>
            <TouchableOpacity style={styles.cartBtn} onPress={() => setView('cart')}>
              <Text style={{ fontSize: 20 }}>🛒</Text>
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Text style={{ fontSize: 16, opacity: 0.7 }}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search products..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.catPill,
                  active && { backgroundColor: DARK_GREEN, borderColor: DARK_GREEN },
                ]}
              >
                <Text style={[styles.catText, active && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {filtered.map((product) => {
            const qty = cart[product.id] || 0;
            return (
              <View
                key={product.id}
                style={[styles.productCard, !product.inStock && { opacity: 0.6 }]}
              >
                {!product.inStock && (
                  <View style={styles.outBadge}>
                    <Text style={styles.outBadgeText}>OUT</Text>
                  </View>
                )}
                <Text style={styles.productEmoji}>{product.emoji}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCat}>{product.category}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{product.price.toFixed(2)} ₼</Text>
                  {product.inStock &&
                    (qty === 0 ? (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => addToCart(product.id)}
                      >
                        <Text style={{ color: '#fff', fontSize: 18 }}>+</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.qtyMini}>
                        <TouchableOpacity
                          style={styles.qtyMiniLight}
                          onPress={() => removeFromCart(product.id)}
                        >
                          <Text style={{ fontSize: 16 }}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyMiniNum}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.qtyMiniDark}
                          onPress={() => addToCart(product.id)}
                        >
                          <Text style={{ color: '#fff', fontSize: 16 }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {totalItems > 0 && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setView('cart')}
          style={styles.floatingBar}
        >
          <LinearGradient
            colors={[DARK_GREEN, ACCENT_GREEN]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingBarInner}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.floatingCount}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                  {totalItems}
                </Text>
              </View>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                View Cart
              </Text>
            </View>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
              {totalPrice.toFixed(2)} ₼
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f0' },

  header: {
    padding: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  cartBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  searchBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    padding: 0,
  },

  catRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  catPill: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  catText: { fontSize: 12, fontWeight: '600', color: '#555' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    width: '48%',
    minHeight: 160,
  },
  outBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4444',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  outBadgeText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  productEmoji: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  productName: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  productCat: { fontSize: 11, color: '#aaa', marginBottom: 8 },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  productPrice: { fontSize: 15, fontWeight: '700', color: DARK_GREEN },
  addBtn: {
    backgroundColor: DARK_GREEN,
    borderRadius: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyMini: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyMiniLight: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyMiniDark: {
    backgroundColor: DARK_GREEN,
    borderRadius: 8,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyMiniNum: { fontWeight: '700', fontSize: 13, minWidth: 18, textAlign: 'center' },

  floatingBar: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    shadowColor: '#2a6a4f',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderRadius: 16,
  },
  floatingBarInner: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Cart view
  cartHeader: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 22, lineHeight: 22 },
  cartTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cartSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },

  emptyCartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 12,
  },
  emptyCartDesc: { fontSize: 13, color: '#999', marginTop: 4 },
  browseBtn: {
    backgroundColor: ACCENT_GREEN,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 12,
  },
  browseBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  cartItemIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f5f5f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItemName: { fontWeight: '600', fontSize: 14, color: '#1a1a1a' },
  cartItemPrice: {
    fontSize: 13,
    color: ACCENT_GREEN,
    fontWeight: '600',
    marginTop: 2,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtnLight: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: { fontWeight: '700', fontSize: 14, minWidth: 20, textAlign: 'center' },

  summary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTotalText: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },

  checkoutBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
