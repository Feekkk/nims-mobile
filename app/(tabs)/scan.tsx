import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { CircleCheckBig, Flashlight, FlashlightOff, Package, ScanBarcode } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const barcodeTypes = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'qr',
] as const;

const frameSize = 260;
const overlayColor = 'rgba(0, 0, 0, 0.55)';

function formatBarcodeType(type: string) {
  return type.replace(/_/g, ' ').toUpperCase();
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<BarcodeScanningResult | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
        setTorchEnabled(false);
      };
    }, []),
  );

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setScanResult(result);
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanResult(null);
  };

  if (!permission) {
    return (
      <Box className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-muted-foreground">Checking camera permission...</Text>
      </Box>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-muted p-6">
        <Card className="items-center gap-3 rounded-2xl p-7">
          <Box className="mb-1 h-[72px] w-[72px] items-center justify-center rounded-full bg-accent">
            <Icon as={ScanBarcode} className="text-primary" size="xl" />
          </Box>
          <Heading size="lg" className="text-center text-foreground">
            Camera access required
          </Heading>
          <Text className="text-center leading-[22px] text-muted-foreground">
            Allow camera access to scan product barcodes and look up inventory items.
          </Text>
          <Button className="mt-1 w-full" onPress={requestPermission}>
            <ButtonText>Grant permission</ButtonText>
          </Button>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        active={isActive && !scanned}
        enableTorch={torchEnabled}
        barcodeScannerSettings={{ barcodeTypes: [...barcodeTypes] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <SafeAreaView className="absolute inset-0 justify-between" edges={['top', 'bottom']}>
        <HStack className="items-start justify-between px-5 pt-2">
          <VStack>
            <Text className="text-[22px] font-bold text-white">Scan Barcode</Text>
            <Text className="mt-1 text-sm text-white/80">
              Align the barcode within the frame
            </Text>
          </VStack>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-white/20 data-[active=true]:opacity-85"
            onPress={() => setTorchEnabled((current) => !current)}
            style={torchEnabled ? { backgroundColor: '#0a7ea4' } : undefined}>
            <Icon as={torchEnabled ? Flashlight : FlashlightOff} className="text-white" size="lg" />
          </Pressable>
        </HStack>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, backgroundColor: overlayColor }} />
          </View>
          <View style={{ flexDirection: 'row', height: frameSize }}>
            <View style={{ flex: 1, backgroundColor: overlayColor }} />
            <View style={{ width: frameSize, height: frameSize, position: 'relative' }}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
              {!scanned ? <View style={styles.scanLine} /> : null}
            </View>
            <View style={{ flex: 1, backgroundColor: overlayColor }} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, backgroundColor: overlayColor }} />
          </View>
        </View>

        <Card className="min-h-[140px] gap-3 rounded-t-[20px] rounded-b-none px-5 pb-6 pt-5">
          {scanResult ? (
            <>
              <HStack className="items-center gap-2" space="sm">
                <Icon as={CircleCheckBig} className="text-[#2e7d32]" size="md" />
                <Text className="text-base font-bold text-foreground">Barcode scanned</Text>
              </HStack>
              <VStack className="gap-1 rounded-xl bg-muted p-3.5">
                <Text className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Type
                </Text>
                <Text className="text-[15px] font-semibold text-foreground">
                  {formatBarcodeType(scanResult.type)}
                </Text>
                <Text className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Data
                </Text>
                <Text className="text-[15px] font-semibold text-foreground" selectable>
                  {scanResult.data}
                </Text>
              </VStack>
              <Button className="mt-1" onPress={handleScanAgain}>
                <ButtonIcon as={ScanBarcode} />
                <ButtonText>Scan again</ButtonText>
              </Button>
            </>
          ) : (
            <>
              <Text className="text-[15px] font-bold text-foreground">Supported formats</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                EAN-13, EAN-8, UPC, Code 128, Code 39, QR
              </Text>
              <HStack className="mt-1 items-center gap-2" space="sm">
                <Icon as={Package} className="text-primary" size="sm" />
                <Text className="text-sm leading-5 text-muted-foreground">
                  Point your camera at a product barcode
                </Text>
              </HStack>
            </>
          )}
        </Card>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#0a7ea4',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: '50%',
    height: 2,
    backgroundColor: '#0a7ea4',
    opacity: 0.9,
  },
});
