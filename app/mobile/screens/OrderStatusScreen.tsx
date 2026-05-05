import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getOrder, updateOrderStatus } from "../constants/featuresApi";

const FLOW = ["received", "preparing", "ready"] as const;

export default function OrderStatusScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId;
  const [status, setStatus] = useState<"received" | "preparing" | "ready">("received");

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      if (!orderId) return;
      try {
        const order = await getOrder(orderId);
        if (mounted && order?.status) setStatus(order.status);
      } catch {
        // no-op
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const activeIndex = useMemo(() => FLOW.indexOf(status), [status]);

  async function advanceStatus() {
    const idx = FLOW.indexOf(status);
    const next = FLOW[Math.min(idx + 1, FLOW.length - 1)];
    if (next === status) return;
    setStatus(next);
    if (orderId) {
      try {
        await updateOrderStatus(orderId, next);
      } catch {
        // no-op
      }
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Order Tracking</Text>
        <Text style={s.sub}>Order ID: {orderId || "N/A"}</Text>
        <View style={s.timeline}>
          {FLOW.map((step, i) => (
            <View key={step} style={s.row}>
              <View style={[s.dot, i <= activeIndex && s.dotActive]} />
              <Text style={[s.step, i <= activeIndex && s.stepActive]}>{step}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.primaryBtn} onPress={advanceStatus}>
          <Text style={s.primaryText}>Advance Status</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate("Main")}>
          <Text style={s.secondaryText}>Back Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FDF8F3" },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#1A1A1A" },
  sub: { fontSize: 13, color: "#8C8C8C", marginTop: 6, marginBottom: 20 },
  timeline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E8E0D5", borderRadius: 14, padding: 16, gap: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#E8E0D5" },
  dotActive: { backgroundColor: "#C8522A" },
  step: { color: "#8C8C8C", fontSize: 15, textTransform: "capitalize" },
  stepActive: { color: "#1A1A1A", fontWeight: "600" },
  primaryBtn: { backgroundColor: "#C8522A", borderRadius: 12, marginTop: 20, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: { borderWidth: 1, borderColor: "#E8E0D5", borderRadius: 12, marginTop: 10, paddingVertical: 14, alignItems: "center" },
  secondaryText: { color: "#8C8C8C", fontSize: 15, fontWeight: "600" },
});
