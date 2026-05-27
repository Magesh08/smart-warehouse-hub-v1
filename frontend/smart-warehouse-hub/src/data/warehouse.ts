export type SlotStatus = 'empty' | 'occupied' | 'reserved' | 'inprogress';

export interface Slot {
  id: string;
  rackId: string;
  label: string;
  status: SlotStatus;
  item?: {
    name: string;
    sku: string;
    quantity: number;
    lastUpdated: string;
  };
}

export interface Rack {
  id: string;
  label: string;
  slots: Slot[];
}

export interface Robot {
  id: string;
  name: string;
  battery: number;
  status: 'idle' | 'moving' | 'charging' | 'error';
  position: { rack: string; slot: string };
  task?: string;
}

export interface Order {
  id: string;
  orderId: string;
  items: { sku: string; name: string; quantity: number }[];
  status: 'pending' | 'picking' | 'completed';
  assignedRobot?: string;
  progress: number;
  createdAt: string;
}

export interface InventoryItem {
  sku: string;
  name: string;
  rack: string;
  slot: string;
  quantity: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  category: string;
}

const generateSlots = (rackId: string, rackLabel: string, count: number): Slot[] => {
  const statuses: SlotStatus[] = ['empty', 'occupied', 'reserved', 'inprogress'];
  const items = [
    { name: 'Widget Pro X1', sku: 'WDG-001' },
    { name: 'Sensor Module V3', sku: 'SNS-042' },
    { name: 'Motor Assembly K7', sku: 'MTR-118' },
    { name: 'PCB Board Alpha', sku: 'PCB-203' },
    { name: 'Hydraulic Valve T2', sku: 'HYD-055' },
    { name: 'Bearing Set 6205', sku: 'BRG-620' },
    { name: 'Cable Harness C9', sku: 'CBL-099' },
    { name: 'LED Panel Strip', sku: 'LED-340' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * 4)];
    const item = status === 'occupied' || status === 'inprogress'
      ? { ...items[Math.floor(Math.random() * items.length)], quantity: Math.floor(Math.random() * 50) + 1, lastUpdated: '2026-03-31 14:' + String(Math.floor(Math.random() * 60)).padStart(2, '0') }
      : undefined;
    return {
      id: `${rackId}-${i + 1}`,
      rackId,
      label: `${rackLabel}${i + 1}`,
      status,
      item,
    };
  });
};

export const racks: Rack[] = [
  { id: 'rack-a', label: 'A', slots: generateSlots('rack-a', 'A', 12) },
  { id: 'rack-b', label: 'B', slots: generateSlots('rack-b', 'B', 12) },
  { id: 'rack-c', label: 'C', slots: generateSlots('rack-c', 'C', 12) },
  { id: 'rack-d', label: 'D', slots: generateSlots('rack-d', 'D', 10) },
  { id: 'rack-e', label: 'E', slots: generateSlots('rack-e', 'E', 10) },
  { id: 'rack-f', label: 'F', slots: generateSlots('rack-f', 'F', 8) },
];

export const robots: Robot[] = [
  { id: 'agv-01', name: 'AGV-01', battery: 87, status: 'moving', position: { rack: 'A', slot: 'A3' }, task: 'Picking ORD-2841' },
  { id: 'agv-02', name: 'AGV-02', battery: 45, status: 'charging', position: { rack: 'F', slot: 'F1' } },
  { id: 'agv-03', name: 'AGV-03', battery: 92, status: 'idle', position: { rack: 'C', slot: 'C7' } },
  { id: 'amr-01', name: 'AMR-01', battery: 68, status: 'moving', position: { rack: 'B', slot: 'B5' }, task: 'Picking ORD-2843' },
  { id: 'amr-02', name: 'AMR-02', battery: 12, status: 'error', position: { rack: 'D', slot: 'D2' } },
];

export const orders: Order[] = [
  { id: '1', orderId: 'ORD-2841', items: [{ sku: 'WDG-001', name: 'Widget Pro X1', quantity: 5 }], status: 'picking', assignedRobot: 'AGV-01', progress: 60, createdAt: '2026-03-31 09:14' },
  { id: '2', orderId: 'ORD-2842', items: [{ sku: 'SNS-042', name: 'Sensor Module V3', quantity: 12 }], status: 'pending', progress: 0, createdAt: '2026-03-31 10:22' },
  { id: '3', orderId: 'ORD-2843', items: [{ sku: 'MTR-118', name: 'Motor Assembly K7', quantity: 3 }, { sku: 'BRG-620', name: 'Bearing Set 6205', quantity: 20 }], status: 'picking', assignedRobot: 'AMR-01', progress: 35, createdAt: '2026-03-31 11:05' },
  { id: '4', orderId: 'ORD-2844', items: [{ sku: 'PCB-203', name: 'PCB Board Alpha', quantity: 8 }], status: 'completed', progress: 100, createdAt: '2026-03-31 07:30' },
  { id: '5', orderId: 'ORD-2845', items: [{ sku: 'HYD-055', name: 'Hydraulic Valve T2', quantity: 2 }], status: 'pending', progress: 0, createdAt: '2026-03-31 12:18' },
];

export const inventoryItems: InventoryItem[] = [
  { sku: 'WDG-001', name: 'Widget Pro X1', rack: 'A', slot: 'A3', quantity: 42, status: 'in-stock', category: 'Widgets' },
  { sku: 'SNS-042', name: 'Sensor Module V3', rack: 'A', slot: 'A7', quantity: 8, status: 'low-stock', category: 'Electronics' },
  { sku: 'MTR-118', name: 'Motor Assembly K7', rack: 'B', slot: 'B2', quantity: 15, status: 'in-stock', category: 'Motors' },
  { sku: 'PCB-203', name: 'PCB Board Alpha', rack: 'B', slot: 'B9', quantity: 0, status: 'out-of-stock', category: 'Electronics' },
  { sku: 'HYD-055', name: 'Hydraulic Valve T2', rack: 'C', slot: 'C4', quantity: 33, status: 'in-stock', category: 'Hydraulics' },
  { sku: 'BRG-620', name: 'Bearing Set 6205', rack: 'C', slot: 'C11', quantity: 120, status: 'in-stock', category: 'Mechanical' },
  { sku: 'CBL-099', name: 'Cable Harness C9', rack: 'D', slot: 'D5', quantity: 4, status: 'low-stock', category: 'Electrical' },
  { sku: 'LED-340', name: 'LED Panel Strip', rack: 'E', slot: 'E3', quantity: 67, status: 'in-stock', category: 'Lighting' },
];
