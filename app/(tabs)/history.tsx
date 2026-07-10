import { History as HistoryIcon, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';

import { DateRangeCalendar } from '@/components/date-range-calendar';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  ACTIVITY_HISTORY,
  formatActivityDate,
  type ActivityRecord,
} from '@/data/activity-history';

type DatePreset = 'all' | '7d' | '30d' | '90d';

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
];

function toDateValue(dateStr: string) {
  if (!dateStr.trim()) return null;
  const parsed = new Date(`${dateStr.trim()}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPresetRange(preset: DatePreset): { start: string; end: string } | null {
  if (preset === 'all') return null;
  const end = new Date();
  const start = new Date();
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  start.setDate(end.getDate() - days);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`rounded-full px-3.5 py-1.5 ${active ? 'bg-primary' : 'bg-accent'}`}
      onPress={onPress}>
      <Text
        className={`text-xs font-semibold ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

function HistoryItem({ item }: { item: ActivityRecord }) {
  return (
    <HStack className="items-center gap-3 py-3.5" space="md">
      <Box
        className="h-10 w-10 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: `${item.color}18` }}>
        <Icon as={item.icon} color={item.color} size="sm" />
      </Box>
      <VStack className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-foreground">{item.title}</Text>
        <Text className="text-xs leading-4 text-muted-foreground">{item.detail}</Text>
        <HStack className="items-center gap-1 pt-0.5">
          <Text className="text-[11px] text-muted-foreground">
            {formatActivityDate(item.occurredAt)}
          </Text>
        </HStack>
      </VStack>
    </HStack>
  );
}

function HistoryScreen() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState<DatePreset>('all');

  const filteredHistory = useMemo(() => {
    const presetRange = getPresetRange(activePreset);
    const rangeStart = presetRange ? presetRange.start : startDate;
    const rangeEnd = presetRange ? presetRange.end : endDate;
    const start = toDateValue(rangeStart);
    const end = toDateValue(rangeEnd);

    return ACTIVITY_HISTORY.filter((item) => {
      const occurred = toDateValue(item.occurredAt);
      if (!occurred) return false;
      if (start && occurred < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (occurred > endOfDay) return false;
      }
      return true;
    });
  }, [activePreset, endDate, startDate]);

  const applyPreset = (preset: DatePreset) => {
    setActivePreset(preset);
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    const range = getPresetRange(preset);
    if (range) {
      setStartDate(range.start);
      setEndDate(range.end);
    }
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    setActivePreset('all');
  };

  const handleDateRangeChange = (nextStart: string, nextEnd: string) => {
    setStartDate(nextStart);
    setEndDate(nextEnd);
    setActivePreset('all');
  };

  const hasDateRange = startDate.length > 0 || endDate.length > 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-3 p-5 pb-8">
      <Card className="gap-3 rounded-xl p-4">
        <HStack className="items-center gap-2">
          <Box className="h-9 w-9 items-center justify-center rounded-lg bg-[#0a7ea418]">
            <Icon as={HistoryIcon} color="#0a7ea4" size="md" />
          </Box>
          <VStack className="gap-0.5">
            <Text className="text-sm font-semibold text-foreground">Activity History</Text>
            <Text className="text-xs text-muted-foreground">
              {filteredHistory.length} of {ACTIVITY_HISTORY.length} records
            </Text>
          </VStack>
        </HStack>
      </Card>

      <VStack className="gap-2">
        <Heading size="sm" className="text-foreground">
          Date Range
        </Heading>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {DATE_PRESETS.map((preset) => (
            <FilterChip
              key={preset.key}
              label={preset.label}
              active={activePreset === preset.key}
              onPress={() => applyPreset(preset.key)}
            />
          ))}
        </ScrollView>
        <DateRangeCalendar
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateRangeChange}
        />
        {hasDateRange ? (
          <Pressable className="self-start active:opacity-70" onPress={clearDates}>
            <HStack className="items-center gap-1">
              <Icon as={X} className="text-primary" size="2xs" />
              <Text className="text-xs font-semibold text-primary">Clear dates</Text>
            </HStack>
          </Pressable>
        ) : null}
      </VStack>

      <HStack className="items-center justify-between">
        <Heading size="sm" className="text-foreground">
          All Activity
        </Heading>
        <Text className="text-sm text-muted-foreground">{filteredHistory.length} shown</Text>
      </HStack>

      <Card className="rounded-xl px-4 py-0">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item, index) => (
            <Box key={item.id}>
              <HistoryItem item={item} />
              {index < filteredHistory.length - 1 ? <Divider /> : null}
            </Box>
          ))
        ) : (
          <VStack className="items-center gap-2 py-10">
            <Icon as={HistoryIcon} className="text-muted-foreground" size="xl" />
            <Text className="text-[15px] font-semibold text-foreground">No activity found</Text>
            <Text className="text-center text-[13px] text-muted-foreground">
              Try a different date range
            </Text>
          </VStack>
        )}
      </Card>
    </ScrollView>
  );
}

export default HistoryScreen;
