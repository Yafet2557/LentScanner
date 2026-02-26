import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { colors, typography } from "../../src/constants/theme";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const isSignUp = mode === "signup";

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    if (isSignUp) {
      const { data, error } = await signUp(email.trim(), password);
      if (error) {
        setError(error.message);
      } else if (!data.session) {
        // Email confirmation is required — session won't exist until user clicks the link
        setAwaitingConfirmation(true);
      }
      // If data.session exists (confirmation disabled), AuthContext handles navigation
    } else {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error.message);
      // On success, AuthContext updates session → _layout.js handles navigation
    }

    setLoading(false);
  }

  // "Check your email" screen shown after successful sign-up
  if (awaitingConfirmation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={36} color={colors.gold} />
          </View>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.confirmText}>
            We sent a confirmation link to{"\n"}
            <Text style={styles.confirmEmail}>{email}</Text>
          </Text>
          <Text style={styles.confirmHint}>
            Tap the link in the email to verify your account, then come back and sign in.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setAwaitingConfirmation(false);
              setMode("signin");
              setPassword("");
              setError(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Icon + title */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={36} color={colors.gold} />
          </View>
          <Text style={styles.title}>LentScanner</Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Create an account to sync your data"
              : "Sign in to sync your scans and favorites"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && (
            <View style={styles.errorRow}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={colors.notSafe}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => {
              setMode(isSignUp ? "signin" : "signup");
              setError(null);
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text style={styles.toggleLink}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    ...typography.headlineLarge,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMedium,
    textAlign: "center",
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    color: colors.notSafe,
    fontSize: 13,
    flex: 1,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },
  toggleRow: {
    alignItems: "center",
    paddingTop: 8,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  toggleLink: {
    color: colors.gold,
    fontWeight: "600",
  },
  confirmText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
  },
  confirmEmail: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  confirmHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
