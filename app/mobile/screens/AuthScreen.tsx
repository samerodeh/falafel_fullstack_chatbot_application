import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const COLORS = {
  primary: "#C8522A",
  primaryLight: "#E8694A",
  background: "#FDF8F3",
  card: "#FFFFFF",
  text: "#1A1A1A",
  muted: "#8C8C8C",
  border: "#E8E0D5",
  error: "#D32F2F",
};

interface Props {
  onAuth: (userId: string, name: string) => void;
}

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    reset();
  };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const url =
        mode === "signup"
          ? `${API_BASE_URL}/auth/signup`
          : `${API_BASE_URL}/auth/login`;

      const payload =
        mode === "signup"
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password };

      const res = await axios.post(url, payload);
      if (mode === "signup") {
        reset();
        setMode("login");
        setError("");
        Alert.alert("Account created!", "Please log in with your new account.");
      } else {
        onAuth(res.data.userId, res.data.name);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={36} color={COLORS.card} />
          </View>
          <Text style={styles.brand}>سُفرة</Text>
          <Text style={styles.brandEn}>Sufra</Text>
          <Text style={styles.tagline}>Authentic Lebanese Dining</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === "login" && styles.toggleActive]}
              onPress={() => switchMode("login")}
            >
              <Text style={[styles.toggleText, mode === "login" && styles.toggleTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === "signup" && styles.toggleActive]}
              onPress={() => switchMode("signup")}
            >
              <Text style={[styles.toggleText, mode === "signup" && styles.toggleTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardTitle}>
            {mode === "login" ? "Welcome back!" : "Create an account"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {mode === "login"
              ? "Sign in to continue your experience"
              : "Join Sufra for a personalized experience"}
          </Text>

          {/* Name field (signup only) */}
          {mode === "signup" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={COLORS.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password (signup only) */}
          {mode === "signup" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {mode === "login" ? "Login" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switch hint */}
          <TouchableOpacity onPress={() => switchMode(mode === "login" ? "signup" : "login")}>
            <Text style={styles.switchHint}>
              {mode === "login"
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },

  header: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  brand: { fontSize: 32, fontWeight: "700", color: COLORS.primary, letterSpacing: 1 },
  brandEn: { fontSize: 16, fontWeight: "600", color: COLORS.text, letterSpacing: 4, marginTop: 2 },
  tagline: { fontSize: 13, color: COLORS.muted, marginTop: 6 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  toggle: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 14, fontWeight: "600", color: COLORS.muted },
  toggleTextActive: { color: COLORS.card },

  cardTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: COLORS.muted, marginBottom: 20 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.text, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: COLORS.text },
  eyeBtn: { padding: 4 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    gap: 6,
  },
  errorText: { fontSize: 13, color: COLORS.error, flex: 1 },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  switchHint: { textAlign: "center", fontSize: 13, color: COLORS.primary, fontWeight: "500" },
});
