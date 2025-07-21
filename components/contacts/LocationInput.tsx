import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from "react-native";
import { COLORS } from "@/constants/colors";
import { MapPin, Search } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";
import { getRegionalOffices } from "@/services/officerService";

type LocationInputProps = {
  onLocationSelect: (location: string) => void;
  selectedLocation: string;
};

const LocationInput: React.FC<LocationInputProps> = ({ onLocationSelect, selectedLocation }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(selectedLocation);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Get all districts from regional offices
  const allDistricts = getRegionalOffices().flatMap(office => office.districts);
  const uniqueDistricts = [...new Set(allDistricts)].sort();

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    if (text.length > 0) {
      const filteredSuggestions = uniqueDistricts.filter(district =>
        district.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (district: string) => {
    setInputValue(district);
    setShowSuggestions(false);
    onLocationSelect(district);
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    onLocationSelect(inputValue);
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <MapPin size={16} color={COLORS.textSecondary} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("find-officers-by-location")}</Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.searchContainer}>
          <MapPin size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder={t("enter-district-name")}
            value={inputValue}
            onChangeText={handleInputChange}
            onFocus={() => {
              if (inputValue.length > 0) {
                handleInputChange(inputValue);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow for selection
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Search size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>
      
      <Text style={styles.hint}>
        {t("location-search-hint")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    position: "relative",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: COLORS.lightGray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default LocationInput;
