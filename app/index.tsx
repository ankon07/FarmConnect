import { Redirect } from "expo-router";
import { useUser } from "@/context/UserContext";
import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/colors";

export default function Index() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
