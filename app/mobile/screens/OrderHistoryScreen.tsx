import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getOrderHistory, reorderOrder, DEFAULT_USER_ID } from "../constants/featuresApi";

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  async function load() {
    try {
      const rows = await getOrderHistory(DEFAULT_USER_ID);
      setOrders(rows);
    } catch {
      setOrders([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReorder(orderId: string) {
    try {
      await reorderOrder(DEFAULT_USER_ID, orderId);
      load();
    } catch {
      // no-op
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.title}>Order History</Text>
      <ScrollView contentContainerStyle={s.list}>
        {orders.length === 0 ? <Text style={s.empty}>No previous orders yet.</Text> : null}
        {orders.map((order) => (
          <View key={order.orderId} style={s.card}>
            <Text style={s.id}>#{order.orderId}</Text>
            <Text style={s.status}>Status: {order.status}</Text>
            <Text style={s.meta}>Source: {order.source}</Text>
            <Text style={s.items}>
              Items:{" "}
              {(order.items || [])
                .map((x: any) => `${x.name || x.itemId || "item"} x${x.quantity || 1}`)
                .join(", ")}
            </Text>
            <TouchableOpacity style={s.btn} onPress={() => handleReorder(order.orderId)}>
              <Text style={s.btnText}>Order Again</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FDF8F3", padding: 16 },
  title: { fontSize: 28, fontWeight: "700", color: "#1A1A1A", marginBottom: 12 },
  list: { gap: 10, paddingBottom: 32 },
  empty: { color: "#8C8C8C", marginTop: 10 },
  card: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E8E0D5", borderRadius: 12, padding: 12 },
  id: { fontWeight: "700", color: "#1A1A1A" },
  status: { color: "#1A1A1A", marginTop: 4, textTransform: "capitalize" },
  meta: { color: "#8C8C8C", marginTop: 2 },
  items: { color: "#8C8C8C", marginTop: 6 },
  btn: { marginTop: 10, backgroundColor: "#C8522A", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
