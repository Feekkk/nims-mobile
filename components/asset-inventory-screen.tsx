import { ChevronRight, CircleAlert, Package, Plus, Search, SearchX, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';

import {
  CountCardDefinition,
  SmallAssetCountCard,
  SmallAssetCountCardRow,
} from '@/components/asset-count-card';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Fab, FabIcon } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type AssetFieldSection = 'identity' | 'specs' | 'procurement' | 'other';

export type AssetFieldDefinition = {
  key: string;
  label: string;
  required?: boolean;
  section: AssetFieldSection;
  multiline?: boolean;
  placeholder?: string;
};

export type AssetRecord = Record<string, string>;

export type AssetInventoryConfig = {
  countTitle: string;
  accentColor: string;
  headerIcon: React.ComponentType<{ color?: string; size?: number | string }>;
  countCards?: CountCardDefinition[];
  fields: AssetFieldDefinition[];
  statusOptions: { value: string; label: string }[];
  initialAssets: AssetRecord[];
};
const SECTION_LABELS: Record<AssetFieldSection, string> = {
  identity: 'Asset Info',
  specs: 'Specifications',
  procurement: 'Procurement',
  other: 'Status & Notes',
};

function getAssetTitle(asset: AssetRecord) {
  const brand = asset.brand?.trim() ?? '';
  const model = asset.model?.trim() ?? '';
  const combined = `${brand} ${model}`.trim();
  if (combined) return combined;
  if (asset.category?.trim()) return asset.category.trim();
  return `#${asset.asset_id}`;
}

function getStatusLabel(status: string, options: AssetInventoryConfig['statusOptions']) {
  return options.find((option) => option.value === status)?.label ?? status;
}

function matchesAssetSearch(asset: AssetRecord, query: string, statusOptions: AssetInventoryConfig['statusOptions']) {
  const haystack = [
    getAssetTitle(asset),
    asset.asset_id,
    asset.serial_num,
    asset.asset_id_old,
    asset.brand,
    asset.model,
    asset.category,
    asset.mac_address,
    asset.ip_address,
    getStatusLabel(asset.status, statusOptions),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function StatusBadge({
  status,
  options,
}: {
  status: string;
  options: AssetInventoryConfig['statusOptions'];
}) {
  return (
    <Badge variant="outline" className="bg-accent border-border">
      <BadgeText className="normal-case text-foreground">
        {getStatusLabel(status, options)}
      </BadgeText>
    </Badge>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack className="items-start justify-between gap-4">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-right text-xs font-medium text-foreground">{value}</Text>
    </HStack>
  );
}

function FormLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Text className="text-sm font-medium text-foreground">
      {children}
      {required ? ' *' : ''}
    </Text>
  );
}

function AssetListItem({
  asset,
  statusOptions,
  onPress,
}: {
  asset: AssetRecord;
  statusOptions: AssetInventoryConfig['statusOptions'];
  onPress: () => void;
}) {
  return (
    <Pressable className="active:opacity-80" onPress={onPress}>
      <HStack className="items-center gap-3 py-3.5" space="md">
        <Box className="h-10 w-10 items-center justify-center rounded-[10px] bg-accent">
          <Icon as={Package} className="text-primary" size="sm" />
        </Box>
        <VStack className="flex-1 gap-0.5">
          <Text className="text-sm font-semibold text-foreground">{getAssetTitle(asset)}</Text>
          <Text className="text-xs text-muted-foreground">
            #{asset.asset_id}
            {asset.serial_num ? ` · ${asset.serial_num}` : ''}
          </Text>
          <StatusBadge status={asset.status} options={statusOptions} />
        </VStack>
        <Icon as={ChevronRight} className="text-muted-foreground" size="sm" />
      </HStack>
    </Pressable>
  );
}

