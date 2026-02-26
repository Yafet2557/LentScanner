import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  RefreshControl, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../src/constants/theme';
import { useScan } from '../../src/context/ScanContext';
import { useRecipes } from '../../src/context/RecipeContext';
import LentCountdown from '../../src/components/LentCountdown';
import FastingRuleCard from '../../src/components/FastingRuleCard';
import RecipeCard from '../../src/components/RecipeCard';
import { getDailyTip } from '../../src/utils/fastingCalendar';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function StatCard({ iconName, value, label, color }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={iconName} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { history, loadHistory, scanBarcode } = useScan();
  const { favorites, popularRecipes, fetchPopular, isFavorite, toggleFavorite } = useRecipes();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
    if (popularRecipes.length === 0) {
      fetchPopular();
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleHistoryTap = async (entry) => {
    await scanBarcode(entry.barcode);
    router.push('/scan-result');
  };

  // Compute scan stats from history
  const stats = useMemo(() => {
    const total = history.length;
    const safe = history.filter((h) => h.verdict === 'safe').length;
    const flagged = history.filter((h) => h.verdict === 'notSafe').length;
    return { total, safe, flagged };
  }, [history]);

  // Pick a featured recipe (random from popular or favorites)
  const featuredRecipe = useMemo(() => {
    const pool = favorites.length > 0 ? favorites : popularRecipes;
    if (pool.length === 0) return null;
    // Use day of year as seed for consistent daily pick
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    return pool[dayOfYear % pool.length];
  }, [favorites, popularRecipes]);

  const tip = getDailyTip();

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
        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.dateText}>{formatToday()}</Text>

        {/* Today's Fasting Rule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Fasting Rule</Text>
          <FastingRuleCard />
        </View>

        {/* Fasting Period Progress */}
        <View style={styles.section}>
          <LentCountdown />
        </View>

        {/* Quick Stats */}
        {stats.total > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Scan Stats</Text>
            <View style={styles.statsRow}>
              <StatCard iconName="scan-outline" value={stats.total} label="Scanned" color={colors.gold} />
              <StatCard iconName="checkmark-circle-outline" value={stats.safe} label="Safe" color={colors.safe} />
              <StatCard iconName="close-circle-outline" value={stats.flagged} label="Flagged" color={colors.notSafe} />
            </View>
          </View>
        )}

        {/* Daily Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={18} color={colors.gold} />
              <Text style={styles.tipTitle}>Did You Know?</Text>
            </View>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        </View>

        {/* Featured Recipe */}
        {featuredRecipe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recipe of the Day</Text>
            <RecipeCard
              recipe={featuredRecipe}
              onPress={() => router.push(`/recipe-detail/${featuredRecipe.id}`)}
              isFavorite={isFavorite(featuredRecipe.id)}
              onToggleFavorite={() => toggleFavorite(featuredRecipe)}
            />
          </View>
        )}

        {/* Recent Scans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="scan-outline" size={36} color={colors.gold} />
              <Text style={styles.emptyTitle}>No scans yet</Text>
              <Text style={styles.emptySubtitle}>
                Scan a barcode to instantly check if a product is fasting safe
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/scanner')}
                activeOpacity={0.8}
              >
                <Ionicons name="scan-outline" size={16} color={colors.background} />
                <Text style={styles.emptyBtnText}>Scan a Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            history.slice(0, 5).map((entry, i) => (
              <TouchableOpacity
                key={entry.barcode + i}
                style={styles.scanRow}
                onPress={() => handleHistoryTap(entry)}
                activeOpacity={0.7}
              >
                <View style={[styles.verdictDot, {
                  backgroundColor: entry.verdict === 'safe' ? colors.safe
                    : entry.verdict === 'notSafe' ? colors.notSafe
                    : colors.caution,
                }]} />
                <View style={styles.scanInfo}>
                  <Text style={styles.scanName} numberOfLines={1}>{entry.productName}</Text>
                  <Text style={styles.scanDate}>
                    {new Date(entry.scannedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
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
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold + '33',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  verdictDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  scanInfo: {
    flex: 1,
  },
  scanName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  scanDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  emptyBtnText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
});
