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
import { registerUser, signInWithGoogle, signInWithFacebook } from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import PrimaryButton from "@/components/common/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { Phone } from "lucide-react-native";

export default function SignupScreen() {
  // Keeping name for potential display name
  const [name, setName] = useState("");
  // Changed from username to email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const firebaseUser = await registerUser(email, password);
      if (firebaseUser) {
        const appUser = {
          id: firebaseUser.uid,
          name: name || firebaseUser.email || "",
          username: firebaseUser.email || "",
          email: firebaseUser.email || "",
          imageUrl: firebaseUser.photoURL || undefined,
          location: undefined,
        };
        // Store user profile in Firestore
        await createUserProfile(firebaseUser.uid, {
          id: firebaseUser.uid,
          name: name || firebaseUser.email || "",
          username: firebaseUser.email || "",
          email: firebaseUser.email || "",
        });
        setUser(appUser);
        router.replace("/(tabs)");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const firebaseUser = await signInWithGoogle();
      if (firebaseUser) {
        const appUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "",
          username: firebaseUser.email || "",
          email: firebaseUser.email || "",
          imageUrl: firebaseUser.photoURL || undefined,
          location: undefined,
        };

        // Store user profile in Firestore
        await createUserProfile(firebaseUser.uid, {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "",
          username: firebaseUser.email || "",
          email: firebaseUser.email || "",
        });

        setUser(appUser);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-up failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const firebaseUser = await signInWithFacebook();
      if (firebaseUser) {
        const appUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "",
          username: firebaseUser.email || "",
          email: firebaseUser.email || "",
          imageUrl: firebaseUser.photoURL || undefined,
          location: undefined,
        };

        // Store user profile in Firestore
        await createUserProfile(firebaseUser.uid, {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || "",
          username: firebaseUser.email || "",
          email: firebaseUser.email || "",
        });

        setUser(appUser);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || "Facebook sign-up failed");
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
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Join FarmConnect to access all farming tools
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text> {/* Changed label */}
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email" // Changed placeholder
              keyboardType="email-address" // Added keyboardType
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>

          <PrimaryButton
            title="Sign Up"
            onPress={handleSignup}
            isLoading={isLoading}
            variant="primary"
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleGoogleSignUp}
            disabled={isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <Image
                source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, styles.phoneButton]}
            onPress={() => router.push("/phone-verification")}
            disabled={isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <Phone size={20} color="#FFFFFF" style={styles.phoneIcon} />
              <Text style={[styles.oauthButtonText, styles.phoneButtonText]}>Continue with Phone</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, styles.facebookButton]}
            onPress={handleFacebookSignUp}
            disabled={isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <Image
                source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" }}
                style={styles.oauthIcon}
              />
              <Text style={[styles.oauthButtonText, styles.facebookButtonText]}>Continue with Facebook</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Login</Text>
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
    padding: 20,
  },
  headerContainer: {
    marginTop: 60,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  loginLink: {
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
