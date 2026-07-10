import { Tv } from 'lucide-react-native';

import {
  ASSET_STATUS_OPTIONS,
  AssetInventoryScreen,
  PROCUREMENT_FIELDS,
  STATUS_REMARKS_FIELDS,
  type AssetFieldDefinition,
  type AssetRecord,
} from '@/components/asset-inventory-screen';

const AV_FIELDS: AssetFieldDefinition[] = [
  { key: 'asset_id', label: 'Asset ID', required: true, section: 'identity' },
  { key: 'asset_id_old', label: 'Legacy Asset ID', required: true, section: 'identity' },
  { key: 'category', label: 'Category', section: 'identity', placeholder: 'Projector, Speaker, etc.' },
  { key: 'brand', label: 'Brand', section: 'identity' },
  { key: 'model', label: 'Model', section: 'identity' },
  { key: 'serial_num', label: 'Serial Number', section: 'identity' },
  ...PROCUREMENT_FIELDS,
  ...STATUS_REMARKS_FIELDS,
];

const INITIAL_AV_ASSETS: AssetRecord[] = [
  {
    asset_id: '2045',
    asset_id_old: 'AV-OLD-2045',
    category: 'Display',
    brand: 'Sony',
    model: '65" Bravia Display',
    serial_num: 'SN-AV-55201',
    PO_DATE: '2023-11-02',
    PO_NUM: 'PO-2023-1102',
    PURCHASE_COST: '2499.00',
    status: 'deploy',
    remarks: 'Deployed to main auditorium',
  },
  {
    asset_id: '2046',
    asset_id_old: 'AV-OLD-2046',
    category: 'Conference Bar',
    brand: 'Logitech',
    model: 'Rally Bar',
    serial_num: 'SN-AV-55288',
    status: 'return',
    remarks: 'Awaiting inspection after return',
  },
];

export default function AvScreen() {
  return (
    <AssetInventoryScreen
      config={{
        countTitle: 'AV',
        accentColor: '#6a1b9a',
        headerIcon: Tv,
        fields: AV_FIELDS,
        statusOptions: ASSET_STATUS_OPTIONS,
        initialAssets: INITIAL_AV_ASSETS,
      }}
    />
  );
}
