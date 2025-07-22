import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BamisWeatherWidget } from '../components/weather/BamisWeatherWidget';
import { WeatherCaution } from '../services/bamisScrapingService';
import { COLORS } from '../constants/colors';

export default function BamisWeatherScreen() {
  const [selectedCaution, setSelectedCaution] = useState<WeatherCaution | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleNotificationPress = (caution: WeatherCaution) => {
    setSelectedCaution(caution);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCaution(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF1744';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return COLORS.primary;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'জরুরি';
      case 'high': return 'উচ্চ';
      case 'medium': return 'মাঝারি';
      case 'low': return 'নিম্ন';
      default: return 'সাধারণ';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'weather': return 'আবহাওয়া';
      case 'crop': return 'ফসল';
      case 'livestock': return 'পশুপাখি';
      case 'fisheries': return 'মৎস্য';
      default: return 'সাধারণ';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="cloud" size={24} color={COLORS.primary} />
          <Text style={styles.title}>BAMIS আবহাওয়া বুলেটিন</Text>
        </View>
      </View>

      {/* BAMIS Weather Widget */}
      <BamisWeatherWidget 
        onNotificationPress={handleNotificationPress}
      />

      {/* Caution Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCaution && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <Ionicons
                      name="warning"
                      size={24}
                      color={getSeverityColor(selectedCaution.severity)}
                    />
                    <Text style={styles.modalTitle}>{selectedCaution.title}</Text>
                  </View>
                  <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.cautionMeta}>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(selectedCaution.severity) }
                    ]}>
                      <Text style={styles.severityBadgeText}>
                        {getSeverityText(selectedCaution.severity)}
                      </Text>
                    </View>
                    <Text style={styles.categoryText}>
                      {getCategoryText(selectedCaution.category)}
                    </Text>
                    <Text style={styles.regionText}>
                      {selectedCaution.region}
                    </Text>
                  </View>

                  <Text style={styles.cautionDescription}>
                    {selectedCaution.description}
                  </Text>

                  <View style={styles.cautionFooter}>
                    <Text style={styles.issuedText}>
                      জারি: {selectedCaution.issuedAt.toLocaleDateString('bn-BD')}
                    </Text>
                    <Text style={styles.validText}>
                      বৈধ: {selectedCaution.validUntil.toLocaleDateString('bn-BD')} পর্যন্ত
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.primaryButtonText}>বুঝেছি</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  cautionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  severityBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
    backgroundColor: COLORS.lightBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  regionText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cautionDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  cautionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
    gap: 4,
  },
  issuedText: {
    fontSize: 12,
    color: '#666',
  },
  validText: {
    fontSize: 12,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
