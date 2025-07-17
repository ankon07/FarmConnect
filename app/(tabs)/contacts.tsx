import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { findNearbyVets } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import SearchBar from "@/components/common/SearchBar";
import ContactListItem from "@/components/contacts/ContactListItem";
import { COLORS } from "@/constants/colors";
import { useLocation } from "@/context/LocationContext";
import { Phone } from "lucide-react-native";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterOptions = ["All", "Veterinarians", "Agriculture Officers"];

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
        setError("Failed to load contacts");
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      setError("An error occurred while loading contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCall = (phone: string) => {
    console.log(`Calling ${phone}`);
    // In a real app, we would use Linking to make a phone call
    // Linking.openURL(`tel:${phone}`);
  };

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
        title="Expert Contacts" 
        showBackButton={false}
        showLocation={true}
        location={location?.name || "Loading location..."}
      />
      
      <View style={styles.searchContainer}>
        <SearchBar 
          placeholder="Search contacts..."
          onSearch={handleSearch}
          value={searchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              filter === option && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(option)}
          >
            <Text
              style={[
                styles.filterText,
                filter === option && styles.activeFilterText,
              ]}
            >
              {option}
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
          <Text style={styles.emptyText}>No contacts found</Text>
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
      
      <View style={styles.emergencyContainer}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => handleCall("911")}
        >
          <Phone size={20} color={COLORS.white} />
          <Text style={styles.emergencyText}>Emergency Helpline</Text>
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
  searchContainer: {
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
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emergencyContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  emergencyButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emergencyText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});