import {
  Calendar,
  Check,
  ChevronRight,
  CircleAlert,
  Laptop,
  MapPin,
  Package,
  ScanBarcode,
  Tv,
  User,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';

import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type RequestStatus = 'pending' | 'booked' | 'checked_out' | 'returned' | 'rejected';
type AssetKind = 'laptop' | 'av';
type FilterKey = 'all' | RequestStatus;
type AssignmentState = 'unassigned' | 'assigned' | 'unavailable' | 'checked_out' | 'returned';

type RequestItem = {
  requestItemId: string;
  assetType: string;
  quantity: number;
  assetKind: AssetKind;
};

type AssignmentSlot = {
  slotId: string;
  requestItemId: string;
  assetType: string;
  assetKind: AssetKind;
  state: AssignmentState;
  assetId?: string;
  assetLabel?: string;
  returnCondition?: string;
};

type LoanRequest = {
  requestId: string;
  requestedBy: string;
  requesterEmail: string;
  borrowDate: string;
  returnDate: string;
  programType: string;
  usageLocation: string;
  remarks?: string;
  status: RequestStatus;
  items: RequestItem[];
  assignments: AssignmentSlot[];
  submittedAt: string;
  rejectionReason?: string;
};

type PoolAsset = {
  assetId: string;
  label: string;
  assetType: string;
  assetKind: AssetKind;
  serialNumber: string;
};

const STATUS_META: Record<
  RequestStatus,
  { label: string; badgeClass: string; textClass: string }
> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-[#f59e0b18] border border-[#f59e0b40]',
    textClass: 'text-[#b45309] normal-case',
  },
  booked: {
    label: 'Booked',
    badgeClass: 'bg-[#0a7ea418] border border-[#0a7ea440]',
    textClass: 'text-[#0a7ea4] normal-case',
  },
  checked_out: {
    label: 'Checked Out',
    badgeClass: 'bg-[#7c3aed18] border border-[#7c3aed40]',
    textClass: 'text-[#6d28d9] normal-case',
  },
  returned: {
    label: 'Returned',
    badgeClass: 'bg-[#16a34a18] border border-[#16a34a40]',
    textClass: 'text-[#15803d] normal-case',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-destructive/10 border border-destructive/30',
    textClass: 'text-destructive normal-case',
  },
};

const SLOT_STATE_META: Record<
  AssignmentState,
  { label: string; badgeClass: string; textClass: string }
> = {
  unassigned: {
    label: 'Unassigned',
    badgeClass: 'bg-[#f59e0b18] border border-[#f59e0b40]',
    textClass: 'text-[#b45309] normal-case',
  },
  assigned: {
    label: 'Assigned',
    badgeClass: 'bg-[#0a7ea418] border border-[#0a7ea440]',
    textClass: 'text-[#0a7ea4] normal-case',
  },
  unavailable: {
    label: 'Unavailable',
    badgeClass: 'bg-muted border border-border',
    textClass: 'text-muted-foreground normal-case',
  },
  checked_out: {
    label: 'Checked Out',
    badgeClass: 'bg-[#7c3aed18] border border-[#7c3aed40]',
    textClass: 'text-[#6d28d9] normal-case',
  },
  returned: {
    label: 'Returned',
    badgeClass: 'bg-[#16a34a18] border border-[#16a34a40]',
    textClass: 'text-[#15803d] normal-case',
  },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'booked', label: 'Booked' },
  { key: 'checked_out', label: 'Out' },
  { key: 'returned', label: 'Returned' },
  { key: 'rejected', label: 'Rejected' },
];

const POOL_ASSETS: PoolAsset[] = [
  {
    assetId: '1001',
    label: 'Dell Latitude 5540',
    assetType: 'Laptop',
    assetKind: 'laptop',
    serialNumber: 'SN-LP-88421',
  },
  {
    assetId: '1002',
    label: 'MacBook Pro 14"',
    assetType: 'Laptop',
    assetKind: 'laptop',
    serialNumber: 'SN-LP-90317',
  },
  {
    assetId: '2045',
    label: 'Sony 65" Display',
    assetType: 'Display',
    assetKind: 'av',
    serialNumber: 'SN-AV-55201',
  },
  {
    assetId: '2047',
    label: 'Epson EB-L210SW',
    assetType: 'Projector',
    assetKind: 'av',
    serialNumber: 'SN-AV-55301',
  },
];

