import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { MenuItemSkeleton } from "../components/Skeleton";
import { addFavorite, fetchFavorites, DEFAULT_USER_ID } from "../constants/featuresApi";

const COLORS = {
  primary: "#C8522A", background: "#FDF8F3", card: "#FFFFFF",
  text: "#1A1A1A", muted: "#8C8C8C", border: "#E8E0D5", accent: "#F5EDE3",
};

const CATEGORIES = ["all","manaeesh","sandwiches","plates","mezze","salads","sweets","drinks","coffee_tea"];

export default function MenuScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchMenu = () => {
    setLoading(true);
    setError(false);
    axios.get(`${API_BASE_URL}/menu`)
      .then(res => { setItems(res.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchMenu(); }, []);
  useEffect(() => {
    fetchFavorites(DEFAULT_USER_ID).then(setFavorites).catch(() => setFavorites([]));
  }, []);

  const filtered = items.filter(item => {
    const categoryMatch = selectedCategory === "all" || item.category === selectedCategory;
    const searchMatch = search === "" ||
      item.name_en.toLowerCase().includes(search.toLowerCase()) ||
      item.name_ar.includes(search);
    return categoryMatch && searchMatch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, isRTL && styles.rtl]}>{t("menu.title")}</Text>
        <TextInput
          style={[styles.search, isRTL && styles.rtlInput]}
          placeholder={language === "ar" ? "بحث..." : "Search..."}
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          textAlign={isRTL ? "right" : "left"}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat === "all" ? (language === "ar" ? "الكل" : "All") : t(`home.categories.${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && (
        <ScrollView style={styles.list}>
          {[1,2,3,4,5].map(i => <MenuItemSkeleton key={i} />)}
        </ScrollView>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            ⚠️ {language === "ar" ? "تعذّر تحميل القائمة" : "Couldn't load menu"}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchMenu}>
            <Text style={styles.retryText}>
              {language === "ar" ? "إعادة المحاولة" : "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && filtered.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>
            {language === "ar" ? "لا توجد نتائج" : "No results found"}
          </Text>
          <Text style={styles.emptyText}>
            {language === "ar" ? "جرّب كلمة بحث أو فئة مختلفة" : "Try a different search or category"}
          </Text>
          {search !== "" && (
            <TouchableOpacity style={styles.clearSearch} onPress={() => setSearch("")}>
              <Text style={styles.clearSearchText}>Clear search</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.row}
              onPress={() => navigation.navigate("Item", { item })}
            >
              <View style={styles.rowImage}>
                <Text style={{ fontSize: 28 }}>🍽️</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={[styles.rowName, isRTL && styles.rtl]}>
                  {language === "ar" ? item.name_ar : item.name_en}
                </Text>
                <Text style={[styles.rowNameSub, isRTL && styles.rtl]} numberOfLines={1}>
                  {language === "ar" ? item.name_en : item.name_ar}
                </Text>
                <Text style={[styles.rowDesc, isRTL && styles.rtl]} numberOfLines={1}>
                  {language === "ar" ? item.description_ar : item.description_en}
                </Text>
                <View style={[styles.rowFooter, isRTL && styles.rtlRow]}>
                  <Text style={styles.rowPrice}>${item.price.toFixed(2)}</Text>
                  {!item.available && (
                    <Text style={styles.unavailable}>{t("menu.unavailable")}</Text>
                  )}
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const next = await addFavorite(DEFAULT_USER_ID, item.id);
                        setFavorites(next);
                      } catch {
                        // no-op
                      }
                    }}
                  >
                    <Text style={styles.favorite}>{favorites.includes(item.id) ? "★" : "☆"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.arrow}>{isRTL ? "‹" : "›"}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  rtl: { textAlign: "right" },
  rtlRow: { flexDirection: "row-reverse" },
  rtlInput: { textAlign: "right" },
  search: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  chipRow: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 44 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, marginRight: 8, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.muted },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  list: { flex: 1, paddingHorizontal: 16 },
  row: { flexDirection: "row", backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 10, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  rowImage: { width: 72, height: 72, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, padding: 12 },
  rowName: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  rowNameSub: { fontSize: 11, color: COLORS.muted, marginBottom: 4 },
  rowDesc: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  rowFooter: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowPrice: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  unavailable: { fontSize: 11, color: "#E53E3E", backgroundColor: "#FFF5F5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  favorite: { fontSize: 18, color: COLORS.primary, paddingHorizontal: 6 },
  arrow: { fontSize: 22, color: COLORS.muted, paddingRight: 12 },
  errorBox: { margin: 16, backgroundColor: "#FFF5F5", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#FFCDD2", alignItems: "center" },
  errorText: { fontSize: 14, color: "#C62828", marginBottom: 10 },
  retryBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: "center", marginBottom: 16 },
  clearSearch: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border },
  clearSearchText: { color: COLORS.primary, fontWeight: "600", fontSize: 13 },
});