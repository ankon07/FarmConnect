import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { getFertilizerStock } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import StatusIndicator from "@/components/common/StatusIndicator";
import { COLORS } from "@/constants/colors";
import { useLocation } from "@/context/LocationContext";
import { Bell } from "lucide-react-native";

interface Product {
  id: string;
  name: string;
  available: boolean;
  quantity: number;
  unit: string;
}

interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
  inStock: boolean;
  products: Product[];
}

export default function FertilizerStockScreen() {
  const { location } = useLocation();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribedStores, setSubscribedStores] = useState<string[]>([]);

  useEffect(() => {
    loadStores();
  }, [location]);

  const loadStores = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFertilizerStock({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (response.success) {
        setStores(response.data);
      } else {
        setError("Failed to load fertilizer stock information");
      }
    } catch (error) {
      console.error("Error loading fertilizer stock:", error);
      setError("An error occurred while loading stock information");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = (storeId: string) => {
    if (subscribedStores.includes(storeId)) {
      setSubscribedStores(subscribedStores.filter(id => id !== storeId));
    } else {
      setSubscribedStores([...subscribedStores, storeId]);
    }
  };

  const renderItem = ({ item }: { item: Store }) => (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <Text style={styles.storeName}>{item.name}</Text>
        <StatusIndicator 
          text={item.inStock ? "In Stock" : "Out of Stock"} 
          color={item.inStock ? COLORS.success : COLORS.error}
        />
      </View>
      
      <View style={styles.storeDetails}>
        <Text style={styles.storeAddress}>{item.address}</Text>
        <Text style={styles.storeDistance}>{item.distance} km away</Text>
      </View>
      
      <View style={styles.stockDetails}>
        {item.products.map((product: Product) => (
          <View key={product.id} style={styles.productRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productStock}>
              {product.available ? `${product.quantity} ${product.unit} available` : "Out of stock"}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.subscribeButton,
          subscribedStores.includes(item.id) && styles.subscribedButton,
        ]}
        onPress={() => toggleSubscription(item.id)}
      >
        <Bell size={16} color={subscribedStores.includes(item.id) ? COLORS.white : COLORS.primary} />
        <Text
          style={[
            styles.subscribeText,
            subscribedStores.includes(item.id) && styles.subscribedText,
          ]}
        >
          {subscribedStores.includes(item.id) ? "Subscribed to Alerts" : "Subscribe to Stock Alerts"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Fertilizer Stock" 
        showBackButton={true}
        showLocation={true}
        location={location?.name || "Loading location..."}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No stores found in your area</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
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
  listContent: {
    padding: 16,
  },
  storeCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  storeDetails: {
    marginBottom: 16,
  },
  storeAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  storeDistance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  stockDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginBottom: 16,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  productStock: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  subscribedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subscribeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  subscribedText: {
    color: COLORS.white,
  },
});