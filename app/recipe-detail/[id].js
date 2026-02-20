import React, { useEffect } from 'react';
import {
  View, Text, Image, ScrollView, ActivityIndicator,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../src/constants/theme';
import { useRecipes } from '../../src/context/RecipeContext';

function MetaBadge({ iconName, label }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={iconName} size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function MacroCard({ label, value, unit }) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroUnit}>{unit}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function IngredientRow({ text, isLast }) {
  return (
    <View>
      <View style={styles.ingredientRow}>
        <Ionicons name="ellipse" size={6} color={colors.gold} style={{ marginRight: 12, marginTop: 6 }} />
        <Text style={[typography.bodyLarge, { flex: 1 }]}>{text}</Text>
      </View>
      {!isLast && <View style={styles.divider} />}
    </View>
  );
}

function StepRow({ step, text }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepNumber}>{step}</Text>
      </View>
      <Text style={[typography.bodyLarge, { flex: 1, paddingTop: 4 }]}>{text}</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { recipeDetail, isLoadingDetail, error, loadRecipeDetail, clearRecipeDetail } = useRecipes();

  useEffect(() => {
    if (id) loadRecipeDetail(Number(id));
    return () => clearRecipeDetail();
  }, [id]);

  if (isLoadingDetail) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.gold} />
      </SafeAreaView>
    );
  }

  if (error && !recipeDetail) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={[typography.bodyLarge, { textAlign: 'center' }]}>{error}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!recipeDetail) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={typography.bodyLarge}>Recipe not found.</Text>
      </SafeAreaView>
    );
  }

  const d = recipeDetail;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        {/* Hero image */}
        {d.imageUrl && (
          <Image source={{ uri: d.imageUrl }} style={styles.heroImage} />
        )}

        {/* Back button overlay */}
        <SafeAreaView style={styles.backOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="arrow-back" size={18} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>Back</Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.content}>
          <Text style={typography.headlineMedium}>{d.title}</Text>

          {/* Meta badges */}
          <View style={styles.badges}>
            {d.readyInMinutes != null && (
              <MetaBadge iconName="timer-outline" label={`${d.readyInMinutes} min`} />
            )}
            {d.servings != null && (
              <MetaBadge iconName="people-outline" label={`${d.servings} servings`} />
            )}
          </View>

          {/* Nutrition grid */}
          {(d.calories || d.proteinGrams || d.carbsGrams || d.fatGrams) && (
            <View style={{ marginTop: 28 }}>
              <Text style={typography.titleMedium}>Nutrition</Text>
              <View style={styles.macroRow}>
                {d.calories != null && (
                  <MacroCard label="Calories" value={Math.round(d.calories)} unit="kcal" />
                )}
                {d.proteinGrams != null && (
                  <MacroCard label="Protein" value={Math.round(d.proteinGrams)} unit="g" />
                )}
                {d.carbsGrams != null && (
                  <MacroCard label="Carbs" value={Math.round(d.carbsGrams)} unit="g" />
                )}
                {d.fatGrams != null && (
                  <MacroCard label="Fat" value={Math.round(d.fatGrams)} unit="g" />
                )}
              </View>
            </View>
          )}

          {/* Ingredients */}
          {d.ingredients.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <Text style={typography.titleMedium}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {d.ingredients.map((ing, i) => (
                  <IngredientRow
                    key={i}
                    text={ing}
                    isLast={i === d.ingredients.length - 1}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {d.instructions.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <Text style={typography.titleMedium}>Instructions</Text>
              <View style={{ marginTop: 12 }}>
                {d.instructions.map((text, i) => (
                  <StepRow key={i} step={i + 1} text={text} />
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  btn: {
    backgroundColor: colors.gold, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 20,
  },
  btnText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  heroImage: { width: '100%', height: 260 },
  backOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
  },
  backBtn: {
    marginLeft: 16, marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  content: { padding: 20 },
  badges: { flexDirection: 'row', gap: 10, marginTop: 12 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  badgeText: { fontSize: 14, color: colors.textSecondary },
  macroRow: {
    flexDirection: 'row', marginTop: 12, gap: 8,
  },
  macroCard: {
    flex: 1, backgroundColor: colors.surfaceLight, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  macroValue: { fontSize: 20, fontWeight: '700', color: colors.gold },
  macroUnit: { fontSize: 11, color: colors.textMuted },
  macroLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  ingredientsList: {
    backgroundColor: colors.surface, borderRadius: 12, marginTop: 12,
  },
  ingredientRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
  },
  divider: { height: 1, backgroundColor: colors.surfaceLight, marginLeft: 16 },
  stepRow: {
    flexDirection: 'row', marginBottom: 20,
  },
  stepCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  stepNumber: {
    color: colors.background, fontSize: 13, fontWeight: '700',
  },
});
