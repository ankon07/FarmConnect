import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { COLORS } from "@/constants/colors";
import { Phone } from "lucide-react-native";
import { useTranslatedText } from "@/hooks/useTranslation";

type ContactListItemProps = {
  name: string;
  title: string;
  location: string;
  imageUrl: string;
  onCall: () => void;
};

const ContactListItem: React.FC<ContactListItemProps> = ({
  name,
  title,
  location,
  imageUrl,
  onCall,
}) => {
  const { translatedText: translatedTitle } = useTranslatedText(title);
  const { translatedText: translatedLocation } = useTranslatedText(location);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.title}>{translatedTitle}</Text>
        <Text style={styles.location}>{translatedLocation}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.callButton}
        onPress={onCall}
      >
        <Phone size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ContactListItem;
