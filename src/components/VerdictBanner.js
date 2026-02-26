import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const configs = {
  safe: {
    gradientColors: ['#1B5E20', '#2E7D32'],
    icon: 'checkmark-circle',
    label: 'Fasting Safe',
  },
  notSafe: {
    gradientColors: ['#7F0000', '#B71C1C'],
    icon: 'close-circle',
    label: 'Not Fasting Safe',
  },
  caution: {
    gradientColors: ['#3E2000', '#E65100'],
    icon: 'warning',
    label: 'Caution',
  },
};

export default function VerdictBanner({ verdict }) {
  const config = configs[verdict] || configs.caution;

  return (
    <LinearGradient
      colors={config.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Ionicons name={config.icon} size={30} color="#fff" style={{ marginRight: 12 }} />
      <Text style={styles.label}>{config.label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
