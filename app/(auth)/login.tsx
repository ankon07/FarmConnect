import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useUser } from "@/context/UserContext";
import { loginUser } from "@/services/api";
import PrimaryButton from "@/components/common/PrimaryButton";
import { COLORS } from "@/constants/colors";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser(username, password);
      if (response.success && response.data) {
        setUser(response.data);
        router.replace("/(tabs)");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" }}
            style={styles.logo}
          />
          <Text style={styles.appName}>FarmConnect</Text>
          <Text style={styles.tagline}>Your smart farming companion</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>

          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            isLoading={isLoading}
            variant="primary"
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});