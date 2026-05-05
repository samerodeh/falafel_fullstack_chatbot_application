import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator
} from "react-native";
import { useCart } from "../context/CartContext";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { useNavigation } from "@react-navigation/native";
import { createOrder, fetchPromos, DEFAULT_USER_ID } from "../constants/featuresApi";

const COLORS = {
  primary: "#C8522A", background: "#FDF8F3", card: "#FFFFFF",
  text: "#1A1A1A", muted: "#8C8C8C", border: "#E8E0D5", accent: "#F5EDE3",
};

const TAX_RATE = 0.14975;
const TIP_PRESETS = [0, 10, 15, 18, 20];

export default function CartScreen() {
  const { items, removeItem, clearCart, total, addItem } = useCart();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [tipPct, setTipPct] = useState(15);
  const [placing, setPlacing] = useState(false);
  const [promos, setPromos] = useState<any[]>([]);

  React.useEffect(() => {
    fetchPromos().then(setPromos).catch(() => setPromos([]));
  }, []);

  const subtotal = total;
  const tax = subtotal * TAX_RATE;
  const tip = subtotal * (tipPct / 100);
  const grandTotal = subtotal + tax + tip;

  const handleCheckout = () => {
    if (items.length === 0) return;
    setPlacing(true);
    (async () => {
      try {
        const order = await createOrder({
          userId: DEFAULT_USER_ID,
          source: "cart",
          items: items.map((x) => ({ itemId: x.id, name: x.name_en, quantity: x.quantity, price: x.price })),
        });
        setPlacing(false);
        clearCart();
        Alert.alert(
          language === "ar" ? "تم تأكيد الطلب! 🎉" : "Order Placed! 🎉",
          language === "ar"
            ? `طلبك بقيمة $${grandTotal.toFixed(2)} قيد التحضير.`
            : `Your order of $${grandTotal.toFixed(2)} is being prepared!`,
          [{ text: "Track", onPress: () => navigation.navigate("OrderStatus", { orderId: order.orderId }) }]
        );
      } catch {
        setPlacing(false);
      }
    })();
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={[s.title, isRTL && s.rtl]}>{t("cart.title")}</Text>
        </View>
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🛍️</Text>
          <Text style={s.emptyTitle}>
            {language === "ar" ? "سلتك فارغة" : "Your cart is empty"}
          </Text>
          <Text style={s.emptyText}>
            {language === "ar"
              ? "تصفّح القائمة وأضف بعض الأطباق اللذيذة!"
              : "Browse the menu and add some delicious dishes!"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={[s.title, isRTL && s.rtl]}>{t("cart.title")}</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={s.clearText}>{language === "ar" ? "مسح الكل" : "Clear all"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
        {promos.length > 0 && (
          <View style={s.promoCard}>
            <Text style={s.promoTitle}>Active Offers</Text>
            {promos.slice(0, 2).map((p) => (
              <Text key={p.promoId} style={s.promoText}>• {p.title}: {p.description}</Text>
            ))}
          </View>
        )}
        {items.map(item => (
          <View key={item.id} style={[s.row, isRTL && s.rowRTL]}>
            <View style={s.rowEmoji}>
              <Text style={{ fontSize: 24 }}>🍽️</Text>
            </View>
            <View style={s.rowBody}>
              <Text style={[s.rowName, isRTL && s.rtl]}>
                {language === "ar" ? item.name_ar : item.name_en}
              </Text>
              {item.variant ? <Text style={[s.rowMeta, isRTL && s.rtl]}>{item.variant}</Text> : null}
              {item.modifications && item.modifications.length > 0
                ? <Text style={[s.rowMeta, isRTL && s.rtl]}>{item.modifications.join(", ")}</Text>
                : null}
              <Text style={s.rowPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            <View style={s.rowRight}>
              <TouchableOpacity style={s.qtyBtn} onPress={() => removeItem(item.id)}>
                <Text style={s.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={s.qty}>{item.quantity}</Text>
              <TouchableOpacity style={s.qtyBtn} onPress={() => addItem(item)}>
                <Text style={s.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={s.tipSection}>
          <Text style={[s.tipTitle, isRTL && s.rtl]}>
            {language === "ar" ? "إضافة إكرامية" : "Add a tip"}
          </Text>
          <View style={s.tipRow}>
            {TIP_PRESETS.map(pct => (
              <TouchableOpacity
                key={pct}
                style={[s.tipBtn, tipPct === pct && s.tipBtnActive]}
                onPress={() => setTipPct(pct)}
              >
                <Text style={[s.tipText, tipPct === pct && s.tipTextActive]}>
                  {pct === 0 ? (language === "ar" ? "بدون" : "No tip") : `${pct}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.summary}>
          {[
            { label: language === "ar" ? "المجموع الفرعي" : "Subtotal", value: subtotal },
            { label: language === "ar" ? "الضريبة" : "Tax (QST + GST)", value: tax },
            { label: language === "ar" ? `إكرامية (${tipPct}%)` : `Tip (${tipPct}%)`, value: tip },
          ].map((row, i) => (
            <View key={i} style={[s.summaryRow, isRTL && s.rtlRow]}>
              <Text style={s.summaryLabel}>{row.label}</Text>
              <Text style={s.summaryValue}>${row.value.toFixed(2)}</Text>
            </View>
          ))}
          <View style={[s.summaryRow, s.totalRow, isRTL && s.rtlRow]}>
            <Text style={s.totalLabel}>{t("cart.total")}</Text>
            <Text style={s.totalAmount}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.checkoutBtn, placing && s.checkoutBtnLoading]}
          onPress={handleCheckout}
          disabled={placing}
        >
          {placing
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.checkoutText}>
                {language === "ar"
                  ? `تأكيد الطلب · $${grandTotal.toFixed(2)}`
                  : `${t("cart.checkout")} · $${grandTotal.toFixed(2)}`}
              </Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.text },
  rtl: { textAlign: "right" },
  rtlRow: { flexDirection: "row-reverse" },
  clearText: { fontSize: 14, color: COLORS.primary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", lineHeight: 22 },
  list: { flex: 1, paddingHorizontal: 16 },
  row: { flexDirection: "row", backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", gap: 10 },
  rowRTL: { flexDirection: "row-reverse" },
  rowEmoji: { width: 48, height: 48, borderRadius: 10, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 3 },
  rowMeta: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  rowPrice: { fontSize: 14, fontWeight: "700", color: COLORS.primary, marginTop: 4 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 18, color: COLORS.primary, fontWeight: "700", lineHeight: 22 },
  qty: { fontSize: 16, fontWeight: "600", color: COLORS.text, minWidth: 20, textAlign: "center" },
  tipSection: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  promoCard: { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", borderRadius: 12, padding: 12, marginBottom: 12 },
  promoTitle: { color: COLORS.primary, fontWeight: "700", marginBottom: 6 },
  promoText: { color: "#7C2D12", fontSize: 12, marginBottom: 2 },
  tipTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 10 },
  tipRow: { flexDirection: "row", gap: 8 },
  tipBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  tipBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tipText: { fontSize: 12, color: COLORS.muted, fontWeight: "500" },
  tipTextActive: { color: "#fff", fontWeight: "700" },
  summary: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryValue: { fontSize: 14, color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  totalAmount: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  checkoutBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  checkoutBtnLoading: { opacity: 0.7 },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
