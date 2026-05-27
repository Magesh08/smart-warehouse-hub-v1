export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'recording';
  detections: { type: string; confidence: number; bbox: { x: number; y: number; w: number; h: number } }[];
}

export interface EnvironmentSensor {
  id: string;
  zone: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  type: 'move' | 'pick' | 'inbound' | 'robot' | 'system' | 'alert';
}

export interface SmartAlert {
  id: string;
  type: 'low-stock' | 'robot-error' | 'wrong-placement' | 'overflow' | 'battery-low' | 'temperature' | 'maintenance';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface RobotHealthRecord {
  id: string;
  robotId: string;
  date: string;
  battery: number;
  temperature: number;
  errorCount: number;
  uptime: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  type: 'cold-chain' | 'fast-moving' | 'heavy' | 'fragile' | 'standard';
  icon: string;
  count: number;
  requirements: string;
}

export const cameras: CameraFeed[] = [
  {
    id: 'cam-01', name: 'Entrance Gate', location: 'Zone A - Entry', status: 'online',
    detections: [
      { type: 'Box', confidence: 0.94, bbox: { x: 120, y: 80, w: 160, h: 120 } },
      { type: 'Pallet', confidence: 0.87, bbox: { x: 340, y: 150, w: 200, h: 140 } },
    ],
  },
  {
    id: 'cam-02', name: 'Rack Aisle A-B', location: 'Zone A - Aisle 1', status: 'recording',
    detections: [
      { type: 'Robot AGV-01', confidence: 0.98, bbox: { x: 200, y: 200, w: 100, h: 80 } },
      { type: 'Worker', confidence: 0.91, bbox: { x: 400, y: 100, w: 80, h: 180 } },
    ],
  },
  {
    id: 'cam-03', name: 'Loading Dock', location: 'Zone C - Dock 2', status: 'online',
    detections: [
      { type: 'Truck', confidence: 0.96, bbox: { x: 50, y: 50, w: 350, h: 250 } },
    ],
  },
  {
    id: 'cam-04', name: 'Cold Storage', location: 'Zone D - Freezer', status: 'online',
    detections: [],
  },
  {
    id: 'cam-05', name: 'Packing Station', location: 'Zone B - Pack 1', status: 'offline',
    detections: [],
  },
  {
    id: 'cam-06', name: 'Exit Gate', location: 'Zone C - Exit', status: 'recording',
    detections: [
      { type: 'Barcode', confidence: 0.99, bbox: { x: 280, y: 160, w: 100, h: 60 } },
    ],
  },
];

export const environmentSensors: EnvironmentSensor[] = [
  { id: 'env-01', zone: 'Zone A - General', temperature: 22.4, humidity: 45, lightLevel: 85, status: 'normal' },
  { id: 'env-02', zone: 'Zone B - Electronics', temperature: 21.8, humidity: 38, lightLevel: 90, status: 'normal' },
  { id: 'env-03', zone: 'Zone C - Loading', temperature: 26.1, humidity: 52, lightLevel: 70, status: 'warning' },
  { id: 'env-04', zone: 'Zone D - Cold Storage', temperature: -18.2, humidity: 25, lightLevel: 60, status: 'normal' },
  { id: 'env-05', zone: 'Zone E - Hazmat', temperature: 19.5, humidity: 30, lightLevel: 95, status: 'normal' },
  { id: 'env-06', zone: 'Zone F - Overflow', temperature: 28.7, humidity: 65, lightLevel: 55, status: 'critical' },
];

export const activityLogs: ActivityLog[] = [
  { id: '1', timestamp: '2026-03-31 14:52', user: 'Magesh K.', action: 'Moved item', target: 'WDG-001 → Rack B2', details: 'Widget Pro X1 relocated for order picking', type: 'move' },
  { id: '2', timestamp: '2026-03-31 14:48', user: 'AGV-01', action: 'Picked item', target: 'SNS-042 from A7', details: 'Order ORD-2841 picking in progress', type: 'robot' },
  { id: '3', timestamp: '2026-03-31 14:45', user: 'System', action: 'Low stock alert', target: 'CBL-099', details: 'Cable Harness C9 below threshold (4 units)', type: 'alert' },
  { id: '4', timestamp: '2026-03-31 14:40', user: 'Priya S.', action: 'Inbound received', target: '50x LED-340', details: 'LED Panel Strip bulk inbound at Dock 2', type: 'inbound' },
  { id: '5', timestamp: '2026-03-31 14:35', user: 'AMR-01', action: 'Completed pick', target: 'ORD-2843', details: 'Motor Assembly K7 delivered to packing', type: 'robot' },
  { id: '6', timestamp: '2026-03-31 14:30', user: 'System', action: 'Temperature warning', target: 'Zone F', details: 'Temperature exceeds 28°C threshold', type: 'alert' },
  { id: '7', timestamp: '2026-03-31 14:25', user: 'Ravi M.', action: 'Moved item', target: 'PCB-203 → Rack C1', details: 'PCB Board Alpha restocked from returns', type: 'move' },
  { id: '8', timestamp: '2026-03-31 14:20', user: 'AGV-02', action: 'Charging started', target: 'Station F1', details: 'Battery at 12%, auto-charging initiated', type: 'robot' },
  { id: '9', timestamp: '2026-03-31 14:15', user: 'System', action: 'Robot error', target: 'AMR-02', details: 'Navigation sensor malfunction at D2', type: 'alert' },
  { id: '10', timestamp: '2026-03-31 14:10', user: 'Anita J.', action: 'Picked item', target: 'HYD-055 from C4', details: 'Manual pick for express order', type: 'pick' },
];

export const smartAlerts: SmartAlert[] = [
  { id: '1', type: 'low-stock', severity: 'warning', title: 'Low Stock: Cable Harness C9', message: 'Only 4 units remaining. Reorder threshold: 10', timestamp: '2026-03-31 14:45', read: false },
  { id: '2', type: 'robot-error', severity: 'critical', title: 'AMR-02 Navigation Error', message: 'Sensor malfunction detected at Rack D. Robot halted.', timestamp: '2026-03-31 14:15', read: false },
  { id: '3', type: 'battery-low', severity: 'warning', title: 'AGV-02 Battery Critical', message: 'Battery at 12%. Auto-routing to charging station.', timestamp: '2026-03-31 14:20', read: true },
  { id: '4', type: 'temperature', severity: 'critical', title: 'Zone F Temperature Alert', message: 'Temperature 28.7°C exceeds safe threshold of 26°C', timestamp: '2026-03-31 14:30', read: false },
  { id: '5', type: 'overflow', severity: 'info', title: 'Rack E Near Capacity', message: 'Rack E at 90% capacity. Consider redistribution.', timestamp: '2026-03-31 13:50', read: true },
  { id: '6', type: 'maintenance', severity: 'warning', title: 'AGV-01 Maintenance Due', message: 'Scheduled maintenance in 3 days. 847 operating hours.', timestamp: '2026-03-31 12:00', read: true },
  { id: '7', type: 'wrong-placement', severity: 'warning', title: 'Wrong Slot Placement', message: 'Cold-chain item detected in Zone A (non-refrigerated)', timestamp: '2026-03-31 11:30', read: false },
];

export const robotHealthHistory: RobotHealthRecord[] = [
  { id: '1', robotId: 'agv-01', date: '03/25', battery: 92, temperature: 35, errorCount: 0, uptime: 98 },
  { id: '2', robotId: 'agv-01', date: '03/26', battery: 88, temperature: 37, errorCount: 1, uptime: 95 },
  { id: '3', robotId: 'agv-01', date: '03/27', battery: 90, temperature: 36, errorCount: 0, uptime: 99 },
  { id: '4', robotId: 'agv-01', date: '03/28', battery: 85, temperature: 38, errorCount: 0, uptime: 97 },
  { id: '5', robotId: 'agv-01', date: '03/29', battery: 87, temperature: 36, errorCount: 2, uptime: 93 },
  { id: '6', robotId: 'agv-01', date: '03/30', battery: 91, temperature: 35, errorCount: 0, uptime: 99 },
  { id: '7', robotId: 'agv-01', date: '03/31', battery: 87, temperature: 37, errorCount: 0, uptime: 96 },
];

export const productCategories: ProductCategory[] = [
  { id: '1', name: 'Cold Chain Products', type: 'cold-chain', icon: '❄️', count: 24, requirements: 'Temp: -20°C to 4°C · Zone D only' },
  { id: '2', name: 'Fast Moving Items', type: 'fast-moving', icon: '⚡', count: 48, requirements: 'Priority picking · Near loading dock' },
  { id: '3', name: 'Heavy Equipment', type: 'heavy', icon: '🏋️', count: 15, requirements: 'Ground level only · Max 500kg per slot' },
  { id: '4', name: 'Fragile Goods', type: 'fragile', icon: '🔶', count: 32, requirements: 'Top shelf prohibited · Special handling' },
  { id: '5', name: 'Standard Items', type: 'standard', icon: '📦', count: 95, requirements: 'Any zone · Standard handling' },
];
