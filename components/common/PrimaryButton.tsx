import React from "react";
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle, View } from "react-native";
import { COLORS } from "@/constants/colors";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const isPrimary = variant === "primary";
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? COLORS.white : COLORS.primary}
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.buttonText,
              isPrimary ? styles.primaryText : styles.secondaryText,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.lightGray,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default PrimaryButton;