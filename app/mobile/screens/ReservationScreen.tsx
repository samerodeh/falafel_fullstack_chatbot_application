import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { createReservation, DEFAULT_USER_ID } from "../constants/featuresApi";

const COLORS = {
  primary: "#C8522A", background: "#FDF8F3", card: "#FFFFFF",
  text: "#1A1A1A", muted: "#8C8C8C", border: "#E8E0D5", accent: "#F5EDE3",
};

const TIME_SLOTS = [
  { label: "12:00 PM", available: true },
  { label: "1:00 PM",  available: true },
  { label: "2:00 PM",  available: false },
  { label: "6:00 PM",  available: true },
  { label: "7:00 PM",  available: true },
  { label: "8:00 PM",  available: true },
  { label: "9:00 PM",  available: false },
  { label: "10:00 PM", available: true },
];

export default function ReservationScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(6);
  const [requests, setRequests] = useState("");
  const [preorder, setPreorder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = () => {
    if (!name || !date || !time || !phone) {
      Alert.alert(
        language === "ar" ? "معلومات ناقصة" : "Missing info",
        language === "ar" ? "يرجى ملء جميع الحقول." : "Please fill in name, phone, date and time."
      );
      return;
    }
    if (guests < 6) {
      Alert.alert(language === "ar" ? "عدد الضيوف" : "Too few guests", t("reservation.minGuests"));
      return;
    }
    setSubmitting(true);
    (async () => {
      try {
        const preorderItems = preorder
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .map((name) => ({ name, quantity: 1 }));
        await createReservation({
          userId: DEFAULT_USER_ID,
          dateTime: `${date} ${time}`,
          partySize: guests,
          contact: { name, phone },
          preorderItems,
          requests,
        });
        setSubmitting(false);
        setConfirmed(true);
      } catch {
        setSubmitting(false);
      }
    })();
  };

  if (confirmed) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.confirmScreen}>
          <Text style={s.confirmEmoji}>🎉</Text>
          <Text style={[s.confirmTitle, isRTL && s.rtl]}>{t("reservation.success")}</Text>
          <View style={s.confirmCard}>
            {[
              { label: language === "ar" ? "الاسم" : "Name", value: name },
              { label: language === "ar" ? "الهاتف" : "Phone", value: phone },
              { label: language === "ar" ? "التاريخ" : "Date", value: date },
              { label: language === "ar" ? "الوقت" : "Time", value: time },
              { label: language === "ar" ? "الضيوف" : "Guests", value: String(guests) },
              ...(requests ? [{ label: language === "ar" ? "طلبات خاصة" : "Requests", value: requests }] : []),
            ].map((row, i) => (
              <View key={i} style={[s.confirmRow, isRTL && s.rtlRow]}>
                <Text style={s.confirmLabel}>{row.label}</Text>
                <Text style={s.confirmValue}>{row.value}</Text>
              </View>
            ))}
          </View>
          <Text style={[s.confirmNote, isRTL && s.rtl]}>
            {language === "ar"
              ? "سنرسل تأكيداً على رقمك. نراك قريباً! 🌿"
              : "We'll send a confirmation to your phone. See you soon! 🌿"}
          </Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={s.doneBtnText}>{language === "ar" ? "تم" : "Done"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>{isRTL ? `${t("common.back")} ›` : `‹ ${t("common.back")}`}</Text>
          </TouchableOpacity>
          <Text style={[s.title, isRTL && s.rtl]}>{t("reservation.title")}</Text>
          <Text style={[s.subtitle, isRTL && s.rtl]}>
            {language === "ar" ? "للمجموعات المكونة من 6 أشخاص أو أكثر" : "Groups of 6 or more · Call for smaller groups"}
          </Text>
        </View>

        <View style={s.form}>
          <Field label={t("reservation.name")} isRTL={isRTL}>
            <TextInput style={[s.input, isRTL && s.inputRTL]}
              placeholder={language === "ar" ? "الاسم الكامل" : "Full name"}
              placeholderTextColor={COLORS.muted} value={name} onChangeText={setName}
              textAlign={isRTL ? "right" : "left"} />
          </Field>

          <Field label={language === "ar" ? "رقم الهاتف" : "Phone number"} isRTL={isRTL}>
            <TextInput style={[s.input, isRTL && s.inputRTL]}
              placeholder="+1 (514) 000-0000"
              placeholderTextColor={COLORS.muted} value={phone} onChangeText={setPhone}
              keyboardType="phone-pad" textAlign={isRTL ? "right" : "left"} />
          </Field>

          <Field label={t("reservation.date")} isRTL={isRTL}>
            <TextInput style={[s.input, isRTL && s.inputRTL]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={COLORS.muted} value={date} onChangeText={setDate}
              textAlign={isRTL ? "right" : "left"} />
          </Field>

          <Field label={t("reservation.time")} isRTL={isRTL}>
            <View style={s.timeGrid}>
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot.label}
                  style={[s.timeSlot, time === slot.label && s.timeSlotActive, !slot.available && s.timeSlotDisabled]}
                  onPress={() => slot.available && setTime(slot.label)}
                  disabled={!slot.available}
                >
                  <Text style={[s.timeSlotText, time === slot.label && s.timeSlotTextActive, !slot.available && s.timeSlotTextDisabled]}>
                    {slot.label}
                  </Text>
                  {!slot.available && <Text style={s.slotFull}>{language === "ar" ? "ممتلئ" : "Full"}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label={t("reservation.guests")} isRTL={isRTL}>
            <View style={s.stepperRow}>
              <TouchableOpacity style={s.stepperBtn} onPress={() => setGuests(g => Math.max(6, g - 1))}>
                <Text style={s.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <View style={s.stepperVal}>
                <Text style={s.stepperNum}>{guests}</Text>
                <Text style={s.stepperLabel}>{language === "ar" ? "ضيوف" : "guests"}</Text>
              </View>
              <TouchableOpacity style={s.stepperBtn} onPress={() => setGuests(g => g + 1)}>
                <Text style={s.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </Field>

          <Field label={language === "ar" ? "طلبات خاصة" : "Special requests"} isRTL={isRTL}>
            <TextInput style={[s.input, s.textarea, isRTL && s.inputRTL]}
              placeholder={language === "ar" ? "حساسية، كرسي أطفال، مناسبة خاصة..." : "Allergies, high chair, birthday celebration..."}
              placeholderTextColor={COLORS.muted} value={requests} onChangeText={setRequests}
              multiline numberOfLines={3} textAlign={isRTL ? "right" : "left"} />
          </Field>
          <Field label={language === "ar" ? "طلب مسبق (اختياري)" : "Preorder drinks/food (optional)"} isRTL={isRTL}>
            <TextInput
              style={[s.input, isRTL && s.inputRTL]}
              placeholder={language === "ar" ? "مثال: Latte, Date Cookies" : "Example: Latte, Date Cookies"}
              placeholderTextColor={COLORS.muted}
              value={preorder}
              onChangeText={setPreorder}
              textAlign={isRTL ? "right" : "left"}
            />
          </Field>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitBtn, submitting && s.submitBtnLoading]}
          onPress={handleSubmit} disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitText}>{t("reservation.submit")}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, children, isRTL }: { label: string; children: React.ReactNode; isRTL: boolean }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[{ fontSize: 14, fontWeight: "600", color: "#1A1A1A", marginBottom: 8 }, isRTL && { textAlign: "right" }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20 },
  back: { fontSize: 16, color: COLORS.primary, fontWeight: "600", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.muted },
  rtl: { textAlign: "right" },
  rtlRow: { flexDirection: "row-reverse" },
  form: { paddingHorizontal: 20 },
  input: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  inputRTL: { textAlign: "right" },
  textarea: { height: 80, textAlignVertical: "top" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeSlot: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: "center" },
  timeSlotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeSlotDisabled: { backgroundColor: "#F5F5F5", borderColor: "#E0E0E0" },
  timeSlotText: { fontSize: 13, color: COLORS.muted },
  timeSlotTextActive: { color: "#fff", fontWeight: "600" },
  timeSlotTextDisabled: { color: "#BDBDBD" },
  slotFull: { fontSize: 9, color: "#BDBDBD", marginTop: 2 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  stepperBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border },
  stepperBtnText: { fontSize: 22, color: COLORS.primary, fontWeight: "700", lineHeight: 26 },
  stepperVal: { alignItems: "center" },
  stepperNum: { fontSize: 28, fontWeight: "700", color: COLORS.text },
  stepperLabel: { fontSize: 12, color: COLORS.muted },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  submitBtnLoading: { opacity: 0.7 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  confirmScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  confirmEmoji: { fontSize: 60, marginBottom: 12 },
  confirmTitle: { fontSize: 24, fontWeight: "700", color: COLORS.text, marginBottom: 20 },
  confirmCard: { width: "100%", backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  confirmRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  confirmLabel: { fontSize: 14, color: COLORS.muted },
  confirmValue: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  confirmNote: { fontSize: 13, color: COLORS.muted, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});