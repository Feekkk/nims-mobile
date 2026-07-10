import { Laptop, Package, Receipt, ScanBarcode, Tv, Wifi } from 'lucide-react-native';
import type { ComponentType } from 'react';

export type ActivityRecord = {
  id: string;
  title: string;
  detail: string;
  icon: ComponentType<{ color?: string; size?: number | string }>;
  color: string;
  occurredAt: string;
};

export const ACTIVITY_HISTORY: ActivityRecord[] = [
  {
    id: '1',
    title: 'Laptop checked out',
    detail: 'REQ-1042 · Dell Latitude 5540 · Sarah Chen',
    icon: Laptop,
    color: '#2563eb',
    occurredAt: '2026-07-10',
  },
  {
    id: '2',
    title: 'AV asset returned',
    detail: 'Sony 65" Display · Good condition',
    icon: Tv,
    color: '#6a1b9a',
    occurredAt: '2026-07-10',
  },
  {
    id: '3',
    title: 'Barcode scan recorded',
    detail: 'AST-1001 · SN-LP-88421',
    icon: ScanBarcode,
    color: '#0a7ea4',
    occurredAt: '2026-07-09',
  },
  {
    id: '4',
    title: 'Loan request submitted',
    detail: 'REQ-1041 · 2× Laptop · James Wong',
    icon: Package,
    color: '#e65100',
    occurredAt: '2026-07-09',
  },
  {
    id: '5',
    title: 'Network device deployed',
    detail: 'Cisco Catalyst 9200 · Block A, Level 3',
    icon: Wifi,
    color: '#2e7d32',
    occurredAt: '2026-07-08',
  },
  {
    id: '6',
    title: 'Purchase order approved',
    detail: 'PO-2026-0712 · 5 laptops',
    icon: Receipt,
    color: '#0a7ea4',
    occurredAt: '2026-07-07',
  },
  {
    id: '7',
    title: 'Laptop handover completed',
    detail: 'MacBook Pro 14" · IT Services pool',
    icon: Laptop,
    color: '#2563eb',
    occurredAt: '2026-07-05',
  },
  {
    id: '8',
    title: 'AV deployment updated',
    detail: 'Logitech Rally Bar · Conference Room 5',
    icon: Tv,
    color: '#6a1b9a',
    occurredAt: '2026-07-03',
  },
  {
    id: '9',
    title: 'Loan request rejected',
    detail: 'REQ-1035 · Display · Maintenance window conflict',
    icon: Package,
    color: '#dc2626',
    occurredAt: '2026-06-25',
  },
  {
    id: '10',
    title: 'Network return logged',
    detail: 'Ubiquiti UniFi AP · Spare inventory',
    icon: Wifi,
    color: '#2e7d32',
    occurredAt: '2026-06-20',
  },
];

function formatRelativeTime(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getRecentActivity(limit = 4) {
  return ACTIVITY_HISTORY.slice(0, limit).map((item) => ({
    ...item,
    time: formatRelativeTime(item.occurredAt),
  }));
}

export function formatActivityDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
