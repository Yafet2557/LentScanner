import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch, ScrollView,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../src/constants/theme';
import { useRecipes } from '../../src/context/RecipeContext';
import IngredientChip from '../../src/components/IngredientChip';
import RecipeCard from '../../src/components/RecipeCard';

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
    recipes, isLoading, error,
    addIngredient, removeIngredient, clearIngredients,
    toggleHighProtein, setMealType, setMaxReadyTime,
    searchRecipes,
  } = useRecipes();

  const [inputText, setInputText] = useState('');

  const handleAdd = () => {
    if (inputText.trim()) {
      addIngredient(inputText);
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.screenTitle}>Recipe Finder</Text>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={{ color: colors.notSafe }}>{error}</Text>
          </View>
        )}

        {/* Loading */}
        {isLoading && (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        )}

        {/* Results */}
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
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom search button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.searchBtn, isLoading && { opacity: 0.6 }]}
          onPress={searchRecipes}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.searchBtnText}>🔍  Search Recipes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screenTitle: {
    fontSize: 20, fontWeight: '700', color: colors.textPrimary,
    textAlign: 'center', paddingVertical: 12,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  inputRow: { flexDirection: 'row', marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
  addBtn: {
    marginLeft: 10,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addBtnText: { color: colors.background, fontWeight: '600', fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  dropdownText: { color: colors.textPrimary, fontSize: 15 },
  dropdownArrow: { color: colors.textMuted, fontSize: 12 },
  dropdownMenu: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    marginTop: -6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.gold + '1A',
  },
  dropdownItemText: { color: colors.textPrimary, fontSize: 14 },
  errorBox: {
    backgroundColor: colors.notSafe + '1A',
    borderWidth: 1,
    borderColor: colors.notSafe + '4D',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  searchBtn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  searchBtnText: { color: colors.background, fontSize: 16, fontWeight: '600' },
});
