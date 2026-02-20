import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  RefreshControl, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../src/constants/theme';
import { useScan } from '../../src/context/ScanContext';
import LentCountdown from '../../src/components/LentCountdown';
import ScanHistoryTile from '../../src/components/ScanHistoryTile';

function ActionCard({ iconName, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={iconName} size={32} color={colors.gold} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { history, loadHistory, scanBarcode } = useScan();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleHistoryTap = async (entry) => {
    await scanBarcode(entry.barcode);
    router.push('/scan-result');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        <Text style={[typography.headlineLarge, { marginBottom: 20 }]}>LentScanner</Text>

        <LentCountdown />

        <View style={styles.actions}>
          <ActionCard
            iconName="scan-outline"
            label="Scan Product"
            onPress={() => router.push('/scanner')}
          />
          <View style={{ width: 12 }} />
          <ActionCard
            iconName="restaurant-outline"
            label="Find Recipes"
            onPress={() => router.push('/recipes')}
          />
        </View>

        {history.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <Text style={[typography.titleLarge, { marginBottom: 12 }]}>Recent Scans</Text>
            <FlatList
              horizontal
              data={history}
              keyExtractor={(item, i) => item.barcode + i}
              renderItem={({ item }) => (
                <ScanHistoryTile
                  entry={item}
                  onPress={() => handleHistoryTap(item)}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  actionCard: {
    flex: 1,
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: colors.surface + 'CC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
