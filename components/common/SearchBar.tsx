import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { Search } from "lucide-react-native";

type SearchBarProps = {
  placeholder: string;
  value: string;
  onSearch: (text: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onSearch,
}) => {
  return (
    <View style={styles.container}>
      <Search size={20} color={COLORS.textSecondary} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onSearch}
        placeholderTextColor="#333333" // Darker grey for placeholder
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    zIndex: 1, // Ensure the search bar is on top
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#000000", // Explicitly black for input text
    backgroundColor: 'transparent', // Make input background transparent
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
});

export default SearchBar;
