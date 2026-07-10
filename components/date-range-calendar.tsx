import { CalendarDays } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Calendar, type DateData } from 'react-native-calendars';

import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const ACCENT = '#0a7ea4';

type FocusedField = 'from' | 'to';

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildPeriodMarks(startDate: string, endDate: string) {
  if (!startDate) return {};

  if (!endDate) {
    return {
      [startDate]: {
        startingDay: true,
        endingDay: true,
        color: ACCENT,
        textColor: '#ffffff',
      },
    };
  }

  const marks: Record<
    string,
    {
      startingDay?: boolean;
      endingDay?: boolean;
      color: string;
      textColor: string;
    }
  > = {};

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const current = new Date(start);

  while (current <= end) {
    const dateString = toDateString(current);
    marks[dateString] = {
      startingDay: dateString === startDate,
      endingDay: dateString === endDate,
      color: ACCENT,
      textColor: '#ffffff',
    };
    current.setDate(current.getDate() + 1);
  }

  return marks;
}

function formatPickerDate(dateStr: string) {
  if (!dateStr) return 'Not set';
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type DateRangeCalendarProps = {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
};

function DateFieldCard({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable className="min-w-0 flex-1 active:opacity-80" onPress={onPress}>
      <Card
        className={`rounded-xl px-3 py-2.5 ${active ? 'border-primary' : 'border-border'}`}>
        <HStack className="items-center justify-between gap-2">
          <VStack className="min-w-0 flex-1 gap-0.5">
            <Text className="text-[10px] uppercase text-muted-foreground">{label}</Text>
            <Text
              className={`text-sm font-semibold ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
              {formatPickerDate(value)}
            </Text>
          </VStack>
          <Icon as={CalendarDays} color={active ? ACCENT : '#687076'} size="sm" />
        </HStack>
      </Card>
    </Pressable>
  );
}

export function DateRangeCalendar({ startDate, endDate, onChange }: DateRangeCalendarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>('from');

  const markedDates = useMemo(
    () => buildPeriodMarks(startDate, endDate),
    [endDate, startDate],
  );

  const openCalendar = (field: FocusedField) => {
    setFocusedField(field);
    setIsCalendarOpen(true);
  };

  const handleDayPress = (day: DateData) => {
    const selected = day.dateString;

    if (focusedField === 'from') {
      const nextEnd = endDate && selected > endDate ? '' : endDate;
      onChange(selected, nextEnd);
      setFocusedField('to');
      return;
    }

    if (!startDate || selected < startDate) {
      onChange(selected, '');
      setFocusedField('to');
      return;
    }

    onChange(startDate, selected);
    setIsCalendarOpen(false);
  };

  const helperText =
    focusedField === 'from'
      ? 'Select a start date'
      : startDate
        ? 'Select an end date'
        : 'Select a start date first';

  return (
    <VStack className="gap-3">
      <HStack className="gap-3">
        <DateFieldCard
          label="From"
          value={startDate}
          active={isCalendarOpen && focusedField === 'from'}
          onPress={() => openCalendar('from')}
        />
        <DateFieldCard
          label="To"
          value={endDate}
          active={isCalendarOpen && focusedField === 'to'}
          onPress={() => openCalendar('to')}
        />
      </HStack>

      {isCalendarOpen ? (
        <Card className="overflow-hidden rounded-xl p-0">
          <Calendar
            markingType="period"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            enableSwipeMonths
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#687076',
              selectedDayBackgroundColor: ACCENT,
              selectedDayTextColor: '#ffffff',
              todayTextColor: ACCENT,
              dayTextColor: '#11181C',
              textDisabledColor: '#C5C7CB',
              arrowColor: ACCENT,
              monthTextColor: '#11181C',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: 14,
              textMonthFontSize: 15,
              textDayHeaderFontSize: 12,
            }}
          />
        </Card>
      ) : null}

      <Text className="text-center text-xs text-muted-foreground">
        {isCalendarOpen ? helperText : 'Tap From or To to open the calendar'}
      </Text>
    </VStack>
  );
}
