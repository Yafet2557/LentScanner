import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

function PulsingBlock({ style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, style, { opacity }]} />;
}

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <PulsingBlock style={styles.image} />
      <View style={styles.body}>
        <PulsingBlock style={styles.titleLine} />
        <PulsingBlock style={styles.titleLineShort} />
        <View style={styles.pills}>
          <PulsingBlock style={styles.pill} />
          <PulsingBlock style={styles.pill} />
          <PulsingBlock style={styles.pill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  block: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 0,
  },
  body: {
    padding: 12,
  },
  titleLine: {
    height: 16,
    width: '80%',
    marginBottom: 8,
  },
  titleLineShort: {
    height: 16,
    width: '50%',
    marginBottom: 12,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    height: 24,
    width: 70,
    borderRadius: 12,
  },
});