function buildSlots(items: RequestItem[]): AssignmentSlot[] {
  return items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, index) => ({
      slotId: `${item.requestItemId}-${index + 1}`,
      requestItemId: item.requestItemId,
      assetType: item.assetType,
      assetKind: item.assetKind,
      state: 'unassigned' as AssignmentState,
    })),
  );
}

const INITIAL_REQUESTS: LoanRequest[] = [
  {
    requestId: 'REQ-1042',
    requestedBy: 'Sarah Chen',
    requesterEmail: 'sarah.chen@example.com',
    borrowDate: '2026-07-14',
    returnDate: '2026-07-16',
    programType: 'Official Event',
    usageLocation: 'Main Auditorium, Block A',
    remarks: 'Annual town hall presentation',
    status: 'booked',
    items: [
      { requestItemId: 'ri-1', assetType: 'Laptop', quantity: 2, assetKind: 'laptop' },
      { requestItemId: 'ri-2', assetType: 'Projector', quantity: 1, assetKind: 'av' },
    ],
    assignments: [
      {
        slotId: 'ri-1-1',
        requestItemId: 'ri-1',
        assetType: 'Laptop',
        assetKind: 'laptop',
        state: 'assigned',
        assetId: '1001',
        assetLabel: 'Dell Latitude 5540',
      },
      {
        slotId: 'ri-1-2',
        requestItemId: 'ri-1',
        assetType: 'Laptop',
        assetKind: 'laptop',
        state: 'assigned',
        assetId: '1002',
        assetLabel: 'MacBook Pro 14"',
      },
      {
        slotId: 'ri-2-1',
        requestItemId: 'ri-2',
        assetType: 'Projector',
        assetKind: 'av',
        state: 'assigned',
        assetId: '2047',
        assetLabel: 'Epson EB-L210SW',
      },
    ],
    submittedAt: '2h ago',
  },
  {
    requestId: 'REQ-1041',
    requestedBy: 'James Wong',
    requesterEmail: 'james.wong@example.com',
    borrowDate: '2026-07-18',
    returnDate: '2026-07-20',
    programType: 'Academic Project / Class',
    usageLocation: 'Lab 3B, Science Block',
    status: 'pending',
    items: [{ requestItemId: 'ri-3', assetType: 'Laptop', quantity: 2, assetKind: 'laptop' }],
    assignments: buildSlots([
      { requestItemId: 'ri-3', assetType: 'Laptop', quantity: 2, assetKind: 'laptop' },
    ]),
    submittedAt: '4h ago',
  },
  {
    requestId: 'REQ-1038',
    requestedBy: 'Priya Nair',
    requesterEmail: 'priya.nair@example.com',
    borrowDate: '2026-07-01',
    returnDate: '2026-07-03',
    programType: 'Club / Society',
    usageLocation: 'Student Centre, Level 2',
    status: 'returned',
    items: [
      { requestItemId: 'ri-4', assetType: 'Speaker', quantity: 1, assetKind: 'av' },
      { requestItemId: 'ri-5', assetType: 'Microphone', quantity: 2, assetKind: 'av' },
    ],
    assignments: [
      {
        slotId: 'ri-4-1',
        requestItemId: 'ri-4',
        assetType: 'Speaker',
        assetKind: 'av',
        state: 'returned',
        assetId: '2045',
        assetLabel: 'Sony 65" Display',
        returnCondition: 'Good condition',
      },
    ],
    submittedAt: 'Jul 3',
  },
  {
    requestId: 'REQ-1035',
    requestedBy: 'Alex Tan',
    requesterEmail: 'alex.tan@example.com',
    borrowDate: '2026-06-28',
    returnDate: '2026-06-30',
    programType: 'Official Event',
    usageLocation: 'Conference Room 5',
    status: 'rejected',
    rejectionReason: 'Requested dates overlap with maintenance window.',
    items: [{ requestItemId: 'ri-6', assetType: 'Display', quantity: 1, assetKind: 'av' }],
    assignments: buildSlots([
      { requestItemId: 'ri-6', assetType: 'Display', quantity: 1, assetKind: 'av' },
    ]),
    submittedAt: 'Jun 25',
  },
];

function formatDateRange(borrowDate: string, returnDate: string) {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const borrow = new Date(`${borrowDate}T00:00:00`);
  const ret = new Date(`${returnDate}T00:00:00`);
  return `${borrow.toLocaleDateString('en-US', options)} – ${ret.toLocaleDateString('en-US', options)}`;
}

