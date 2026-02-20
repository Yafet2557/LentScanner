import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Dimensions, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../src/constants/theme';

const { width } = Dimensions.get('window');

const PAGES = [
  {
    icon: 'scan-outline',
    title: 'Scan Products',
    description: 'Scan any barcode to instantly check if a product is safe to eat during Orthodox Great Lent.',
  },
  {
    icon: 'restaurant-outline',
    title: 'Find Lenten Recipes',
    description: 'Discover delicious vegan recipes perfect for fasting. Filter by ingredients, meal type, and more.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef(null);

  const handleDone = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    router.replace('/');
  };

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1 });
    } else {
      handleDone();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentPage(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={56} color={colors.gold} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentPage && styles.dotActive]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {currentPage < PAGES.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.background} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { flex: 1 }]}
            onPress={handleDone}
          >
            <Text style={styles.nextBtnText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gold + '1A',
    borderWidth: 2,
    borderColor: colors.gold + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.gold,
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextBtnText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
