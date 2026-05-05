import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCart } from "../context/CartContext";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { addFavorite, DEFAULT_USER_ID } from "../constants/featuresApi";

const COLORS = {
  primary: "#C8522A", background: "#FDF8F3", card: "#FFFFFF",
  text: "#1A1A1A", muted: "#8C8C8C", border: "#E8E0D5", accent: "#F5EDE3",
};

export default function ItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item } = route.params;
  const { addItem } = useCart();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [selectedVariant, setSelectedVariant] = useState(item.variants?.[0] || "");
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const toggleMod = (mod: string) => {
    setSelectedMods(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const handleAdd = () => {
    if (!item.available) {
      navigation.navigate("Chat", { prefill: `This item is sold out. Suggest alternatives to ${item.name_en}` });
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.id,
        name_en: item.name_en,
        name_ar: item.name_ar,
        price: item.price,
        quantity: 1,
        variant: selectedVariant,
        modifications: selectedMods,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAskChef = () => {
    navigation.navigate("Chat", { prefill: `I have a question about the ${item.name_en}` });
  };

  const allMods = [
    ...(item.modifications?.toppings || []),
    ...(item.modifications?.sauces || []),
    ...(item.modifications?.add_ons || []),
    ...(item.modifications?.spice_level
      ? item.modifications.spice_level.map((s: string) => `Spice: ${s}`)
      : []),
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>‹ {t("common.back")}</Text>
          </TouchableOpacity>
          <Text style={s.heroEmoji}>🍽️</Text>
        </View>
        <View style={s.body}>
          <View style={s.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{language === "ar" ? item.name_ar : item.name_en}</Text>
              <Text style={s.nameSecondary}>{language === "ar" ? item.name_en : item.name_ar}</Text>
            </View>
            <Text style={s.price}>${item.price.toFixed(2)}</Text>
          </View>
          {!item.available && (
            <Text style={s.soldOut}>
              {language === "ar" ? "هذا العنصر غير متاح الآن. سنقترح بدائل في الدردشة." : "This item is currently sold out. We can suggest alternatives in chat."}
            </Text>
          )}
          <Text style={s.description}>
            {language === "ar" ? item.description_ar : item.description_en}
          </Text>
          <View style={s.tagRow}>
            {item.diet_tags.map((tag: string) => (
              <View key={tag} style={s.dietTag}>
                <Text style={s.dietTagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {item.variants?.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>{t("item.variants")}</Text>
              <View style={s.variantRow}>
                {item.variants.map((v: string) => (
                  <TouchableOpacity
                    key={v}
                    style={[s.variantBtn, selectedVariant === v && s.variantBtnActive]}
                    onPress={() => setSelectedVariant(v)}
                  >
                    <Text style={[s.variantText, selectedVariant === v && s.variantTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          {allMods.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>{t("item.modifications")}</Text>
              <View style={s.modGrid}>
                {allMods.map((mod: string) => (
                  <TouchableOpacity
                    key={mod}
                    style={[s.modBtn, selectedMods.includes(mod) && s.modBtnActive]}
                    onPress={() => toggleMod(mod)}
                  >
                    <Text style={[s.modText, selectedMods.includes(mod) && s.modTextActive]}>{mod}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Quantity</Text>
            <View style={s.stepperRow}>
              <TouchableOpacity style={s.stepperBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                <Text style={s.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={s.stepperVal}>{quantity}</Text>
              <TouchableOpacity style={s.stepperBtn} onPress={() => setQuantity(q => q + 1)}>
                <Text style={s.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t("item.ingredients")}</Text>
            <Text style={s.ingredients}>{item.ingredients.join(", ")}</Text>
          </View>
          {item.allergens.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>{t("item.allergens")}</Text>
              <View style={s.tagRow}>
                {item.allergens.map((a: string) => (
                  <View key={a} style={s.allergenTag}>
                    <Text style={s.allergenText}>⚠️ {a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity
          style={s.chefBtn}
          onPress={async () => {
            try {
              await addFavorite(DEFAULT_USER_ID, item.id);
            } catch {
              // no-op
            }
          }}
        >
          <Text style={s.chefBtnText}>❤️ Favorite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.chefBtn} onPress={handleAskChef}>
          <Text style={s.chefBtnText}>👨‍🍳 Ask the Chef</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.addBtn, added && s.addBtnDone]} onPress={handleAdd}>
          <Text style={s.addBtnText}>
            {added ? "✓ Added!" : `${t("item.addToCart")} · $${(item.price * quantity).toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 200, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  back: { position: "absolute", top: 16, left: 16 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: "600" },
  heroEmoji: { fontSize: 72 },
  body: { padding: 20 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  name: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  nameSecondary: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  price: { fontSize: 22, fontWeight: "700", color: COLORS.primary, marginLeft: 12 },
  description: { fontSize: 14, color: COLORS.muted, lineHeight: 22, marginBottom: 12 },
  soldOut: { fontSize: 13, color: "#C62828", backgroundColor: "#FFF5F5", borderRadius: 8, padding: 8, marginBottom: 10 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  dietTag: { backgroundColor: "#E8F5E9", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  dietTagText: { fontSize: 12, color: "#2E7D32", fontWeight: "500" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text, marginBottom: 10 },
  variantRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  variantBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  variantBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  variantText: { fontSize: 13, color: COLORS.muted },
  variantTextActive: { color: "#fff", fontWeight: "600" },
  modGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  modBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  modBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.primary },
  modText: { fontSize: 13, color: COLORS.muted },
  modTextActive: { color: COLORS.primary, fontWeight: "600" },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepperBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  stepperBtnText: { fontSize: 20, color: COLORS.primary, fontWeight: "700", lineHeight: 24 },
  stepperVal: { fontSize: 18, fontWeight: "700", color: COLORS.text, minWidth: 30, textAlign: "center" },
  ingredients: { fontSize: 13, color: COLORS.muted, lineHeight: 20 },
  allergenTag: { backgroundColor: "#FFF8E1", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  allergenText: { fontSize: 12, color: "#F57F17" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  chefBtn: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  chefBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: "600" },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  addBtnDone: { backgroundColor: "#4CAF50" },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});