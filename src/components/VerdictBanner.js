import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

const configs = {
  safe: { color: colors.safe, icon: '✓', label: 'Fasting Safe' },
  notSafe: { color: colors.notSafe, icon: '✕', label: 'Not Fasting Safe' },
  caution: { color: colors.caution, icon: '⚠', label: 'Caution' },
};

export default function VerdictBanner({ verdict }) {
  const config = configs[verdict] || configs.caution;

  return (
    <View style={[styles.container, {
      backgroundColor: config.color + '26',
      borderColor: config.color + '4D',
    }]}>
      <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
  },
});
