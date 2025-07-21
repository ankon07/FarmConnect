import React, { useState, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
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
  Alert,
} from "react-native";
import { useUser } from "@/context/UserContext";
import { sendPhoneVerification, verifyPhoneCode, signInWithGoogle, signInWithFacebook } from "@/services/authService";
import { createUserProfile } from "@/services/userService";
import PrimaryButton from "@/components/common/PrimaryButton";
import { useTranslation } from "@/hooks/useTranslation";
import { COLORS } from "@/constants/colors";
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/config/firebase";
import { Phone } from "lucide-react-native";

export default function PhoneVerificationScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  const initializeRecaptcha = () => {
    if (!recaptchaVerifier.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      initializeRecaptcha();
      if (recaptchaVerifier.current) {
        await sendPhoneVerification(phoneNumber, recaptchaVerifier.current);
        setIsCodeSent(true);
        Alert.alert("Success", "Verification code sent to your phone");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const firebaseUser = await verifyPhoneCode(verificationCode);
      if (firebaseUser) {
        const appUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.phoneNumber || "",
          username: firebaseUser.phoneNumber || "",
          email: firebaseUser.email || "",
          imageUrl: firebaseUser.photoURL || undefined,
          location: undefined,
        };

        // Store user profile in Firestore
        await createUserProfile(firebaseUser.uid, {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.phoneNumber || "",
          username: firebaseUser.phoneNumber || "",
          email: firebaseUser.email || "",
        });

        setUser(appUser);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Phone Verification</Text>
          <Text style={styles.headerSubtitle}>
            {isCodeSent 
              ? "Enter the verification code sent to your phone"
              : "Enter your phone number to receive a verification code"
            }
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!isCodeSent ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+1234567890"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="123456"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          )}

          <PrimaryButton
            title={isCodeSent ? "Verify Code" : "Send Code"}
            onPress={isCodeSent ? handleVerifyCode : handleSendCode}
            isLoading={isLoading}
            variant="primary"
          />

          {isCodeSent && (
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          )}

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
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
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, styles.phoneButton]}
            onPress={() => setIsCodeSent(false)}
            disabled={isLoading}
          >
            <View style={styles.oauthButtonContent}>
              <Phone size={20} color="#FFFFFF" style={styles.phoneIcon} />
              <Text style={[styles.oauthButtonText, styles.phoneButtonText]}>Continue with Phone</Text>
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
              <Text style={[styles.oauthButtonText, styles.facebookButtonText]}>Continue with Facebook</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.backContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hidden reCAPTCHA container */}
        <View id="recaptcha-container" style={styles.recaptchaContainer} />
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
    textAlign: "center",
  },
  resendButton: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  backContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  backLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  recaptchaContainer: {
    height: 0,
    overflow: "hidden",
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
