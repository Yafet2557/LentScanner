import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

function Pill({ icon, text, highlight = false }) {
  return (
    <View style={[styles.pill, highlight && styles.pillHighlight]}>
      <Text style={[styles.pillIcon, highlight && { color: colors.gold }]}>{icon}</Text>
      <Text style={[styles.pillText, highlight && styles.pillTextHighlight]}>{text}</Text>
    </View>
  );
}

export default function RecipeCard({ recipe, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {recipe.imageUrl && (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.pills}>
          {recipe.readyInMinutes != null && (
            <Pill icon="⏱" text={`${recipe.readyInMinutes} min`} />
          )}
          {recipe.proteinGrams != null && (
            <Pill
              icon="💪"
              text={`${Math.round(recipe.proteinGrams)}g protein`}
              highlight
            />
          )}
          {recipe.calories != null && (
            <Pill icon="🔥" text={`${Math.round(recipe.calories)} cal`} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
  },
  pillHighlight: {
    backgroundColor: colors.gold + '26',
    borderWidth: 1,
    borderColor: colors.gold + '4D',
  },
  pillIcon: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: 4,
  },
  pillText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pillTextHighlight: {
    color: colors.gold,
    fontWeight: '600',
  },
});
