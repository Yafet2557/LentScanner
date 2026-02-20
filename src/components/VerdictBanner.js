import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

const configs = {
  safe: { color: colors.safe, icon: 'checkmark-circle', label: 'Fasting Safe' },
  notSafe: { color: colors.notSafe, icon: 'close-circle', label: 'Not Fasting Safe' },
  caution: { color: colors.caution, icon: 'warning', label: 'Caution' },
};

export default function VerdictBanner({ verdict }) {
  const config = configs[verdict] || configs.caution;

  return (
    <View style={[styles.container, {
      backgroundColor: config.color + '26',
      borderColor: config.color + '4D',
    }]}>
      <Ionicons name={config.icon} size={28} color={config.color} style={{ marginRight: 12 }} />
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
  label: {
    fontSize: 20,
    fontWeight: '700',
  },
});
