import { Network } from 'lucide-react-native';

import {
  ASSET_STATUS_OPTIONS,
  AssetInventoryScreen,
  PROCUREMENT_FIELDS,
  STATUS_REMARKS_FIELDS,
  type AssetFieldDefinition,
  type AssetRecord,
} from '@/components/asset-inventory-screen';

const NETWORK_FIELDS: AssetFieldDefinition[] = [
  { key: 'asset_id', label: 'Asset ID', required: true, section: 'identity' },
  { key: 'serial_num', label: 'Serial Number', section: 'identity' },
  { key: 'brand', label: 'Brand', section: 'identity' },
  { key: 'model', label: 'Model', section: 'identity' },
  { key: 'mac_address', label: 'MAC Address', section: 'specs' },
  { key: 'ip_address', label: 'IP Address', section: 'specs' },
  ...PROCUREMENT_FIELDS,
  ...STATUS_REMARKS_FIELDS,
];

const INITIAL_NETWORK_ASSETS: AssetRecord[] = [
  {
    asset_id: '3010',
    serial_num: 'SN-NW-11042',
    brand: 'Cisco',
    model: 'Catalyst 9200',
    mac_address: '00:1A:2B:3C:4D:5E',
    ip_address: '10.0.12.10',
    PO_DATE: '2024-01-20',
    PO_NUM: 'PO-2024-0120',
    status: 'deploy',
    remarks: 'Core switch for Block A',
  },
  {
    asset_id: '3011',
    serial_num: 'SN-NW-11097',
    brand: 'Ubiquiti',
    model: 'UniFi AP U6 Pro',
    mac_address: '00:AA:BB:CC:DD:EE',
    ip_address: '10.0.12.45',
    status: 'new',
    remarks: 'Spare access point',
  },
];

export default function NetworkScreen() {
  return (
    <AssetInventoryScreen
      config={{
        countTitle: 'Network',
        accentColor: '#2e7d32',
        headerIcon: Network,
        fields: NETWORK_FIELDS,
        statusOptions: ASSET_STATUS_OPTIONS,
        initialAssets: INITIAL_NETWORK_ASSETS,
      }}
    />
  );
}
