import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import { updateUserProfile, getUserProfile } from "@/services/userService";
import AppHeader from "@/components/common/AppHeader";
import PrimaryButton from "@/components/common/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { User } from "@/context/UserContext";
import { Camera, User as UserIcon } from "lucide-react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLocation(user.location || "");
      setImageUrl(user.imageUrl || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) {
      setError("User not logged in.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const updatedData: Partial<User> = {
        name,
        location,
        imageUrl,
      };
      await updateUserProfile(user.id, updatedData);

      // Fetch the updated profile to ensure consistency
      const fetchedUser = await getUserProfile(user.id);
      if (fetchedUser) {
        setUser(fetchedUser); // Update context with fresh data
      }

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <AppHeader title="Edit Profile" showBackButton={true} />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>Profile Picture</Text>
          <View style={styles.imageContainer}>
            <Image
              source={{ 
                uri: imageUrl || "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.imageButton}>
              <Camera size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <UserIcon size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              returnKeyType="next"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email || ""}
            placeholder="Email address"
            editable={false}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location (e.g., Dhaka, Bangladesh)"
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Profile Image URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Enter image URL (optional)"
            keyboardType="url"
            autoCapitalize="none"
            returnKeyType="done"
            multiline={true}
            numberOfLines={2}
          />
          <Text style={styles.helperText}>Paste a URL to your profile picture</Text>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Save Profile"
            onPress={handleSaveProfile}
            isLoading={isLoading}
            variant="primary"
          />
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
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  imageButton: {
    position: "absolute",
    bottom: 8,
    right: -10,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  disabledInput: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
});
