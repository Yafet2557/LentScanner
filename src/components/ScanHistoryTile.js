import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

const verdictColors = {
  safe: colors.safe,
  notSafe: colors.notSafe,
  caution: colors.caution,
};

export default function ScanHistoryTile({ entry, onPress }) {
  const dotColor = verdictColors[entry.verdict] || colors.caution;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.name} numberOfLines={2}>{entry.productName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
