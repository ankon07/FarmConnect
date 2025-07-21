import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Linking, Alert } from "react-native";
import { COLORS } from "@/constants/colors";
import { Phone, Mail, MapPin } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";
import { Officer } from "@/services/officerService";

type RegionalOfficerItemProps = {
  officer: Officer;
};

const RegionalOfficerItem: React.FC<RegionalOfficerItemProps> = ({ officer }) => {
  const { t } = useTranslation();

  const handleCall = () => {
    if (!officer.phone) return;
    
    const phoneUrl = `tel:${officer.phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert(t("error"), t("phone-not-supported"));
        }
      })
      .catch((error) => {
        console.error('Error opening phone app:', error);
        Alert.alert(t("error"), t("unable-open-phone"));
      });
  };

  const handleEmail = () => {
    if (!officer.email) return;
    
    const emailUrl = `mailto:${officer.email}`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          Alert.alert(t("error"), t("email-not-supported"));
        }
      })
      .catch((error) => {
        console.error('Error opening email app:', error);
        Alert.alert(t("error"), t("unable-open-email"));
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: officer.imageUrl || 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=DAE' }}
          style={styles.image}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{officer.name}</Text>
          <Text style={styles.designation}>{officer.designation}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={COLORS.textSecondary} />
            <Text style={styles.location}>{officer.office}</Text>
          </View>
          <Text style={styles.region}>{officer.region} Region</Text>
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        {officer.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}
          >
            <Phone size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>{t("call")}</Text>
          </TouchableOpacity>
        )}
        
        {officer.email && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEmail}
          >
            <Mail size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>{t("email")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.lightGray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    marginBottom: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  designation: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  region: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "500",
    backgroundColor: COLORS.lightBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.lightBackground,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  actionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default RegionalOfficerItem;
