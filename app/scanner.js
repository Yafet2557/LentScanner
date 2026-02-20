import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { colors } from '../src/constants/theme';
import { useScan } from '../src/context/ScanContext';

export default function ScannerScreen() {
  const router = useRouter();
  const { scanBarcode } = useScan();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [torch, setTorch] = useState(false);
  const processingRef = useRef(false);

  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator color={colors.gold} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permText}>Camera access is needed to scan barcodes</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { marginTop: 12, backgroundColor: colors.surfaceLight }]} onPress={() => router.back()}>
          <Text style={[styles.btnText, { color: colors.textSecondary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    await scanBarcode(data);
    router.replace('/scan-result');
  };

  return (
    <View style={styles.fill}>
      <CameraView
        style={styles.fill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
        onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Product</Text>
        <TouchableOpacity onPress={() => setTorch((t) => !t)}>
          <Text style={styles.headerBtn}>{torch ? '🔦 On' : '🔦 Off'}</Text>
        </TouchableOpacity>
      </View>

      {/* Scan overlay frame */}
      <View style={styles.overlayContainer} pointerEvents="none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.frame}>
            {/* Corner accents */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.hint}>Align barcode within the frame</Text>
        </View>
      </View>

      {/* Processing overlay */}
      {isProcessing && (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.processingText}>Looking up product…</Text>
        </View>
      )}
    </View>
  );
}

const FRAME_W = 270;
const FRAME_H = 190;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  permText: {
    color: colors.textPrimary, fontSize: 16, textAlign: 'center', marginBottom: 24,
  },
  btn: {
    backgroundColor: colors.gold, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: {
    color: colors.background, fontSize: 16, fontWeight: '600',
  },
  header: {
    position: 'absolute', top: 50, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, zIndex: 10,
  },
  headerBtn: { color: '#FFF', fontSize: 15, fontWeight: '500' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center',
  },
  overlayTop: { flex: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.55)' },
  overlayMiddle: { flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  frame: {
    width: FRAME_W, height: FRAME_H,
    borderWidth: 2, borderColor: colors.gold, borderRadius: 14,
  },
  overlayBottom: {
    flex: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', paddingTop: 30,
  },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: '500' },
  corner: {
    position: 'absolute', width: 22, height: 22,
    borderColor: colors.goldLight, borderWidth: 4,
  },
  cornerTL: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 14 },
  cornerTR: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 14 },
  cornerBL: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 14 },
  cornerBR: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 14 },
  processing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', alignItems: 'center',
  },
  processingText: { color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 20 },
});
