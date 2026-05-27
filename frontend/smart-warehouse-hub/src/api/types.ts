export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

// ── Inventory Types ──────────────────────────────────────────────

export type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description?: string;
  rack: string;
  slot: string;
  quantity: number;
  min_stock_level: number; // mapped from backend database snake_case
  category: string;
  status: InventoryStatus;
  tags: string[];
  value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItemCreate {
  sku: string;
  name: string;
  description?: string;
  rack: string;
  slot: string;
  quantity: number;
  min_stock_level: number;
  category: string;
  tags?: string[];
  value?: number;
}

export interface InventoryItemUpdate {
  sku?: string;
  name?: string;
  description?: string;
  rack?: string;
  slot?: string;
  quantity?: number;
  min_stock_level?: number;
  category?: string;
  tags?: string[];
  value?: number;
  status?: InventoryStatus;
}

export interface InventoryStats {
  totalSkus: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValuation: number;
  categories: string[];
}


// ── Order Types ──────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'picking' | 'completed' | 'cancelled';

export interface OrderItem {
  id: number;
  sku: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: number;
  orderId: string; // mapped via alias from order_id
  status: OrderStatus;
  assignedRobot?: string; // mapped via alias from assigned_robot
  progress: number;
  notes?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderCreate {
  orderId: string;
  items: { sku: string; name: string; quantity: number }[];
  notes?: string;
}

export interface OrderUpdate {
  assignedRobot?: string;
  progress?: number;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingCount: number;
  pickingCount: number;
  completedCount: number;
  cancelledCount: number;
  ordersToday: number;
  averageProgress: number;
}


// ── User & Auth Types ────────────────────────────────────────────

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface UserLogin {
  username: string;
  password: string;
}


// ── Dashboard Types ──────────────────────────────────────────────

export interface RecentActivity {
  id: number;
  channel: string;
  message: string;
  eventType: string;
  timestamp: string;
}

export interface DashboardData {
  inventory: {
    totalSkus: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    categoriesCount: number;
  };
  orders: {
    totalToday: number;
    pending: number;
    picking: number;
    completed: number;
    cancelled: number;
  };
  system: {
    dbStatus: string;
    uptimeSeconds: number;
    uptimeHuman: string;
    timestamp: number;
  };
  recentActivity: RecentActivity[];
}
