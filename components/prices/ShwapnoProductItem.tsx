import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { COLORS } from "@/constants/colors";
import { ShwapnoProduct } from "@/services/shwapnoApi";
import StatusIndicator from "@/components/common/StatusIndicator";

interface ShwapnoProductItemProps {
  product: ShwapnoProduct;
  onPress?: () => void;
}

const ShwapnoProductItem: React.FC<ShwapnoProductItemProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.image}
          onError={() => {
            // Handle image load error
            console.log('Failed to load product image');
          }}
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <StatusIndicator 
            text={product.inStock ? "In Stock" : "Out of Stock"} 
            color={product.inStock ? COLORS.success : COLORS.error}
          />
        </View>
        
        <Text style={styles.category}>{product.category}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>৳{product.price}</Text>
          <Text style={styles.unit}>{product.unit}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.delivery}>🚚 {product.delivery}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: COLORS.background,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 4,
  },
  unit: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  delivery: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ShwapnoProductItem;
