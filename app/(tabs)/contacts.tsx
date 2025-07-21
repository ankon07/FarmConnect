import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert, Linking, ScrollView } from "react-native";
import { findNearbyVets } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import SearchBar from "@/components/common/SearchBar";
import ContactListItem from "@/components/contacts/ContactListItem";
import RegionalOfficerItem from "@/components/contacts/RegionalOfficerItem";
import LocationInput from "@/components/contacts/LocationInput";
import { useTranslation } from "@/hooks/useTranslation";
import { COLORS } from "@/constants/colors";
import { useLocation } from "@/context/LocationContext";
import { Phone, Users, Building2 } from "lucide-react-native";
import { findOfficersByLocation, getAllOfficers, Officer, initializeOfficerData } from "@/services/officerService";

interface Contact {
  id: string;
  name: string;
  title: string;
  location: string;
  imageUrl: string;
  phone: string;
}

export default function ContactsScreen() {
  const { location } = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Regional Officer states
  const [activeTab, setActiveTab] = useState<"experts" | "officers">("experts");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [regionalOfficers, setRegionalOfficers] = useState<Officer[]>([]);
  const [officersLoading, setOfficersLoading] = useState(false);

  const getFilterOptions = () => [
    { key: "All", label: t("all") },
    { key: "Veterinarians", label: t("veterinarians") },
    { key: "Agriculture Officers", label: t("agriculture-officers") },
    { key: "Equipment Suppliers", label: t("equipment-suppliers") }
  ];

  useEffect(() => {
    loadContacts();
  }, [location, filter]);

  const loadContacts = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await findNearbyVets({
        latitude: location.latitude,
        longitude: location.longitude,
        filter: filter === "All" ? null : filter.toLowerCase(),
      });
      
      if (response.success) {
        setContacts(response.data);
      } else {
        setError(t("failed-load-contacts"));
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      setError(t("error-loading-contacts"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
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

  const handleEmergencyCall = () => {
    const emergencyNumber = '01315206061';
    Alert.alert(
      t("emergency-helpline"),
      `${t("emergency-call-confirm")}\n${emergencyNumber}`,
      [
        {
          text: t("cancel"),
          style: 'cancel',
        },
        {
          text: t("call-now"),
          style: 'default',
          onPress: () => handleCall(emergencyNumber),
        },
      ]
    );
  };

  const handleLocationSelect = (locationInput: string) => {
    setSelectedLocation(locationInput);
    setOfficersLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      if (locationInput.trim()) {
        const officers = findOfficersByLocation(locationInput);
        setRegionalOfficers(officers);
      } else {
        setRegionalOfficers(getAllOfficers());
      }
      setOfficersLoading(false);
    }, 500);
  };

  const renderOfficerItem = ({ item }: { item: Officer }) => (
    <RegionalOfficerItem officer={item} />
  );

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Contact }) => (
    <ContactListItem
      name={item.name}
      title={item.title}
      location={item.location}
      imageUrl={item.imageUrl}
      onCall={() => handleCall(item.phone)}
    />
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title={t("expert-contacts")} 
        showBackButton={false}
        showLocation={true}
        location={location?.name || t("loading-location")}
      />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "experts" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("experts")}
        >
          <Users size={20} color={activeTab === "experts" ? COLORS.white : COLORS.textSecondary} />
          <Text
            style={[
              styles.tabText,
              activeTab === "experts" && styles.activeTabText,
            ]}
          >
            {t("expert-contacts")}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "officers" && styles.activeTabButton,
          ]}
          onPress={() => {
            setActiveTab("officers");
            // Initialize officer data when first accessing the officers tab
            if (regionalOfficers.length === 0) {
              initializeOfficerData();
            }
          }}
        >
          <Building2 size={20} color={activeTab === "officers" ? COLORS.white : COLORS.textSecondary} />
          <Text
            style={[
              styles.tabText,
              activeTab === "officers" && styles.activeTabText,
            ]}
          >
            {t("regional-officers")}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "experts" ? (
        <>
          <View style={styles.searchContainer}>
            <SearchBar 
              placeholder={t("search-contacts")}
              onSearch={handleSearch}
              value={searchQuery}
            />
          </View>
          
          <View style={styles.filterContainer}>
            {getFilterOptions().map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterButton,
                  filter === option.key && styles.activeFilterButton,
                ]}
                onPress={() => setFilter(option.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === option.key && styles.activeFilterText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : filteredContacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("no-contacts-found")}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredContacts}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <>
          <View style={styles.officerSearchContainer}>
            <LocationInput
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </View>
          
          {officersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>{t("finding-officers")}</Text>
            </View>
          ) : regionalOfficers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Building2 size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                {selectedLocation ? t("no-officers-found-location") : t("enter-location-find-officers")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={regionalOfficers}
              renderItem={renderOfficerItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
      
      <View style={styles.emergencyContainer}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
        >
          <View style={styles.emergencyContent}>
            <Phone size={20} color={COLORS.white} />
            <Text style={styles.emergencyText}>{t("emergency-helpline")}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 4,
    backgroundColor: COLORS.lightBackground,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: COLORS.lightGray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginLeft: 6,
    textAlign: "center",
    flexShrink: 1,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  searchContainer: {
    padding: 16,
  },
  officerSearchContainer: {
    padding: 16,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.lightBackground,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  activeFilterText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
  emergencyContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 16,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  emergencyText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emergencyNumber: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
    textAlign: "center",
  },
});