function AssetDetailContent({
  asset,
  config,
}: {
  asset: AssetRecord;
  config: AssetInventoryConfig;
}) {
  const sections = useMemo(() => {
    const grouped = new Map<AssetFieldSection, AssetFieldDefinition[]>();
    config.fields.forEach((field) => {
      const current = grouped.get(field.section) ?? [];
      grouped.set(field.section, [...current, field]);
    });
    return (['identity', 'specs', 'procurement', 'other'] as AssetFieldSection[])
      .map((section) => ({
        section,
        fields: (grouped.get(section) ?? []).filter((field) => asset[field.key]?.trim()),
      }))
      .filter((group) => group.fields.length > 0 || group.section === 'other');
  }, [asset, config.fields]);

  return (
    <VStack className="gap-4">
      <Card className="gap-3 rounded-xl p-4">
        <HStack className="items-center justify-between gap-2">
          <VStack className="flex-1 gap-0.5">
            <Text className="text-base font-semibold text-foreground">{getAssetTitle(asset)}</Text>
            <Text className="text-xs text-muted-foreground">Asset #{asset.asset_id}</Text>
          </VStack>
          <StatusBadge status={asset.status} options={config.statusOptions} />
        </HStack>
      </Card>

      {sections.map((group) => (
        <VStack key={group.section} className="gap-2">
          <Heading size="sm" className="text-foreground">
            {SECTION_LABELS[group.section]}
          </Heading>
          <Card className="gap-2.5 rounded-xl p-4">
            {group.section === 'other' ? (
              <>
                <DetailRow
                  label="Status"
                  value={getStatusLabel(asset.status, config.statusOptions)}
                />
                {asset.remarks?.trim() ? (
                  <DetailRow label="Remarks" value={asset.remarks.trim()} />
                ) : null}
              </>
            ) : (
              group.fields.map((field) => (
                <DetailRow
                  key={field.key}
                  label={field.label}
                  value={asset[field.key]?.trim() ?? ''}
                />
              ))
            )}
          </Card>
        </VStack>
      ))}
    </VStack>
  );
}

