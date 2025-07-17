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
        placeholderTextColor={COLORS.textSecondary}
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
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default SearchBar;