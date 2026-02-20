import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

function Pill({ iconName, text, highlight = false }) {
  return (
    <View style={[styles.pill, highlight && styles.pillHighlight]}>
      <Ionicons name={iconName} size={12} color={highlight ? colors.gold : colors.textMuted} style={{ marginRight: 4 }} />
      <Text style={[styles.pillText, highlight && styles.pillTextHighlight]}>{text}</Text>
    </View>
  );
}

export default function RecipeCard({ recipe, onPress, isFavorite, onToggleFavorite }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {recipe.imageUrl && (
        <View>
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
          {onToggleFavorite && (
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }}
              hitSlop={8}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.notSafe : '#FFF'}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
        <View style={styles.pills}>
          {recipe.readyInMinutes != null && (
            <Pill iconName="timer-outline" text={`${recipe.readyInMinutes} min`} />
          )}
          {recipe.proteinGrams != null && (
            <Pill
              iconName="barbell-outline"
              text={`${Math.round(recipe.proteinGrams)}g protein`}
              highlight
            />
          )}
          {recipe.calories != null && (
            <Pill iconName="flame-outline" text={`${Math.round(recipe.calories)} cal`} />
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
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
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
  pillText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  pillTextHighlight: {
    color: colors.gold,
    fontWeight: '600',
  },
});