function AssetFormFields({
  config,
  form,
  onChange,
}: {
  config: AssetInventoryConfig;
  form: AssetRecord;
  onChange: (key: string, value: string) => void;
}) {
  const sections = useMemo(() => {
    const grouped = new Map<AssetFieldSection, AssetFieldDefinition[]>();
    config.fields.forEach((field) => {
      const current = grouped.get(field.section) ?? [];
      grouped.set(field.section, [...current, field]);
    });
    return (['identity', 'specs', 'procurement', 'other'] as AssetFieldSection[]).map(
      (section) => ({
        section,
        fields: grouped.get(section) ?? [],
      }),
    );
  }, [config.fields]);

  return (
    <VStack className="gap-5">
      {sections.map((group) =>
        group.fields.length === 0 ? null : (
          <VStack key={group.section} className="gap-3">
            <Heading size="sm" className="text-foreground">
              {SECTION_LABELS[group.section]}
            </Heading>
            {group.fields.map((field) =>
              field.key === 'status' ? (
                <VStack key={field.key} className="gap-2">
                  <FormLabel required={field.required}>{field.label}</FormLabel>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2">
                    {config.statusOptions.map((option) => {
                      const selected = form.status === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          className={`rounded-full px-3.5 py-2 ${selected ? 'bg-primary' : 'bg-accent'}`}
                          onPress={() => onChange('status', option.value)}>
                          <Text
                            className={`text-xs font-medium ${selected ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </VStack>
              ) : (
                <VStack key={field.key} className="gap-1.5">
                  <FormLabel required={field.required}>{field.label}</FormLabel>
                  <Input
                    className={`rounded-xl ${field.multiline ? 'min-h-[88px] items-start py-3' : 'h-11'}`}>
                    <InputField
                      autoCapitalize="none"
                      multiline={field.multiline}
                      numberOfLines={field.multiline ? 3 : 1}
                      onChangeText={(value) => onChange(field.key, value)}
                      placeholder={field.placeholder ?? field.label}
                      textAlignVertical={field.multiline ? 'top' : 'center'}
                      value={form[field.key] ?? ''}
                    />
                  </Input>
                </VStack>
              ),
            )}
          </VStack>
        ),
      )}
    </VStack>
  );
}

function createEmptyForm(config: AssetInventoryConfig): AssetRecord {
  const form: AssetRecord = { status: config.statusOptions[0]?.value ?? 'new' };
  config.fields.forEach((field) => {
    if (field.key !== 'status') form[field.key] = '';
  });
  return form;
}

export function AssetInventoryScreen({ config }: { config: AssetInventoryConfig }) {
  const [assets, setAssets] = useState(config.initialAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [addVisible, setAddVisible] = useState(false);
  const [form, setForm] = useState<AssetRecord>(() => createEmptyForm(config));
  const [formError, setFormError] = useState('');

  const isSearching = searchQuery.trim().length > 0;

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => matchesAssetSearch(asset, query, config.statusOptions));
  }, [assets, config.statusOptions, searchQuery]);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.asset_id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  );

  const closeDetail = () => setSelectedAssetId(null);

  const closeAdd = () => {
    setAddVisible(false);
    setForm(createEmptyForm(config));
    setFormError('');
  };

  const handleFormChange = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError('');
  };

  const handleAddAsset = () => {
    const missing = config.fields.filter(
      (field) => field.required && !form[field.key]?.trim(),
    );
    if (missing.length > 0) {
      setFormError(`${missing[0].label} is required.`);
      return;
    }
    if (assets.some((asset) => asset.asset_id === form.asset_id.trim())) {
      setFormError('Asset ID already exists.');
      return;
    }

    const nextAsset = config.fields.reduce<AssetRecord>(
      (record, field) => {
        record[field.key] = form[field.key]?.trim() ?? '';
        return record;
      },
      { status: form.status },
    );

    setAssets((current) => [nextAsset, ...current]);
    closeAdd();
  };

  return (
    <Box className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-3 p-5 pb-28" showsVerticalScrollIndicator={false}>
        {config.countCards && config.countCards.length > 0 ? (
          <SmallAssetCountCardRow assets={assets} cards={config.countCards} />
        ) : (
          <SmallAssetCountCard
            title={config.countTitle}
            total={assets.length}
            accentColor={config.accentColor}
            icon={config.headerIcon}
          />
        )}

        <Input className="h-12 rounded-xl">
          <InputSlot className="pl-3.5">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Search asset ID, serial number, or name"
            value={searchQuery}
          />
          {isSearching ? (
            <InputSlot className="pr-3.5" onPress={() => setSearchQuery('')}>
              <InputIcon as={X} />
            </InputSlot>
          ) : null}
        </Input>

        {isSearching ? (
          <HStack className="items-center justify-between">
            <Heading size="sm" className="text-foreground">
              Search Results
            </Heading>
            <Text className="text-sm text-muted-foreground">{filteredAssets.length} found</Text>
          </HStack>
        ) : null}

        <Card className="rounded-xl px-4 py-0">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, index) => (
              <Box key={asset.asset_id}>
                <AssetListItem
                  asset={asset}
                  statusOptions={config.statusOptions}
                  onPress={() => setSelectedAssetId(asset.asset_id)}
                />
                {index < filteredAssets.length - 1 ? <Divider /> : null}
              </Box>
            ))
          ) : isSearching ? (
            <VStack className="items-center gap-2 py-10">
              <Icon as={SearchX} className="text-muted-foreground" size="xl" />
              <Text className="text-[15px] font-semibold text-foreground">No assets found</Text>
              <Text className="text-center text-[13px] text-muted-foreground">
                Try searching by asset ID, serial number, brand, or model
              </Text>
            </VStack>
          ) : (
            <VStack className="items-center gap-2 py-10">
              <Icon as={Package} className="text-muted-foreground" size="xl" />
              <Text className="text-[15px] font-semibold text-foreground">No assets yet</Text>
              <Text className="text-center text-[13px] text-muted-foreground">
                Tap + to add a single asset
              </Text>
            </VStack>
          )}
        </Card>
      </ScrollView>

      <Fab placement="bottom right" onPress={() => setAddVisible(true)}>
        <FabIcon as={Plus} />
      </Fab>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={selectedAsset !== null}
        onRequestClose={closeDetail}>
        {selectedAsset ? (
          <Box className="flex-1 bg-background">
            <HStack className="items-center justify-between border-b border-border px-5 py-4">
              <VStack className="gap-0.5">
                <Heading size="md" className="text-foreground">
                  Asset Details
                </Heading>
                <Text className="text-xs text-muted-foreground">View only</Text>
              </VStack>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full bg-accent active:opacity-70"
                onPress={closeDetail}>
                <Icon as={X} className="text-foreground" size="sm" />
              </Pressable>
            </HStack>
            <ScrollView contentContainerClassName="gap-4 p-5 pb-10" showsVerticalScrollIndicator={false}>
              <AssetDetailContent asset={selectedAsset} config={config} />
            </ScrollView>
          </Box>
        ) : null}
      </Modal>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={addVisible}
        onRequestClose={closeAdd}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-background">
          <HStack className="items-center justify-between border-b border-border px-5 py-4">
            <VStack className="gap-0.5">
              <Heading size="md" className="text-foreground">
                Add Asset
              </Heading>
              <Text className="text-xs text-muted-foreground">Single asset entry</Text>
            </VStack>
            <Pressable
              className="h-9 w-9 items-center justify-center rounded-full bg-accent active:opacity-70"
              onPress={closeAdd}>
              <Icon as={X} className="text-foreground" size="sm" />
            </Pressable>
          </HStack>
          <ScrollView
            contentContainerClassName="gap-5 p-5 pb-10"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {formError ? (
              <Alert variant="destructive" className="rounded-lg">
                <AlertIcon as={CircleAlert} />
                <AlertText>{formError}</AlertText>
              </Alert>
            ) : null}
            <AssetFormFields config={config} form={form} onChange={handleFormChange} />
            <Button className="h-12 rounded-xl" onPress={handleAddAsset}>
              <ButtonText className="font-semibold">Save Asset</ButtonText>
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Box>
  );
}

export const ASSET_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'return', label: 'Return' },
  { value: 'deploy', label: 'Deploy' },
  { value: 'assign', label: 'Assign' },
  { value: 'disposed', label: 'Disposed' },
  { value: 'active (request)', label: 'Active (Request)' },
  { value: 'booked (request)', label: 'Booked (Request)' },
  { value: 'checkout (request)', label: 'Checkout (Request)' },
];

export const PROCUREMENT_FIELDS: AssetFieldDefinition[] = [
  {
    key: 'PO_DATE',
    label: 'PO Date',
    section: 'procurement',
    placeholder: 'YYYY-MM-DD',
  },
  { key: 'PO_NUM', label: 'PO Number', section: 'procurement' },
  {
    key: 'DO_DATE',
    label: 'DO Date',
    section: 'procurement',
    placeholder: 'YYYY-MM-DD',
  },
  { key: 'DO_NUM', label: 'DO Number', section: 'procurement' },
  {
    key: 'INVOICE_DATE',
    label: 'Invoice Date',
    section: 'procurement',
    placeholder: 'YYYY-MM-DD',
  },
  { key: 'INVOICE_NUM', label: 'Invoice Number', section: 'procurement' },
  { key: 'PURCHASE_COST', label: 'Purchase Cost', section: 'procurement', placeholder: '0.00' },
];

export const STATUS_REMARKS_FIELDS: AssetFieldDefinition[] = [
  { key: 'status', label: 'Status', required: true, section: 'other' },
  {
    key: 'remarks',
    label: 'Remarks',
    section: 'other',
    multiline: true,
    placeholder: 'Optional notes',
  },
];
