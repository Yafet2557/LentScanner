import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../src/constants/theme';
import { useScan } from '../src/context/ScanContext';
import VerdictBanner from '../src/components/VerdictBanner';
import IngredientChip from '../src/components/IngredientChip';

export default function ScanResultScreen() {
  const router = useRouter();
  const { currentProduct, currentResult, isLoading, error, clearCurrentScan } = useScan();

  const goHome = () => { clearCurrentScan(); router.replace('/'); };
  const scanAgain = () => { clearCurrentScan(); router.replace('/scanner'); };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ color: colors.gold, fontSize: 16 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ fontSize: 48, marginBottom: 20 }}>⚠️</Text>
        <Text style={[typography.bodyLarge, { textAlign: 'center', marginBottom: 32 }]}>{error}</Text>
        <TouchableOpacity style={styles.btn} onPress={scanAgain}>
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnOutline, { marginTop: 12 }]} onPress={goHome}>
          <Text style={styles.btnOutlineText}>Go Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!currentProduct || !currentResult) {
    return (
      <SafeAreaView style={styles.centered}>
        <TouchableOpacity style={styles.btn} onPress={goHome}>
          <Text style={styles.btnText}>Go Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { currentProduct: product, currentResult: result } = { currentProduct, currentResult };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goHome}>
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VerdictBanner verdict={currentResult.verdict} />

        {/* Product info card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row' }}>
            {currentProduct.imageUrl && (
              <Image
                source={{ uri: currentProduct.imageUrl }}
                style={styles.productImage}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={typography.titleLarge}>
                {currentProduct.name || 'Unknown Product'}
              </Text>
              <Text style={[typography.bodySmall, { marginTop: 4 }]}>
                Barcode: {currentProduct.barcode}
              </Text>
            </View>
          </View>
        </View>

        {/* Flagged ingredients */}
        {currentResult.flaggedIngredients.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={typography.titleMedium}>Non-Fasting Ingredients Found</Text>
            <View style={styles.chips}>
              {currentResult.flaggedIngredients.map((fi, i) => (
                <IngredientChip key={i} label={fi.keyword} category={fi.category} />
              ))}
            </View>
          </View>
        )}

        {/* Ambiguous ingredients */}
        {currentResult.ambiguousIngredients.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={typography.titleMedium}>Ambiguous Ingredients</Text>
            <Text style={[typography.bodyMedium, { marginTop: 4 }]}>
              These may or may not be animal-derived — check with the manufacturer.
            </Text>
            <View style={styles.chips}>
              {currentResult.ambiguousIngredients.map((a, i) => (
                <IngredientChip key={i} label={a} />
              ))}
            </View>
          </View>
        )}

        {/* Full ingredient list */}
        {currentProduct.ingredientsText && (
          <View style={{ marginTop: 24 }}>
            <Text style={typography.titleMedium}>Ingredients</Text>
            <View style={styles.ingredientBox}>
              <Text style={typography.bodyMedium}>{currentProduct.ingredientsText}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={{ marginTop: 32 }}>
          {currentResult.verdict === 'safe' && (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.push('/recipes')}
            >
              <Text style={styles.btnText}>🍽️  Find Lenten Recipes</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.btnOutline, { marginTop: 12 }]} onPress={scanAgain}>
            <Text style={styles.btnOutlineText}>📷  Scan Another Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  scroll: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 16, marginTop: 24,
  },
  productImage: {
    width: 72, height: 72, borderRadius: 8, marginRight: 16,
  },
  chips: {
    flexDirection: 'row', flexWrap: 'wrap', marginTop: 10,
  },
  ingredientBox: {
    backgroundColor: colors.surfaceLight, borderRadius: 12,
    padding: 14, marginTop: 8,
  },
  btn: {
    backgroundColor: colors.gold, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  btnOutline: {
    borderWidth: 1, borderColor: colors.gold, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnOutlineText: { color: colors.gold, fontSize: 16, fontWeight: '600' },
});
