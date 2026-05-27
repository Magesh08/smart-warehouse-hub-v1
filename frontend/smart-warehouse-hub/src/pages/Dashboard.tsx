import { Package, Bot, ShoppingCart, TrendingUp, AlertTriangle, Clock, Activity, Zap, Battery, Wifi, Server, Database, Settings, ShieldCheck, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useDashboardData } from "@/hooks/use-dashboard";
import { useInventoryItems } from "@/hooks/use-inventory";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";

const rackUtilizationPlaceholder = [
  { rack: 'A', usage: 75 },
  { rack: 'B', usage: 60 },
  { rack: 'C', usage: 90 },
  { rack: 'D', usage: 45 },
  { rack: 'E', usage: 82 },
  { rack: 'F', usage: 30 },
];

const orderTrendPlaceholder = [
  { hour: '6am', orders: 2 },
  { hour: '8am', orders: 8 },
  { hour: '10am', orders: 15 },
  { hour: '12pm', orders: 12 },
  { hour: '2pm', orders: 18 },
  { hour: '4pm', orders: 9 },
  { hour: '6pm', orders: 5 },
];

const eventTypeIcon: Record<string, string> = {
  'inventory.created': '📦',
  'inventory.updated': '✏️',
  'inventory.deleted': '🗑️',
  'order.created': '🛒',
  'order.status_updated': '🔄',
  'order.dispatched': '🚀',
  default: '⚡',
};

