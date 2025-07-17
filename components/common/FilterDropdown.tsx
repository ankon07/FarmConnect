import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, FlatList } from "react-native";
import { COLORS } from "@/constants/colors";
import { ChevronDown, Check } from "lucide-react-native";

type FilterDropdownProps = {
  label: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedOption,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>{selectedOption}</Text>
        <ChevronDown size={16} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {selectedOption === item && (
                    <Check size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 100,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default FilterDropdown;