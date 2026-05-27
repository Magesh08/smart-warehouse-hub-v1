import { motion } from "framer-motion";
import { Clock, ArrowRight, Bot, AlertTriangle, Package, LogIn, Wrench, Bell, CheckCircle2, RefreshCw, Inbox } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/use-dashboard";

// Static alerts — in a real system these would come from an alerts API
const smartAlerts = [
  {
    id: 1,
    title: 'Low Stock Threshold Breach',
    message: 'SKU SNS-042 dropped below minimum stock level (8 units remaining).',
    severity: 'warning' as const,
    timestamp: new Date(Date.now() - 15 * 60_000).toISOString(),
    read: false,
  },
  {
    id: 2,
    title: 'Robot Navigation Fault',
    message: 'AMR-02 reported a navigation fault at sector C-11. Manual intervention required.',
    severity: 'critical' as const,
    timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
    read: false,
  },
  {
    id: 3,
    title: 'Inbound Shipment Received',
    message: '50x BRG-620 bearings received and staged at docking bay 3.',
    severity: 'info' as const,
    timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
    read: true,
  },
  {
    id: 4,
    title: 'Daily Efficiency Target Met',
    message: 'Warehouse efficiency reached 96.2%, exceeding today\'s target of 92%.',
    severity: 'info' as const,
    timestamp: new Date(Date.now() - 4 * 3600_000).toISOString(),
    read: true,
  },
];

const eventTypeConfig: Record<string, { icon: React.ReactNode; colorClass: string; label: string }> = {
  'inventory.created': {
    icon: <Package className="w-3.5 h-3.5" />,
    colorClass: 'bg-slot-empty/10 text-slot-empty border-slot-empty/20',
    label: 'Created',
  },
  'inventory.updated': {
    icon: <ArrowRight className="w-3.5 h-3.5" />,
    colorClass: 'bg-primary/10 text-primary border-primary/20',
    label: 'Updated',
  },
  'inventory.deleted': {
    icon: <Wrench className="w-3.5 h-3.5" />,
    colorClass: 'bg-destructive/10 text-destructive border-destructive/20',
    label: 'Deleted',
  },
  'order.created': {
    icon: <LogIn className="w-3.5 h-3.5" />,
    colorClass: 'bg-slot-reserved/10 text-slot-reserved border-slot-reserved/20',
    label: 'Order',
  },
  'order.status_updated': {
    icon: <ArrowRight className="w-3.5 h-3.5" />,
    colorClass: 'bg-slot-inprogress/10 text-slot-inprogress border-slot-inprogress/20',
    label: 'Status',
  },
  'order.dispatched': {
    icon: <Bot className="w-3.5 h-3.5" />,
    colorClass: 'bg-primary/10 text-primary border-primary/20',
    label: 'Dispatched',
  },
};

const defaultEventConfig = {
  icon: <Wrench className="w-3.5 h-3.5" />,
  colorClass: 'bg-muted text-muted-foreground border-border',
  label: 'Event',
};

const severityColor: Record<string, string> = {
  info: 'border-primary/30 bg-primary/5',
  warning: 'border-slot-reserved/30 bg-slot-reserved/5',
  critical: 'border-destructive/30 bg-destructive/5',
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return date.toLocaleDateString();
}

export default function ActivityTimeline() {
  const [tab, setTab] = useState<'timeline' | 'alerts'>('timeline');
  const { data: dashData, isLoading, refetch, isFetching } = useDashboardData();

  const activity = dashData?.recentActivity ?? [];
  const unreadAlerts = smartAlerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity & Alerts</h1>
          <p className="text-sm text-muted-foreground">Live MQTT event stream · Smart notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
            <Button size="sm" variant={tab === 'timeline' ? 'default' : 'ghost'} onClick={() => setTab('timeline')} className="h-7 text-xs gap-1">
              <Clock className="w-3 h-3" /> Timeline
            </Button>
            <Button size="sm" variant={tab === 'alerts' ? 'default' : 'ghost'} onClick={() => setTab('alerts')} className="h-7 text-xs gap-1 relative">
              <Bell className="w-3 h-3" /> Alerts
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                  {unreadAlerts}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {tab === 'timeline' ? (
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50" />

          {isLoading ? (
            <div className="space-y-3 pl-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Inbox className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No events yet</p>
              <p className="text-xs text-muted-foreground mt-1">Events will appear here when inventory or orders are modified.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activity.map((log, i) => {
                const config = eventTypeConfig[log.eventType] ?? defaultEventConfig;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative flex items-start gap-4 pl-10 py-3 rounded-lg hover:bg-secondary/20 transition-colors"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 ${config.colorClass} bg-card`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.colorClass}`}>
                          {config.icon} {config.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">
                          #{log.channel}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground">{log.eventType}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{log.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {smartAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`stat-card border ${severityColor[alert.severity]} ${alert.read ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-destructive/20' :
                    alert.severity === 'warning' ? 'bg-slot-reserved/20' : 'bg-primary/20'
                  }`}>
                    {alert.severity === 'critical' ? (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    ) : alert.severity === 'warning' ? (
                      <Bell className="w-4 h-4 text-slot-reserved" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                </div>
                {!alert.read && <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0 mt-1" />}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
