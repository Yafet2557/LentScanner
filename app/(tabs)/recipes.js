import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch, ScrollView,
  FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../src/constants/theme';
import { useRecipes } from '../../src/context/RecipeContext';
import IngredientChip from '../../src/components/IngredientChip';
import RecipeCard from '../../src/components/RecipeCard';
import SkeletonCard from '../../src/components/SkeletonCard';

const CATEGORIES = [
  { key: null, label: 'Popular', icon: 'flame-outline' },
  { key: 'quick', label: 'Quick', icon: 'timer-outline' },
  { key: 'high-protein', label: 'High Protein', icon: 'barbell-outline' },
  { key: 'soup', label: 'Soups', icon: 'water-outline' },
  { key: 'dessert', label: 'Desserts', icon: 'ice-cream-outline' },
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
];

const MEAL_TYPES = [
  { label: 'Any meal type', value: null },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

const COOK_TIMES = [
  { label: 'Any cook time', value: null },
  { label: 'Under 15 minutes', value: 15 },
  { label: 'Under 30 minutes', value: 30 },
  { label: 'Under 1 hour', value: 60 },
];

function DropdownSelect({ items, selectedValue, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.value === selectedValue);

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !selected?.value && { color: colors.textMuted }]}>
          {selected?.label || placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownMenu}>
          {items.map((item) => (
            <TouchableOpacity
              key={String(item.value)}
              style={[
                styles.dropdownItem,
                item.value === selectedValue && styles.dropdownItemActive,
              ]}
              onPress={() => { onSelect(item.value); setOpen(false); }}
            >
              <Text style={[
                styles.dropdownItemText,
                item.value === selectedValue && { color: colors.gold },
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function RecipesScreen() {
  const router = useRouter();
  const {
    ingredients, highProtein, mealType, maxReadyTime,
    recipes, popularRecipes, isLoadingPopular, selectedCategory,
    isLoading, error, favorites,
    addIngredient, removeIngredient, clearIngredients,
    toggleHighProtein, setMealType, setMaxReadyTime,
    searchRecipes, fetchPopular, clearSearch,
    toggleFavorite, isFavorite,
  } = useRecipes();

  const [inputText, setInputText] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Fetch popular recipes on first load
  useEffect(() => {
    if (popularRecipes.length === 0 && !isLoadingPopular) {
      fetchPopular();
    }
  }, []);

  const handleAdd = () => {
    if (inputText.trim()) {
      addIngredient(inputText);
      setInputText('');
    }
  };

  const handleCategoryPress = (key) => {
    fetchPopular(key);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header with toggle */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Recipes</Text>
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => { setShowSearch(!showSearch); clearSearch(); }}
          >
            <Ionicons
              name={showSearch ? 'grid-outline' : 'search-outline'}
              size={20}
              color={colors.gold}
            />
            <Text style={styles.toggleText}>{showSearch ? 'Browse' : 'Search'}</Text>
          </TouchableOpacity>
        </View>

        {!showSearch ? (
          /* ========== BROWSE MODE ========== */
          <>
            {/* Favorites section */}
            {favorites.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[typography.titleMedium, { marginBottom: 12 }]}>
                  <Ionicons name="heart" size={16} color={colors.notSafe} /> Favorites
                </Text>
                <FlatList
                  horizontal
                  data={favorites}
                  keyExtractor={(item) => String(item.id)}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.favCard}
                      onPress={() => router.push(`/recipe-detail/${item.id}`)}
                      activeOpacity={0.7}
                    >
                      {item.imageUrl && (
                        <View style={styles.favImageWrap}>
                          <View style={styles.favImage}>
                            <Text style={{ color: colors.textMuted }}>🍽️</Text>
                          </View>
                        </View>
                      )}
                      <Text style={styles.favTitle} numberOfLines={2}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />
              </View>
            )}

            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={String(cat.key)}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                    onPress={() => handleCategoryPress(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={isActive ? colors.background : colors.textSecondary}
                    />
                    <Text style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive,
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Skeleton loading */}
            {isLoadingPopular && (
              <View>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            )}

            {/* Popular / category results */}
            {!isLoadingPopular && popularRecipes.length > 0 && (
              <View style={{ gap: 12 }}>
                {popularRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPress={() => router.push(`/recipe-detail/${recipe.id}`)}
                    isFavorite={isFavorite(recipe.id)}
                    onToggleFavorite={() => toggleFavorite(recipe)}
                  />
                ))}
              </View>
            )}

            {!isLoadingPopular && popularRecipes.length === 0 && !error && (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
                <Text style={[typography.bodyMedium, { marginTop: 12 }]}>
                  No recipes found for this category
                </Text>
              </View>
            )}
          </>
        ) : (
          /* ========== SEARCH MODE ========== */
          <>
            {/* Ingredient input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add ingredient (e.g. chickpeas)"
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAdd}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Ingredient chips */}
            {ingredients.length > 0 && (
              <View>
                <View style={styles.chips}>
                  {ingredients.map((ing) => (
                    <IngredientChip
                      key={ing}
                      label={ing}
                      onRemove={() => removeIngredient(ing)}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={{ alignSelf: 'flex-end' }}
                  onPress={clearIngredients}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>Clear all</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Filters */}
            <Text style={[typography.titleMedium, { marginTop: 16 }]}>Filters</Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary }}>High Protein (&gt;20g)</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  Only show protein-rich recipes
                </Text>
              </View>
              <Switch
                value={highProtein}
                onValueChange={toggleHighProtein}
                trackColor={{ false: colors.surfaceLight, true: colors.gold + '80' }}
                thumbColor={highProtein ? colors.gold : colors.textMuted}
              />
            </View>

            <DropdownSelect
              items={MEAL_TYPES}
              selectedValue={mealType}
              onSelect={setMealType}
              placeholder="Meal type"
            />

            <DropdownSelect
              items={COOK_TIMES}
              selectedValue={maxReadyTime}
              onSelect={setMaxReadyTime}
              placeholder="Max cook time"
            />

            {/* Search button */}
            <TouchableOpacity
              style={[styles.searchBtn, isLoading && { opacity: 0.6 }]}
              onPress={searchRecipes}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.searchBtnText}>Search Recipes</Text>
              )}
            </TouchableOpacity>

            {/* Search loading skeletons */}
            {isLoading && (
              <View style={{ marginTop: 20 }}>
                <SkeletonCard />
                <SkeletonCard />
              </View>
            )}

            {/* Search results */}
            {!isLoading && recipes.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={typography.titleMedium}>
                  {recipes.length} Lenten Recipes Found
                </Text>
                <View style={{ marginTop: 12, gap: 12 }}>
                  {recipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onPress={() => router.push(`/recipe-detail/${recipe.id}`)}
                      isFavorite={isFavorite(recipe.id)}
                      onToggleFavorite={() => toggleFavorite(recipe)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={{ color: colors.notSafe }}>{error}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  screenTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surfaceLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  toggleText: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.gold,
  },
  categoryText: {
    fontSize: 13, color: colors.textSecondary, fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.background,
  },
  favCard: {
    width: 120, backgroundColor: colors.surface,
    borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.surfaceLight,
  },
  favImageWrap: { marginBottom: 8 },
  favImage: {
    width: '100%', height: 50, borderRadius: 8, backgroundColor: colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  favTitle: { fontSize: 12, fontWeight: '500', color: colors.textPrimary },
  inputRow: { flexDirection: 'row', marginBottom: 12 },
  input: {
    flex: 1, backgroundColor: colors.surfaceLight, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, color: colors.textPrimary, fontSize: 15,
  },
  addBtn: {
    marginLeft: 10, backgroundColor: colors.gold, borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  addBtnText: { color: colors.background, fontWeight: '600', fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight,
    borderRadius: 12, padding: 16, marginTop: 8, marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surfaceLight, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
  },
  dropdownText: { color: colors.textPrimary, fontSize: 15 },
  dropdownArrow: { color: colors.textMuted, fontSize: 12 },
  dropdownMenu: {
    backgroundColor: colors.surfaceLight, borderRadius: 12,
    marginTop: -6, marginBottom: 10, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: colors.gold + '1A' },
  dropdownItemText: { color: colors.textPrimary, fontSize: 14 },
  searchBtn: {
    backgroundColor: colors.gold, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  searchBtnText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  errorBox: {
    backgroundColor: colors.notSafe + '1A', borderWidth: 1,
    borderColor: colors.notSafe + '4D', borderRadius: 10, padding: 12, marginTop: 16,
  },
});
