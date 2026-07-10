import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useFocusEffect } from 'expo-router';
import {
  CircleCheckBig,
  Flashlight,
  FlashlightOff,
  Package,
  ScanBarcode,
  ScanLine,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
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

const frameSize = 240;
const overlayColor = 'rgba(0, 0, 0, 0.6)';
const scanLinePadding = 12;
const scanLineHeight = 3;

function formatBarcodeType(type: string) {
  return type.replace(/_/g, ' ').toUpperCase();
}

function AnimatedScanLine() {
  const progress = useSharedValue(0);
  const travelDistance = frameSize - scanLinePadding * 2 - scanLineHeight;

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLinePadding + progress.value * travelDistance }],
    opacity: 0.55 + progress.value * 0.45,
  }));

  return (
    <Animated.View style={[styles.scanLine, animatedStyle]}>
      <View style={styles.scanLineGlow} />
    </Animated.View>
  );
}

function ScanFrame({ active }: { active: boolean }) {
  return (
    <View style={{ flexDirection: 'row', height: frameSize }}>
      <View style={{ flex: 1, backgroundColor: overlayColor }} />
      <View style={{ width: frameSize, height: frameSize, position: 'relative', overflow: 'hidden' }}>
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
        {active ? <AnimatedScanLine /> : null}
      </View>
      <View style={{ flex: 1, backgroundColor: overlayColor }} />
    </View>
  );
}

function BottomInfoPanel({
  scanResult,
  onScanAgain,
}: {
  scanResult: BarcodeScanningResult | null;
  onScanAgain: () => void;
}) {
  if (scanResult) {
    return (
      <VStack className="gap-4 px-5 pb-2 pt-3">
        <HStack className="items-center gap-2.5">
          <Box className="h-10 w-10 items-center justify-center rounded-full bg-[#2e7d3218]">
            <Icon as={CircleCheckBig} color="#2e7d32" size="md" />
          </Box>
          <VStack className="flex-1 gap-0.5">
            <Text className="text-base font-bold text-foreground">Barcode scanned</Text>
            <Text className="text-xs text-muted-foreground">Ready for inventory lookup</Text>
          </VStack>
        </HStack>

        <Card className="gap-3 rounded-xl bg-muted p-4">
          <HStack className="items-start justify-between gap-3">
            <VStack className="flex-1 gap-1">
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Type
              </Text>
              <Text className="text-[15px] font-semibold text-foreground">
                {formatBarcodeType(scanResult.type)}
              </Text>
            </VStack>
            <Box className="rounded-md bg-primary/10 px-2.5 py-1">
              <Text className="text-[11px] font-semibold uppercase text-primary">Valid</Text>
            </Box>
          </HStack>
          <VStack className="gap-1">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Data
            </Text>
            <Text className="text-[15px] font-semibold leading-5 text-foreground" selectable>
              {scanResult.data}
            </Text>
          </VStack>
        </Card>

        <Button onPress={onScanAgain}>
          <ButtonIcon as={ScanBarcode} />
          <ButtonText>Scan again</ButtonText>
        </Button>
      </VStack>
    );
  }

  return (
    <VStack className="gap-3 px-5 pb-2 pt-3">
      <HStack className="items-center gap-2.5">
        <Box className="h-10 w-10 items-center justify-center rounded-full bg-accent">
          <Icon as={ScanLine} className="text-primary" size="md" />
        </Box>
        <VStack className="flex-1 gap-0.5">
          <Text className="text-base font-bold text-foreground">Ready to scan</Text>
          <Text className="text-xs text-muted-foreground">Align the barcode inside the frame</Text>
        </VStack>
      </HStack>

      <Card className="gap-2.5 rounded-xl bg-muted p-4">
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Supported formats
        </Text>
        <Text className="text-sm leading-5 text-foreground">
          EAN-13, EAN-8, UPC, Code 128, Code 39, QR
        </Text>
        <HStack className="items-center gap-2 pt-0.5">
          <Icon as={Package} className="text-primary" size="sm" />
          <Text className="flex-1 text-sm leading-5 text-muted-foreground">
            Point your camera at a product barcode or QR code
          </Text>
        </HStack>
      </Card>
    </VStack>
  );
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<BarcodeScanningResult | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const beepPlayer = useAudioPlayer(require('@/assets/sounds/scan-beep.wav'));

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  const playScanBeep = useCallback(() => {
    beepPlayer.seekTo(0);
    beepPlayer.play();
  }, [beepPlayer]);

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
    playScanBeep();
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

      <View style={{ flex: 1 }}>
        <SafeAreaView edges={['top']}>
          <HStack className="items-center justify-between px-5 py-3">
            <VStack className="flex-1 gap-0.5">
              <Text className="text-xl font-bold text-white">Scan Barcode</Text>
              <Text className="text-sm text-white/75">Inventory lookup</Text>
            </VStack>
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-white/20 data-[active=true]:opacity-85"
              onPress={() => setTorchEnabled((current) => !current)}
              style={torchEnabled ? { backgroundColor: '#0a7ea4' } : undefined}>
              <Icon as={torchEnabled ? Flashlight : FlashlightOff} className="text-white" size="lg" />
            </Pressable>
          </HStack>
        </SafeAreaView>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, backgroundColor: overlayColor }} />
          </View>
          <ScanFrame active={!scanned} />
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{ flex: 1, backgroundColor: overlayColor }} />
          </View>
        </View>

        <SafeAreaView edges={['bottom']} className="bg-background">
          <Box className="items-center pt-2">
            <Box className="h-1 w-10 rounded-full bg-border" />
          </Box>
          <BottomInfoPanel scanResult={scanResult} onScanAgain={handleScanAgain} />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  scanLine: {
    position: 'absolute',
    left: scanLinePadding,
    right: scanLinePadding,
    top: 0,
    height: scanLineHeight,
    borderRadius: 2,
    backgroundColor: '#0a7ea4',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  scanLineGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -4,
    height: 11,
    borderRadius: 6,
    backgroundColor: 'rgba(10, 126, 164, 0.25)',
  },
});
