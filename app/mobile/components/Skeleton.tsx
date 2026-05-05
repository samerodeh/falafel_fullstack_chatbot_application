import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: "#E8E0D5", opacity },
        style,
      ]}
    />
  );
}

export function MenuItemSkeleton() {
  return (
    <View style={sk.row}>
      <Skeleton width={72} height={72} borderRadius={0} />
      <View style={sk.body}>
        <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={11} style={{ marginBottom: 6 }} />
        <Skeleton width="30%" height={14} />
      </View>
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View style={sk.card}>
      <Skeleton width="100%" height={110} borderRadius={0} />
      <View style={{ padding: 10 }}>
        <Skeleton width="70%" height={13} style={{ marginBottom: 6 }} />
        <Skeleton width="100%" height={11} style={{ marginBottom: 4 }} />
        <Skeleton width="100%" height={11} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E0D5",
    alignItems: "center",
  },
  body: { flex: 1, padding: 12 },
  card: {
    width: "47%",
    margin: "1.5%",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E0D5",
  },
});