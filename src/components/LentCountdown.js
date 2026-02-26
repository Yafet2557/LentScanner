import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/theme';
import { getCurrentLentDay, daysUntilNextLent, getNextPascha } from '../utils/lentDates';

function formatDate(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function LentCountdown() {
  const currentDay = getCurrentLentDay();
  const isInLent = currentDay !== null;
  const pascha = getNextPascha();
  const paschaFormatted = formatDate(pascha);

  if (isInLent) {
    return (
      <LinearGradient
        colors={['#E8C96A', '#D4A843', '#B8892E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Text style={styles.subtitle}>Great Lent</Text>
        <View style={styles.row}>
          <View style={styles.circle}>
            <Text style={styles.circleText}>{currentDay}</Text>
          </View>
          <View style={styles.textCol}>
            <Text style={styles.dayText}>Day {currentDay} of 55</Text>
            <Text style={styles.subText}>
              {55 - currentDay} days until Pascha · {paschaFormatted}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const daysUntil = daysUntilNextLent();
  return (
    <LinearGradient
      colors={['#E8C96A', '#D4A843', '#B8892E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.subtitle}>Great Lent</Text>
      <Text style={styles.dayText}>Starts in {daysUntil} days</Text>
      <Text style={styles.subText}>Pascha: {paschaFormatted}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#12121266',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#12121233',
    backgroundColor: '#12121220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
  textCol: {
    marginLeft: 16,
    flex: 1,
  },
  dayText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.background,
  },
  subText: {
    fontSize: 13,
    color: '#121212AA',
    marginTop: 2,
  },
});
