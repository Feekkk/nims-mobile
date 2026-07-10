import { Image } from 'expo-image';
import {
  ChevronRight,
  Laptop,
  Network,
  Package,
  Search,
  SearchX,
  Tv,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getRecentActivity } from '@/data/activity-history';

const stats = [
  {
    label: 'Total Request',
    value: '1,248',
    icon: Package,
    color: '#0a7ea4',
    href: '/request' as const,
  },
  {
    label: 'Total Laptop',
    value: '23',
    icon: Laptop,
    color: '#e65100',
    href: '/laptop' as const,
  },
  {
    label: 'Total AV',
    value: '12',
    icon: Tv,
    color: '#6a1b9a',
    href: '/av' as const,
  },
  {
    label: 'Total Network',
    value: '18',
    icon: Network,
    color: '#2e7d32',
    href: '/network' as const,
  },
];

const assets = [
  {
    assetId: 'AST-1001',
    serialNumber: 'SN-LP-88421',
    name: 'Dell Latitude 5540',
    category: 'Laptop',
    status: 'In Use',
  },
  {
    assetId: 'AST-1002',
    serialNumber: 'SN-LP-90317',
    name: 'MacBook Pro 14"',
    category: 'Laptop',
    status: 'Available',
  },
  {
    assetId: 'AST-2045',
    serialNumber: 'SN-AV-55201',
    name: 'Sony 65" Display',
    category: 'AV',
    status: 'In Use',
  },
  {
    assetId: 'AST-2046',
    serialNumber: 'SN-AV-55288',
    name: 'Logitech Rally Bar',
    category: 'AV',
    status: 'Maintenance',
  },
  {
    assetId: 'AST-3010',
    serialNumber: 'SN-NW-11042',
    name: 'Cisco Catalyst 9200',
    category: 'Network',
    status: 'In Use',
  },
  {
    assetId: 'AST-3011',
    serialNumber: 'SN-NW-11097',
    name: 'Ubiquiti UniFi AP',
    category: 'Network',
    status: 'Available',
  },
];

const recentActivity = getRecentActivity();

function StatCard({
  label,
  value,
  icon,
  color,
  onPress,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="grow basis-[47%] active:opacity-80"
      onPress={onPress}>
      <Card className="gap-1.5 rounded-xl p-4">
        <Box
          className="h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}18` }}>
          <Icon as={icon} color={color} size="md" />
        </Box>
        <Text className="text-2xl font-bold leading-8 text-foreground">{value}</Text>
        <Text className="text-sm text-muted-foreground">{label}</Text>
      </Card>
    </Pressable>
  );
}

function ActivityItem({
  title,
  detail,
  time,
  icon,
  color,
}: {
  title: string;
  detail: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}) {
  return (
    <HStack className="items-center gap-3 py-3.5" space="md">
      <Box
        className="h-10 w-10 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: `${color}18` }}>
        <Icon as={icon} color={color} size="sm" />
      </Box>
      <VStack className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs leading-4 text-muted-foreground">{detail}</Text>
      </VStack>
      <Text className="text-[11px] text-muted-foreground">{time}</Text>
    </HStack>
  );
}

function AssetResultItem({
  assetId,
  serialNumber,
  name,
  category,
  status,
}: {
  assetId: string;
  serialNumber: string;
  name: string;
  category: string;
  status: string;
}) {
  return (
    <HStack className="items-center gap-3 py-3.5" space="md">
      <Box className="h-10 w-10 items-center justify-center rounded-[10px] bg-accent">
        <Icon as={Package} className="text-primary" size="sm" />
      </Box>
      <VStack className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-foreground">{name}</Text>
        <Text className="text-xs leading-4 text-muted-foreground">
          {assetId} · {serialNumber}
        </Text>
        <Text className="text-xs leading-4 text-muted-foreground">
          {category} · {status}
        </Text>
      </VStack>
      <Icon as={ChevronRight} className="text-muted-foreground" size="sm" />
    </HStack>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return assets.filter(
      (asset) =>
        asset.assetId.toLowerCase().includes(query) ||
        asset.serialNumber.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="gap-1 p-5 pb-8" showsVerticalScrollIndicator={false}>
        <HStack className="mb-5 items-center justify-between">
          <VStack className="flex-1 gap-0.5">
            <Text className="text-[13px] uppercase tracking-wide text-muted-foreground">
              {today}
            </Text>
            <Heading size="2xl" className="text-foreground">
              Dashboard
            </Heading>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              NexCheck Inventory Management System
            </Text>
          </VStack>
          <Image
            source={require('@/assets/images/icon.png')}
            style={{ width: 56, height: 56, marginLeft: 12 }}
            contentFit="contain"
          />
        </HStack>

        <Input className="mb-5 h-12 rounded-xl">
          <InputSlot className="pl-3.5">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Search asset ID or serial number"
            value={searchQuery}
          />
          {isSearching ? (
            <InputSlot className="pr-3.5" onPress={() => setSearchQuery('')}>
              <InputIcon as={X} />
            </InputSlot>
          ) : null}
        </Input>

        <HStack className="mb-5 flex-wrap gap-3" space="md">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
              onPress={() => router.push(stat.href)}
            />
          ))}
        </HStack>

        {isSearching ? (
          <>
            <HStack className="mb-3 mt-1 items-center justify-between">
              <Heading size="sm" className="text-foreground">
                Search Results
              </Heading>
              <Text className="text-sm text-muted-foreground">
                {filteredAssets.length} found
              </Text>
            </HStack>
            <Card className="rounded-xl px-4 py-0">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset, index) => (
                  <Box key={asset.assetId}>
                    <AssetResultItem {...asset} />
                    {index < filteredAssets.length - 1 ? <Divider /> : null}
                  </Box>
                ))
              ) : (
                <VStack className="items-center gap-2 py-8">
                  <Icon as={SearchX} className="text-muted-foreground" size="xl" />
                  <Text className="text-[15px] font-semibold text-foreground">
                    No assets found
                  </Text>
                  <Text className="text-center text-[13px] text-muted-foreground">
                    Try searching by asset ID or serial number
                  </Text>
                </VStack>
              )}
            </Card>
          </>
        ) : (
          <>
            <HStack className="mb-3 mt-1 items-center justify-between">
              <Heading size="sm" className="text-foreground">
                Recent Activity
              </Heading>
              <Pressable onPress={() => router.push('/history')} className="active:opacity-70">
                <Text className="text-sm font-semibold text-primary">View all</Text>
              </Pressable>
            </HStack>
            <Card className="rounded-xl px-4 py-0">
              {recentActivity.map((item, index) => (
                <Box key={item.id}>
                  <ActivityItem {...item} />
                  {index < recentActivity.length - 1 ? <Divider /> : null}
                </Box>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
