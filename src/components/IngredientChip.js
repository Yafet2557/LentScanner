import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { categories } from '../constants/nonFastingIngredients';

const categoryColors = {
  [categories.meat]: colors.chipMeat,
  [categories.dairy]: colors.chipDairy,
  [categories.eggs]: colors.chipEggs,
  [categories.fish]: colors.chipFish,
  [categories.otherAnimal]: colors.chipOther,
  [categories.ambiguous]: colors.chipAmbiguous,
};

export default function IngredientChip({ label, onRemove, category }) {
  const chipColor = category ? (categoryColors[category] || colors.chipOther) : colors.gold;

  return (
    <View style={[styles.chip, {
      backgroundColor: category ? chipColor + '33' : colors.surfaceLight,
      borderColor: chipColor + '66',
    }]}>
      <Text style={[styles.label, {
        color: category ? '#FFFFFF' : colors.textPrimary,
      }]}>
        {label}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={8}>
          <Ionicons name="close" size={14} color={chipColor} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
  },
});
