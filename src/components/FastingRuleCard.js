import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { getTodaysFastingRule } from '../utils/fastingCalendar';

export default function FastingRuleCard() {
  const rule = getTodaysFastingRule();

  return (
    <View style={[styles.card, { borderColor: rule.color + '4D' }]}>
      <View style={[styles.iconCircle, { backgroundColor: rule.color + '26' }]}>
        <Ionicons name={rule.icon} size={28} color={rule.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: rule.color }]}>{rule.label}</Text>
        <Text style={styles.description}>{rule.description}</Text>
        <Text style={styles.reason}>{rule.reason}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reason: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
