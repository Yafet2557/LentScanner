import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../src/constants/theme';

export default function RecipesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.centered}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🍽️</Text>
        <Text style={typography.headlineMedium}>Recipe Finder</Text>
        <Text style={[typography.bodyMedium, { marginTop: 8, textAlign: 'center' }]}>
          Coming soon — this feature will be implemented next.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});
