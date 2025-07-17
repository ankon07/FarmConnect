import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
import { fetchMarketPrices } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import TabView from "@/components/common/TabView";
import SearchBar from "@/components/common/SearchBar";
import FilterDropdown from "@/components/common/FilterDropdown";
import PriceListItem from "@/components/prices/PriceListItem";
import { COLORS } from "@/constants/colors";

interface PriceItem {
  id: string;
  itemName: string;
  price: string;
  unit: string;
  marketName: string;
  distance: string;
}

export default function PricesScreen() {
  const [activeTab, setActiveTab] = useState("Crop");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ["Crop", "Livestock", "Fish"];
  const filterOptions = ["All", "Wholesale", "Retail", "Nearby"];

  useEffect(() => {
    loadPrices();
  }, [activeTab, filter]);

  const loadPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchMarketPrices({
        category: activeTab.toLowerCase(),
        filter: filter.toLowerCase(),
      });
      
      if (response.success) {
        setPrices(response.data);
      } else {
        setError("Failed to load market prices");
      }
    } catch (error) {
      console.error("Error loading prices:", error);
      setError("An error occurred while loading prices");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredPrices = prices.filter(item => 
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: PriceItem }) => (
    <PriceListItem
      itemName={item.itemName}
      itemPrice={item.price}
      itemUnit={item.unit}
      marketName={item.marketName}
      distance={item.distance}
    />
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Market Prices" 
        showBackButton={true}
      />
      
      <TabView 
        tabs={tabs} 
        activeTab={activeTab} 
        onChangeTab={setActiveTab}
      />
      
      <View style={styles.filterContainer}>
        <SearchBar 
          placeholder={`Search ${activeTab.toLowerCase()} prices...`}
          onSearch={handleSearch}
          value={searchQuery}
        />
        
        <FilterDropdown 
          label="Filter"
          options={filterOptions}
          selectedOption={filter}
          onSelect={setFilter}
        />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredPrices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No prices found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPrices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    alignItems: "center",
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
});