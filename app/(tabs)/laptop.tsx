import { Laptop, Monitor } from 'lucide-react-native';

import {
  ASSET_STATUS_OPTIONS,
  AssetInventoryScreen,
  PROCUREMENT_FIELDS,
  STATUS_REMARKS_FIELDS,
  type AssetFieldDefinition,
  type AssetRecord,
} from '@/components/asset-inventory-screen';

const LAPTOP_FIELDS: AssetFieldDefinition[] = [
  { key: 'asset_id', label: 'Asset ID', required: true, section: 'identity' },
  { key: 'serial_num', label: 'Serial Number', required: true, section: 'identity' },
  { key: 'category', label: 'Category', required: true, section: 'identity' },
  { key: 'brand', label: 'Brand', section: 'identity' },
  { key: 'model', label: 'Model', section: 'identity' },
  { key: 'part_number', label: 'Part Number', section: 'identity' },
  { key: 'processor', label: 'Processor', section: 'specs' },
  { key: 'memory', label: 'Memory', section: 'specs' },
  { key: 'os', label: 'Operating System', section: 'specs' },
  { key: 'storage', label: 'Storage', section: 'specs' },
  { key: 'gpu', label: 'GPU', section: 'specs' },
  ...PROCUREMENT_FIELDS,
  ...STATUS_REMARKS_FIELDS,
];

const INITIAL_LAPTOPS: AssetRecord[] = [
  {
    asset_id: '1001',
    serial_num: 'SN-LP-88421',
    category: 'Laptop',
    brand: 'Dell',
    model: 'Latitude 5540',
    part_number: 'LAT-5540-I7',
    processor: 'Intel Core i7-1365U',
    memory: '16GB DDR5',
    os: 'Windows 11 Pro',
    storage: '512GB SSD',
    gpu: 'Intel Iris Xe',
    PO_DATE: '2024-03-15',
    PO_NUM: 'PO-2024-0312',
    status: 'deploy',
    remarks: 'Assigned to IT pool',
  },
  {
    asset_id: '1002',
    serial_num: 'SN-LP-90317',
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 14"',
    processor: 'Apple M3 Pro',
    memory: '18GB',
    os: 'macOS Sonoma',
    storage: '512GB SSD',
    status: 'return',
    remarks: 'Available for loan requests',
  },
  {
    asset_id: '1003',
    serial_num: 'SN-DT-44102',
    category: 'Desktop',
    brand: 'HP',
    model: 'EliteDesk 800 G9',
    processor: 'Intel Core i5-13500',
    memory: '16GB DDR5',
    os: 'Windows 11 Pro',
    storage: '256GB SSD',
    status: 'deploy',
    remarks: 'Front desk workstation',
  },
];

export default function LaptopScreen() {
  return (
    <AssetInventoryScreen
      config={{
        countTitle: 'Laptop',
        accentColor: '#2563eb',
        headerIcon: Laptop,
        fields: LAPTOP_FIELDS,
        statusOptions: ASSET_STATUS_OPTIONS,
        initialAssets: INITIAL_LAPTOPS,
        countCards: [
          {
            title: 'Laptop',
            accentColor: '#2563eb',
            icon: Laptop,
            match: (asset) => asset.category === 'Laptop',
          },
          {
            title: 'Desktop',
            accentColor: '#7c3aed',
            icon: Monitor,
            match: (asset) => asset.category === 'Desktop',
          },
        ],
      }}
    />
  );
}