function summarizeItems(items: RequestItem[]) {
  return items.map((item) => `${item.quantity}× ${item.assetType}`).join(', ');
}

function deriveRequestStatus(assignments: AssignmentSlot[], rejected: boolean): RequestStatus {
  if (rejected) return 'rejected';
  if (assignments.length === 0) return 'pending';
  if (assignments.every((slot) => slot.state === 'returned')) return 'returned';
  if (assignments.some((slot) => slot.state === 'checked_out')) return 'checked_out';
  if (
    assignments.every(
      (slot) =>
        slot.state === 'assigned' ||
        slot.state === 'unavailable' ||
        slot.state === 'checked_out' ||
        slot.state === 'returned',
    ) &&
    assignments.some((slot) => slot.state === 'assigned')
  ) {
    return 'booked';
  }
  if (assignments.some((slot) => slot.state === 'unassigned')) return 'pending';
  return 'pending';
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={meta.badgeClass}>
      <BadgeText className={meta.textClass}>{meta.label}</BadgeText>
    </Badge>
  );
}

function SlotBadge({ state }: { state: AssignmentState }) {
  const meta = SLOT_STATE_META[state];
  return (
    <Badge variant="outline" className={meta.badgeClass}>
      <BadgeText className={meta.textClass}>{meta.label}</BadgeText>
    </Badge>
  );
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

function RequestCard({ request, onPress }: { request: LoanRequest; onPress: () => void }) {
  const laptopCount = request.items
    .filter((item) => item.assetKind === 'laptop')
    .reduce((sum, item) => sum + item.quantity, 0);
  const avCount = request.items
    .filter((item) => item.assetKind === 'av')
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Pressable className="active:opacity-80" onPress={onPress}>
      <HStack className="items-start gap-3 py-3.5" space="md">
        <Box className="h-10 w-10 items-center justify-center rounded-[10px] bg-accent">
          <Icon as={User} className="text-primary" size="sm" />
        </Box>
        <VStack className="flex-1 gap-1.5">
          <HStack className="items-center justify-between gap-2">
            <Text className="text-sm font-semibold text-foreground">{request.requestedBy}</Text>
            <StatusBadge status={request.status} />
          </HStack>
          <Text className="text-xs text-muted-foreground">
            {request.requestId} · {request.programType}
          </Text>
          <HStack className="items-center gap-1.5">
            <Icon as={Calendar} className="text-muted-foreground" size="2xs" />
            <Text className="text-xs text-muted-foreground">
              {formatDateRange(request.borrowDate, request.returnDate)}
            </Text>
          </HStack>
          <HStack className="items-center gap-1.5">
            <Icon as={MapPin} className="text-muted-foreground" size="2xs" />
            <Text className="flex-1 text-xs text-muted-foreground" numberOfLines={1}>
              {request.usageLocation}
            </Text>
          </HStack>
          <Text className="text-xs text-muted-foreground">{summarizeItems(request.items)}</Text>
          <HStack className="gap-3 pt-0.5">
            {laptopCount > 0 ? (
              <HStack className="items-center gap-1">
                <Icon as={Laptop} color="#e65100" size="2xs" />
                <Text className="text-[11px] text-muted-foreground">{laptopCount} laptop</Text>
              </HStack>
            ) : null}
            {avCount > 0 ? (
              <HStack className="items-center gap-1">
                <Icon as={Tv} color="#6a1b9a" size="2xs" />
                <Text className="text-[11px] text-muted-foreground">{avCount} AV</Text>
              </HStack>
            ) : null}
          </HStack>
        </VStack>
        <VStack className="items-end gap-1">
          <Text className="text-[11px] text-muted-foreground">{request.submittedAt}</Text>
          <Icon as={ChevronRight} className="text-muted-foreground" size="sm" />
        </VStack>
      </HStack>
    </Pressable>
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

export default function RequestScreen() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('pending');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assigningSlotId, setAssigningSlotId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [returnCondition, setReturnCondition] = useState('');
  const [actionError, setActionError] = useState('');

  const selectedRequest = useMemo(
    () => requests.find((request) => request.requestId === selectedRequestId) ?? null,
    [requests, selectedRequestId],
  );

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'all') return requests;
    return requests.filter((request) => request.status === activeFilter);
  }, [activeFilter, requests]);

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === 'pending').length,
    [requests],
  );

  const activeCount = useMemo(
    () =>
      requests.filter((request) =>
        ['pending', 'booked', 'checked_out'].includes(request.status),
      ).length,
    [requests],
  );

  const closeDetail = () => {
    setSelectedRequestId(null);
    setAssigningSlotId(null);
    setRejectReason('');
    setReturnCondition('');
    setActionError('');
  };

  const updateRequest = (requestId: string, updater: (request: LoanRequest) => LoanRequest) => {
    setRequests((current) =>
      current.map((request) => (request.requestId === requestId ? updater(request) : request)),
    );
  };

  const handleAssignAsset = (slotId: string, asset: PoolAsset) => {
    if (!selectedRequest) return;
    updateRequest(selectedRequest.requestId, (request) => {
      const assignments = request.assignments.map((slot) =>
        slot.slotId === slotId
          ? {
              ...slot,
              state: 'assigned' as AssignmentState,
              assetId: asset.assetId,
              assetLabel: asset.label,
            }
          : slot,
      );
      return {
        ...request,
        assignments,
        status: deriveRequestStatus(assignments, false),
      };
    });
    setAssigningSlotId(null);
    setActionError('');
  };

  const handleMarkUnavailable = (slotId: string) => {
    if (!selectedRequest) return;
    updateRequest(selectedRequest.requestId, (request) => {
      const assignments = request.assignments.map((slot) =>
        slot.slotId === slotId
          ? {
              ...slot,
              state: 'unavailable' as AssignmentState,
              assetId: undefined,
              assetLabel: undefined,
            }
          : slot,
      );
      return {
        ...request,
        assignments,
        status: deriveRequestStatus(assignments, false),
      };
    });
    setAssigningSlotId(null);
    setActionError('');
  };

  const handleCheckout = () => {
    if (!selectedRequest) return;
    const hasUnassigned = selectedRequest.assignments.some((slot) => slot.state === 'unassigned');
    if (hasUnassigned) {
      setActionError('Assign all items or mark slots unavailable before checkout.');
      return;
    }
    updateRequest(selectedRequest.requestId, (request) => {
      const assignments = request.assignments.map((slot) =>
        slot.state === 'assigned' ? { ...slot, state: 'checked_out' as AssignmentState } : slot,
      );
      return {
        ...request,
        assignments,
        status: deriveRequestStatus(assignments, false),
      };
    });
    setActionError('');
  };

  const handleReturn = () => {
    if (!selectedRequest) return;
    if (!returnCondition.trim()) {
      setActionError('Enter return condition before checking in.');
      return;
    }
    updateRequest(selectedRequest.requestId, (request) => {
      const assignments = request.assignments.map((slot) =>
        slot.state === 'checked_out'
          ? {
              ...slot,
              state: 'returned' as AssignmentState,
              returnCondition: returnCondition.trim(),
            }
          : slot,
      );
      return {
        ...request,
        assignments,
        status: deriveRequestStatus(assignments, false),
      };
    });
    setReturnCondition('');
    setActionError('');
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      setActionError('Enter a rejection reason.');
      return;
    }
    updateRequest(selectedRequest.requestId, (request) => ({
      ...request,
      status: 'rejected',
      rejectionReason: rejectReason.trim(),
    }));
    setRejectReason('');
    setActionError('');
  };

  const availableAssetsForSlot = (slot: AssignmentSlot) => {
    if (!selectedRequest) return [];
    const usedAssetIds = new Set(
      selectedRequest.assignments
        .filter((item) => item.assetId && item.slotId !== slot.slotId)
        .map((item) => item.assetId as string),
    );
    return POOL_ASSETS.filter(
      (asset) =>
        asset.assetType === slot.assetType &&
        asset.assetKind === slot.assetKind &&
        !usedAssetIds.has(asset.assetId),
    );
  };

  return (
    <Box className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-3 p-5 pb-8" showsVerticalScrollIndicator={false}>
        <Card className="gap-3 rounded-xl p-4">
          <HStack className="items-center justify-between">
            <VStack className="gap-0.5">
              <Text className="text-2xl font-bold text-foreground">{pendingCount}</Text>
              <Text className="text-sm text-muted-foreground">Awaiting action</Text>
            </VStack>
            <VStack className="items-end gap-0.5">
              <Text className="text-2xl font-bold text-primary">{activeCount}</Text>
              <Text className="text-sm text-muted-foreground">Active loans</Text>
            </VStack>
          </HStack>
          <Alert variant="default" className="rounded-lg">
            <AlertIcon as={CircleAlert} />
            <AlertText className="text-xs leading-5 text-muted-foreground">
              Review incoming loan requests, assign pool laptop or AV assets, then check out and
              check in equipment on return.
            </AlertText>
          </Alert>
        </Card>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2">
          {FILTERS.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              active={activeFilter === filter.key}
              onPress={() => setActiveFilter(filter.key)}
            />
          ))}
        </ScrollView>

        <HStack className="items-center justify-between">
          <Heading size="sm" className="text-foreground">
            Incoming Requests
          </Heading>
          <Text className="text-sm text-muted-foreground">{filteredRequests.length} shown</Text>
        </HStack>

        <Card className="rounded-xl px-4 py-0">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request, index) => (
              <Box key={request.requestId}>
                <RequestCard
                  request={request}
                  onPress={() => setSelectedRequestId(request.requestId)}
                />
                {index < filteredRequests.length - 1 ? <Divider /> : null}
              </Box>
            ))
          ) : (
            <VStack className="items-center gap-2 py-10">
              <Icon as={Package} className="text-muted-foreground" size="xl" />
              <Text className="text-[15px] font-semibold text-foreground">No requests found</Text>
              <Text className="text-center text-[13px] text-muted-foreground">
                No loan requests match this filter
              </Text>
            </VStack>
          )}
        </Card>
      </ScrollView>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={selectedRequest !== null}
        onRequestClose={closeDetail}>
        {selectedRequest ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-background">
            <HStack className="items-center justify-between border-b border-border px-5 py-4">
              <VStack className="gap-0.5">
                <Heading size="md" className="text-foreground">
                  {selectedRequest.requestId}
                </Heading>
                <Text className="text-xs text-muted-foreground">Loan request from user</Text>
              </VStack>
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full bg-accent active:opacity-70"
                onPress={closeDetail}>
                <Icon as={X} className="text-foreground" size="sm" />
              </Pressable>
            </HStack>

            <ScrollView
              contentContainerClassName="gap-5 p-5 pb-10"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {actionError ? (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertIcon as={CircleAlert} />
                  <AlertText>{actionError}</AlertText>
                </Alert>
              ) : null}

              <Card className="gap-3 rounded-xl p-4">
                <HStack className="items-center justify-between">
                  <VStack className="gap-0.5">
                    <Text className="text-base font-semibold text-foreground">
                      {selectedRequest.requestedBy}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {selectedRequest.requesterEmail}
                    </Text>
                  </VStack>
                  <StatusBadge status={selectedRequest.status} />
                </HStack>
                <Divider />
                <VStack className="gap-2.5">
                  <DetailRow label="Program" value={selectedRequest.programType} />
                  <DetailRow
                    label="Borrow period"
                    value={formatDateRange(
                      selectedRequest.borrowDate,
                      selectedRequest.returnDate,
                    )}
                  />
                  <DetailRow label="Location" value={selectedRequest.usageLocation} />
                  {selectedRequest.remarks ? (
                    <DetailRow label="Remarks" value={selectedRequest.remarks} />
                  ) : null}
                  <DetailRow label="Submitted" value={selectedRequest.submittedAt} />
                </VStack>
              </Card>

              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason ? (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertIcon as={CircleAlert} />
                  <AlertText>{selectedRequest.rejectionReason}</AlertText>
                </Alert>
              ) : null}

              <VStack className="gap-2">
                <Heading size="sm" className="text-foreground">
                  Requested Items
                </Heading>
                <Text className="text-xs text-muted-foreground">
                  Assign pool assets per slot or mark unavailable if stock cannot be fulfilled.
                </Text>
                <Card className="rounded-xl px-4 py-1">
                  {selectedRequest.assignments.map((slot, index) => (
                    <Box key={slot.slotId}>
                      <VStack className="gap-2 py-3">
                        <HStack className="items-center justify-between gap-2">
                          <VStack className="flex-1 gap-0.5">
                            <Text className="text-sm font-medium text-foreground">
                              {slot.assetType}
                            </Text>
                            {slot.assetLabel ? (
                              <Text className="text-xs text-muted-foreground">
                                {slot.assetLabel}
                                {slot.assetId ? ` · #${slot.assetId}` : ''}
                              </Text>
                            ) : (
                              <Text className="text-xs text-muted-foreground">No asset assigned</Text>
                            )}
                            {slot.returnCondition ? (
                              <Text className="text-xs text-muted-foreground">
                                Return: {slot.returnCondition}
                              </Text>
                            ) : null}
                          </VStack>
                          <SlotBadge state={slot.state} />
                        </HStack>

                        {selectedRequest.status === 'pending' && slot.state === 'unassigned' ? (
                          assigningSlotId === slot.slotId ? (
                            <VStack className="gap-2">
                              {availableAssetsForSlot(slot).length > 0 ? (
                                availableAssetsForSlot(slot).map((asset) => (
                                  <Pressable
                                    key={asset.assetId}
                                    className="rounded-lg border border-border px-3 py-2.5 active:bg-accent"
                                    onPress={() => handleAssignAsset(slot.slotId, asset)}>
                                    <HStack className="items-center gap-2">
                                      <Icon
                                        as={asset.assetKind === 'laptop' ? Laptop : Tv}
                                        color={asset.assetKind === 'laptop' ? '#e65100' : '#6a1b9a'}
                                        size="sm"
                                      />
                                      <VStack className="flex-1">
                                        <Text className="text-sm font-medium text-foreground">
                                          {asset.label}
                                        </Text>
                                        <Text className="text-xs text-muted-foreground">
                                          #{asset.assetId} · {asset.serialNumber}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  </Pressable>
                                ))
                              ) : (
                                <Text className="text-xs text-muted-foreground">
                                  No available pool assets for this category.
                                </Text>
                              )}
                              <Button
                                variant="outline"
                                className="rounded-lg"
                                onPress={() => handleMarkUnavailable(slot.slotId)}>
                                <ButtonText>Mark Unavailable</ButtonText>
                              </Button>
                              <Button
                                variant="ghost"
                                className="rounded-lg"
                                onPress={() => setAssigningSlotId(null)}>
                                <ButtonText>Cancel</ButtonText>
                              </Button>
                            </VStack>
                          ) : (
                            <Button
                              variant="outline"
                              className="rounded-lg"
                              onPress={() => setAssigningSlotId(slot.slotId)}>
                              <ButtonText>Assign Asset</ButtonText>
                            </Button>
                          )
                        ) : null}
                      </VStack>
                      {index < selectedRequest.assignments.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                </Card>
              </VStack>

              {selectedRequest.status === 'pending' ? (
                <VStack className="gap-3">
                  <VStack className="gap-1.5">
                    <Text className="text-sm font-medium text-foreground">Rejection reason</Text>
                    <Input className="min-h-[72px] rounded-xl items-start py-3">
                      <InputField
                        multiline
                        numberOfLines={2}
                        onChangeText={setRejectReason}
                        placeholder="Required if rejecting this request"
                        textAlignVertical="top"
                        value={rejectReason}
                      />
                    </Input>
                  </VStack>
                  <Button variant="destructive" className="h-11 rounded-xl" onPress={handleReject}>
                    <ButtonText>Reject Request</ButtonText>
                  </Button>
                </VStack>
              ) : null}

              {selectedRequest.status === 'booked' ? (
                <Button className="h-12 rounded-xl" onPress={handleCheckout}>
                  <ButtonIcon as={ScanBarcode} />
                  <ButtonText className="font-semibold">Check Out Equipment</ButtonText>
                </Button>
              ) : null}

              {selectedRequest.status === 'checked_out' ? (
                <VStack className="gap-3">
                  <VStack className="gap-1.5">
                    <Text className="text-sm font-medium text-foreground">Return condition</Text>
                    <Input className="min-h-[72px] rounded-xl items-start py-3">
                      <InputField
                        multiline
                        numberOfLines={2}
                        onChangeText={setReturnCondition}
                        placeholder="Physical condition and notes at return"
                        textAlignVertical="top"
                        value={returnCondition}
                      />
                    </Input>
                  </VStack>
                  <Button className="h-12 rounded-xl" onPress={handleReturn}>
                    <ButtonIcon as={Check} />
                    <ButtonText className="font-semibold">Check In Equipment</ButtonText>
                  </Button>
                </VStack>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        ) : null}
      </Modal>
    </Box>
  );
}
