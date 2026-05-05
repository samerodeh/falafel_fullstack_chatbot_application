import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { CardSkeleton } from "../components/Skeleton";

const COLORS = {
  primary: "#C8522A", background: "#FDF8F3", card: "#FFFFFF",
  text: "#1A1A1A", muted: "#8C8C8C", border: "#E8E0D5", accent: "#F5EDE3",
};

const CATEGORIES = ["manaeesh","sandwiches","plates","mezze","salads","sweets","drinks","coffee_tea"];

const DIET_BADGE: Record<string, { emoji: string; bg: string; color: string }> = {
  vegan:       { emoji: "🌱", bg: "#E8F5E9", color: "#2E7D32" },
  vegetarian:  { emoji: "🥗", bg: "#F1F8E9", color: "#558B2F" },
  halal:       { emoji: "✓",  bg: "#E3F2FD", color: "#1565C0" },
  gluten_free: { emoji: "GF", bg: "#FFF3E0", color: "#E65100" },
};

function getTimeOfDay(): "breakfast" | "lunch" | "all-day" {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "breakfast";
  if (h >= 12 && h < 17) return "lunch";
  return "all-day";
}

function getGreeting(lang: string): string {
  const h = new Date().getHours();
  if (lang === "ar") {
    if (h < 12) return "صباح الخير ☀️";
    if (h < 17) return "مرحبا 🌿";
    return "مساء الخير 🌙";
  }
  if (h < 12) return "Good morning ☀️";
  if (h < 17) return "Welcome back 🌿";
  return "Good evening 🌙";
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<string>(getTimeOfDay());
  const [category, setCategory] = useState("all");

  const fetchMenu = () => {
    setLoading(true);
    setError(false);
    axios.get(`${API_BASE_URL}/menu`)
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchMenu(); }, []);

  const filtered = items.filter(item => {
    const pm = period === "all-day" || item.meal_period === period || item.meal_period === "all-day";
    const cm = category === "all" || item.category === category;
    return pm && cm && item.available;
  });

  const specials = filtered.slice(0, 3);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Text style={s.greeting}>{getGreeting(language)}</Text>
          <Text style={[s.heroTitle, isRTL && s.rtl]}>{language === "ar" ? "سفرة" : "Sufra"}</Text>
          <Text style={[s.heroSub, isRTL && s.rtl]}>
            {language === "ar" ? "مطبخ شامي أصيل" : "Authentic Levantine Kitchen"}
          </Text>
          <View style={[s.periodRow, isRTL && s.rtlRow]}>
            {(["breakfast","lunch","all-day"] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[s.periodBtn, period === p && s.periodBtnActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[s.periodText, period === p && s.periodTextActive]}>
                  {p === "breakfast" ? (language === "ar" ? "فطور" : "Breakfast")
                    : p === "lunch" ? (language === "ar" ? "غداء" : "Lunch")
                    : (language === "ar" ? "الكل" : "All Day")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>⚠️ Couldn't load menu. Check your connection.</Text>
            <TouchableOpacity style={s.retryBtn} onPress={fetchMenu}>
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && specials.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, isRTL && s.rtl]}>
              {language === "ar" ? "⭐ اليوم" : "⭐ Today's Picks"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {specials.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={s.specialCard}
                  onPress={() => navigation.navigate("Menu", { screen: "Item", params: { item } })}
                >
                  <View style={s.specialImg}><Text style={{ fontSize: 32 }}>🍽️</Text></View>
                  <Text style={[s.specialName, isRTL && s.rtl]} numberOfLines={1}>
                    {language === "ar" ? item.name_ar : item.name_en}
                  </Text>
                  <Text style={s.specialPrice}>${item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
          {["all", ...CATEGORIES].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.chip, category === cat && s.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[s.chipText, category === cat && s.chipTextActive]}>
                {cat === "all" ? (language === "ar" ? "الكل" : "All") : t(`home.categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && (
          <View style={s.grid}>
            {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </View>
        )}

        {!loading && !error && filtered.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🍽️</Text>
            <Text style={s.emptyTitle}>
              {language === "ar" ? "لا توجد عناصر" : "Nothing here"}
            </Text>
            <Text style={s.emptyText}>
              {language === "ar"
                ? "جرّب فئة أو وقت وجبة مختلف"
                : "Try a different category or meal period"}
            </Text>
          </View>
        )}

        {!loading && !error && filtered.length > 0 && (
          <View style={s.grid}>
            {filtered.map(item => (
              <TouchableOpacity
                key={item.id}
                style={s.card}
                onPress={() => navigation.navigate("Menu", { screen: "Item", params: { item } })}
              >
                <View style={s.cardImg}><Text style={{ fontSize: 36 }}>🍽️</Text></View>
                <View style={s.cardBody}>
                  <Text style={[s.cardName, isRTL && s.rtl]} numberOfLines={1}>
                    {language === "ar" ? item.name_ar : item.name_en}
                  </Text>
                  {language === "en" && item.name_ar
                    ? <Text style={s.cardNameAr} numberOfLines={1}>{item.name_ar}</Text>
                    : null}
                  <Text style={[s.cardDesc, isRTL && s.rtl]} numberOfLines={2}>
                    {language === "ar" ? item.description_ar : item.description_en}
                  </Text>
                  <View style={[s.cardFooter, isRTL && s.rtlRow]}>
                    <Text style={s.cardPrice}>${item.price.toFixed(2)}</Text>
                    <View style={s.badges}>
                      {item.diet_tags.slice(0, 2).map((tag: string) => {
                        const b = DIET_BADGE[tag];
                        if (!b) return null;
                        return (
                          <View key={tag} style={[s.badge, { backgroundColor: b.bg }]}>
                            <Text style={[s.badgeText, { color: b.color }]}>{b.emoji}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 90 }} />
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate("Chat")}>
        <Text style={s.fabText}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  hero: { backgroundColor: COLORS.primary, padding: 24, paddingTop: 20, paddingBottom: 24 },
  greeting: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 4 },
  heroTitle: { fontSize: 36, fontWeight: "800", color: "#fff", letterSpacing: -1 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2, marginBottom: 16 },
  rtl: { textAlign: "right" },
  rtlRow: { flexDirection: "row-reverse" },
  periodRow: { flexDirection: "row", gap: 8 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)" },
  periodBtnActive: { backgroundColor: "#fff" },
  periodText: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "500" },
  periodTextActive: { color: COLORS.primary, fontWeight: "700" },
  errorBox: { margin: 16, backgroundColor: "#FFF5F5", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#FFCDD2", alignItems: "center" },
  errorText: { fontSize: 14, color: "#C62828", marginBottom: 10 },
  retryBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  specialCard: { width: 130, marginRight: 12, backgroundColor: COLORS.card, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  specialImg: { height: 80, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  specialName: { fontSize: 12, fontWeight: "600", color: COLORS.text, padding: 8, paddingBottom: 2 },
  specialPrice: { fontSize: 13, fontWeight: "700", color: COLORS.primary, paddingHorizontal: 8, paddingBottom: 8 },
  chipRow: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 54 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, marginRight: 8, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.muted },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12 },
  card: { width: "47%", margin: "1.5%", backgroundColor: COLORS.card, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  cardImg: { height: 110, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  cardNameAr: { fontSize: 11, color: COLORS.muted, marginBottom: 4 },
  cardDesc: { fontSize: 11, color: COLORS.muted, lineHeight: 16, marginBottom: 8 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardPrice: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  badges: { flexDirection: "row", gap: 4 },
  badge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center" },
  fab: { position: "absolute", bottom: 80, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fabText: { fontSize: 22 },
});