const eventTypeColor: Record<string, string> = {
  'inventory.created': 'text-slot-empty',
  'inventory.updated': 'text-primary',
  'inventory.deleted': 'text-destructive',
  'order.created': 'text-slot-reserved',
  'order.status_updated': 'text-slot-inprogress',
  'order.dispatched': 'text-primary',
  default: 'text-muted-foreground',
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function Dashboard() {
  const { data: dashData, isLoading, isError, refetch, isFetching } = useDashboardData();
  const { data: items = [] } = useInventoryItems();
  const { data: orders = [] } = useOrders();

  const inv = dashData?.inventory;
  const ord = dashData?.orders;
  const sys = dashData?.system;
  const activity = dashData?.recentActivity ?? [];

  // Calculate rack utilization from live inventory
  const rackMap: Record<string, { total: number; occupied: number }> = {};
  items.forEach(item => {
    if (!rackMap[item.rack]) rackMap[item.rack] = { total: 0, occupied: 0 };
    rackMap[item.rack].total += 1;
    if (item.status !== 'out-of-stock') rackMap[item.rack].occupied += 1;
  });
  const rackUtilization = Object.keys(rackMap).length > 0
    ? Object.entries(rackMap).map(([rack, { total, occupied }]) => ({
        rack,
        usage: total > 0 ? Math.round((occupied / total) * 100) : 0,
      }))
    : rackUtilizationPlaceholder;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time warehouse overview</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Inventory + Order Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total SKUs"
          value={isLoading ? '—' : (inv?.totalSkus ?? 0).toLocaleString()}
          change={isLoading ? '' : `${inv?.inStock ?? 0} in stock`}
          changeType="positive"
          icon={Package}
        />
        <StatCard
          title="Low Stock Items"
          value={isLoading ? '—' : (inv?.lowStock ?? 0)}
          change={isLoading ? '' : `${inv?.outOfStock ?? 0} out of stock`}
          changeType={(inv?.lowStock ?? 0) > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
        />
        <StatCard
          title="Orders Today"
          value={isLoading ? '—' : (ord?.totalToday ?? 0)}
          change={isLoading ? '' : `${ord?.pending ?? 0} pending`}
          changeType="neutral"
          icon={ShoppingCart}
        />
        <StatCard
          title="Categories"
          value={isLoading ? '—' : (inv?.categoriesCount ?? 0)}
          change={isLoading ? '' : `${ord?.completed ?? 0} orders done`}
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-primary"
        />
      </div>

      {/* System Power Metrics (static for now, IoT integration point) */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Power Information
          <span className="text-xs font-normal text-muted-foreground ml-auto flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {sys ? `Uptime: ${formatUptime(sys.uptimeSeconds)}` : 'Loading...'}
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Voltage" value="1 V" icon={Activity} />
          <StatCard title="Current" value="1 A" icon={Activity} />
          <StatCard title="Power" value="1 kW" icon={Zap} />
          <StatCard title="Energy" value="1 kWh" icon={Battery} />
        </div>
      </div>

      {/* Quick Actions + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
             <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
               <Bot className="w-5 h-5 mb-2" />
               <span className="text-xs font-medium">Deploy Robot</span>
             </button>
             <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
               <AlertTriangle className="w-5 h-5 mb-2" />
               <span className="text-xs font-medium">Emergency Stop</span>
             </button>
             <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-slot-reserved/10 text-slot-reserved hover:bg-slot-reserved hover:text-primary-foreground transition-colors">
               <Package className="w-5 h-5 mb-2" />
               <span className="text-xs font-medium">Restock Request</span>
             </button>
             <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
               <Settings className="w-5 h-5 mb-2" />
               <span className="text-xs font-medium">System Config</span>
             </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">System Health</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground flex items-center gap-2"><Wifi className="w-4 h-4 text-primary" /> Backend API</span>
               <span className={`text-sm font-semibold ${isError ? 'text-destructive' : 'text-slot-empty'}`}>
                 {isLoading ? 'Checking...' : isError ? 'Unreachable' : 'Online'}
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground flex items-center gap-2"><Server className="w-4 h-4 text-primary" /> Uptime</span>
               <span className="text-sm font-semibold text-slot-empty">
                 {sys ? formatUptime(sys.uptimeSeconds) : '—'}
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Database</span>
               <span className={`text-sm font-semibold ${sys?.dbStatus === 'ok' ? 'text-slot-empty' : 'text-slot-reserved'}`}>
                 {sys ? (sys.dbStatus === 'ok' ? 'Connected' : sys.dbStatus) : '—'}
               </span>
             </div>
             <div className="flex items-center justify-between pt-2 border-t border-border/50">
               <span className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Secure Connection</span>
               <span className="text-xs text-primary">JWT Active</span>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Rack Utilization (Live)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rackUtilization}>
              <XAxis dataKey="rack" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(220,10%,50%)', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ background: 'hsl(222,22%,9%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="usage" fill="hsl(190,95%,50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={orderTrendPlaceholder}>
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(190,95%,50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(190,95%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: 'hsl(220,10%,50%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(222,22%,9%)', border: '1px solid hsl(222,20%,16%)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="orders" stroke="hsl(190,95%,50%)" fill="url(#orderGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Order Status Breakdown + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: ord?.pending ?? 0, color: 'bg-slot-reserved', total: ord?.totalToday ?? 1 },
              { label: 'Picking', value: ord?.picking ?? 0, color: 'bg-slot-inprogress', total: ord?.totalToday ?? 1 },
              { label: 'Completed', value: ord?.completed ?? 0, color: 'bg-slot-empty', total: ord?.totalToday ?? 1 },
              { label: 'Cancelled', value: ord?.cancelled ?? 0, color: 'bg-destructive', total: ord?.totalToday ?? 1 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20">{item.label}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs font-mono text-foreground w-8 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="stat-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity (MQTT Events)</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 rounded bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent activity. Events will appear here as they occur.</p>
          ) : (
            <div className="space-y-2">
              {activity.slice(0, 6).map((log) => {
                const icon = eventTypeIcon[log.eventType] ?? eventTypeIcon.default;
                const color = eventTypeColor[log.eventType] ?? eventTypeColor.default;
                return (
                  <div key={log.id} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-base leading-none mt-0.5">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${color} truncate`}>{log.eventType}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{log.message}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
