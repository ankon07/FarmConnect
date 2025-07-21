import React, { useState } from "react";
import { useRouter } from "expo-router";
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
import { loginUser, signInWithGoogle, signInWithFacebook } from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import PrimaryButton from "@/components/common/PrimaryButton";
import { useTranslation } from "@/hooks/useTranslation";
import { COLORS } from "@/constants/colors";
import { Phone } from "lucide-react-native";

export default function LoginScreen() {
  // Changed from username to email
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { setUser } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t("enter-both-credentials"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const firebaseUser = await loginUser(email, password);
      if (firebaseUser) {
        const appUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "",
          username: firebaseUser.email || "",
          email: firebaseUser.email || "",
          imageUrl: firebaseUser.photoURL || undefined,
          location: undefined,
        };
        setUser(appUser);
        router.replace("/(tabs)");
      } else {
        setError(t("login-failed"));
      }
    } catch (err: any) {
      setError(err.message || t("error-occurred"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      // This will never execute since signInWithGoogle always throws
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithFacebook();
      // This will never execute since signInWithFacebook always throws
    } catch (err: any) {
      setError(err.message || "Facebook sign-in failed");
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
          <Text style={styles.tagline}>{t("smart-farming-companion")}</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("email")}</Text> {/* Changed label */}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t("enter-email")} // Changed placeholder
              keyboardType="email-address" // Added keyboardType
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("password")}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t("enter-password")}
              secureTextEntry
            />
          </View>

          <PrimaryButton
            title={t("login")}
            onPress={handleLogin}
            isLoading={isLoading}
            variant="primary"
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t("or") || "OR"}</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <Image
                source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>{t("continue-with-google") || "Continue with Google"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, styles.phoneButton]}
            onPress={() => router.push("/phone-verification")}
            disabled={isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <Phone size={20} color="#FFFFFF" style={styles.phoneIcon} />
              <Text style={[styles.oauthButtonText, styles.phoneButtonText]}>{t("continue-with-phone") || "Continue with Phone"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, styles.facebookButton]}
            onPress={handleFacebookSignIn}
            disabled={isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <Image
                source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" }}
                style={styles.oauthIcon}
              />
              <Text style={[styles.oauthButtonText, styles.facebookButtonText]}>{t("continue-with-facebook") || "Continue with Facebook"}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>{t("dont-have-account")}</Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signupLink}>{t("sign-up")}</Text>
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  oauthButton: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  facebookButton: {
    backgroundColor: "#1877F2",
    borderColor: "#1877F2",
  },
  facebookButtonText: {
    color: "#FFFFFF",
  },
  phoneButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  oauthButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  oauthIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  phoneIcon: {
    marginRight: 12,
  },
  phoneButtonText: {
    color: "#FFFFFF",
  },
});
