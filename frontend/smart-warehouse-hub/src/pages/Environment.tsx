import { environmentSensors, productCategories } from "@/data/monitoring";
import { motion } from "framer-motion";
import { Thermometer, Droplets, Sun, AlertTriangle, Snowflake, Zap, Weight, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const statusStyle: Record<string, string> = {
  normal: 'border-slot-empty/30 bg-slot-empty/5',
  warning: 'border-slot-reserved/30 bg-slot-reserved/5',
  critical: 'border-destructive/30 bg-destructive/5',
};

const categoryIcon: Record<string, React.ReactNode> = {
  'cold-chain': <Snowflake className="w-5 h-5 text-primary" />,
  'fast-moving': <Zap className="w-5 h-5 text-slot-reserved" />,
  'heavy': <Weight className="w-5 h-5 text-slot-occupied" />,
  'fragile': <AlertTriangle className="w-5 h-5 text-slot-reserved" />,
  'standard': <Package className="w-5 h-5 text-muted-foreground" />,
};

export default function Environment() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Environment & Products</h1>
        <p className="text-sm text-muted-foreground">IoT sensors · Temperature zones · Product categories</p>
      </div>

      {/* Environment sensors */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Zone Monitoring</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {environmentSensors.map((sensor, i) => (
            <motion.div
              key={sensor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`stat-card border ${statusStyle[sensor.status]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">{sensor.zone}</h3>
                {sensor.status !== 'normal' && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sensor.status === 'critical' ? 'bg-destructive/20 text-destructive' : 'bg-slot-reserved/20 text-slot-reserved'}`}>
                    {sensor.status.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Thermometer className="w-3.5 h-3.5" /> Temperature
                  </div>
                  <span className={`text-sm font-mono font-bold ${sensor.temperature < 0 ? 'text-primary' : sensor.temperature > 27 ? 'text-destructive' : 'text-foreground'}`}>
                    {sensor.temperature}°C
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Droplets className="w-3.5 h-3.5" /> Humidity
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={sensor.humidity} className="w-16 h-1.5" />
                    <span className="text-xs font-mono text-foreground">{sensor.humidity}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sun className="w-3.5 h-3.5" /> Light
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={sensor.lightLevel} className="w-16 h-1.5" />
                    <span className="text-xs font-mono text-foreground">{sensor.lightLevel}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product categories */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Product Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="stat-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  {categoryIcon[cat.type]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{cat.name}</h3>
                  <span className="text-[10px] text-primary font-mono">{cat.count} items</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground bg-secondary/30 rounded-md px-2.5 py-1.5 font-mono">{cat.requirements}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
