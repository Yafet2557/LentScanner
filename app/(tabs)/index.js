import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../src/constants/theme';
import { useScan } from '../../src/context/ScanContext';
import LentCountdown from '../../src/components/LentCountdown';
import ScanHistoryTile from '../../src/components/ScanHistoryTile';

function ActionCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { history, loadHistory } = useScan();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[typography.headlineLarge, { marginBottom: 20 }]}>LentScanner</Text>

        <LentCountdown />

        <View style={styles.actions}>
          <ActionCard
            icon="📷"
            label="Scan Product"
            onPress={() => router.push('/scanner')}
          />
          <View style={{ width: 12 }} />
          <ActionCard
            icon="🍽️"
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
              renderItem={({ item }) => <ScanHistoryTile entry={item} />}
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
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
