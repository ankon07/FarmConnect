import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
import { fetchMarketPrices } from "@/services/api";
import { getShwapnoProducts, searchShwapnoProducts, ShwapnoProduct } from "@/services/shwapnoApi";
import AppHeader from "@/components/common/AppHeader";
import TabView from "@/components/common/TabView";
import SearchBar from "@/components/common/SearchBar";
import FilterDropdown from "@/components/common/FilterDropdown";
import PriceListItem from "@/components/prices/PriceListItem";
import ShwapnoProductItem from "@/components/prices/ShwapnoProductItem";
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
  const [shwapnoProducts, setShwapnoProducts] = useState<ShwapnoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ["Crop", "Livestock", "Fish", "Shwapno"];
  const filterOptions = ["All", "Wholesale", "Retail", "Nearby"];

  useEffect(() => {
    loadData();
  }, [activeTab, filter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === "Shwapno") {
        const products = await getShwapnoProducts();
        setShwapnoProducts(products);
      } else {
        const response = await fetchMarketPrices({
          category: activeTab.toLowerCase(),
          filter: filter.toLowerCase(),
        });
        
        if (response.success) {
          setPrices(response.data);
        } else {
          setError("Failed to load market prices");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (activeTab === "Shwapno" && query.trim()) {
      setLoading(true);
      try {
        const searchResults = await searchShwapnoProducts(query);
        setShwapnoProducts(searchResults);
      } catch (error) {
        console.error("Error searching Shwapno products:", error);
      } finally {
        setLoading(false);
      }
    } else if (activeTab === "Shwapno" && !query.trim()) {
      // Reset to all products when search is cleared
      loadData();
    }
  };

  const filteredPrices = prices.filter(item => 
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShwapnoProducts = shwapnoProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPriceItem = ({ item }: { item: PriceItem }) => (
    <PriceListItem
      itemName={item.itemName}
      itemPrice={item.price}
      itemUnit={item.unit}
      marketName={item.marketName}
      distance={item.distance}
    />
  );

  const renderShwapnoItem = ({ item }: { item: ShwapnoProduct }) => (
    <ShwapnoProductItem
      product={item}
      onPress={() => {
        // Handle product press - could navigate to product details
        console.log("Product pressed:", item.name);
      }}
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
      ) : activeTab === "Shwapno" ? (
        filteredShwapnoProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredShwapnoProducts}
            renderItem={renderShwapnoItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : filteredPrices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No prices found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPrices}
          renderItem={renderPriceItem}
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
