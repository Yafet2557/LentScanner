import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { colors, typography } from '../../src/constants/theme';

function SettingsRow({ icon, label, value, onPress, danger }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? colors.notSafe : colors.gold}
        />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && !danger && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await signOut();
            // AuthContext session becomes null → _layout.js redirects to /auth
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#E8C96A', '#D4A843', '#B8892E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          </LinearGradient>

          <Text style={styles.profileEmail}>{user?.email}</Text>
          {memberSince && (
            <Text style={styles.profileSince}>Member since {memberSince}</Text>
          )}
        </View>

        {/* Account section */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingsRow
            icon="mail-outline"
            label="Email"
            value={user?.email}
          />
        </View>

        {/* App section */}
        <SectionHeader title="App" />
        <View style={styles.section}>
          <SettingsRow
            icon="information-circle-outline"
            label="Version"
            value="1.0.0"
          />
          <SettingsRow
            icon="leaf-outline"
            label="Fasting Tradition"
            value="Greek Orthodox"
          />
        </View>

        {/* Sign out */}
        <SectionHeader title="" />
        <View style={styles.section}>
          <SettingsRow
            icon="log-out-outline"
            label={signingOut ? 'Signing out...' : 'Sign Out'}
            onPress={handleSignOut}
            danger
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    ...typography.headlineLarge,
    marginTop: 16,
    marginBottom: 24,
  },

  // Profile
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 28,
    marginBottom: 32,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.gold,
  },
  profileEmail: {
    ...typography.bodyLarge,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileSince: {
    ...typography.bodySmall,
  },

  // Sections
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIconDanger: {
    backgroundColor: colors.notSafe + '22',
  },
  rowLabel: {
    ...typography.bodyLarge,
    flex: 1,
  },
  rowLabelDanger: {
    color: colors.notSafe,
    fontWeight: '600',
  },
  rowValue: {
    ...typography.bodyMedium,
    marginRight: 8,
    maxWidth: 180,
    textAlign: 'right',
  },
});
