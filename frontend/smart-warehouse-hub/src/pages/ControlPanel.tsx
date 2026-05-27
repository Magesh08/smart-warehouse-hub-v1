import { motion } from "framer-motion";
import { useState } from "react";
import { Lightbulb, AlertTriangle, RotateCw, Thermometer, Gauge, Wifi } from "lucide-react";

interface ToggleControl {
  id: string;
  label: string;
  icon: typeof Lightbulb;
  description: string;
}

const controls: ToggleControl[] = [
  { id: 'conveyor', label: 'Conveyor Belt', icon: RotateCw, description: 'Main conveyor system A-1' },
  { id: 'lights', label: 'Zone Lights', icon: Lightbulb, description: 'Warehouse lighting zones 1-4' },
  { id: 'alarm', label: 'Alarm System', icon: AlertTriangle, description: 'Perimeter security alarm' },
];

const sensors = [
  { label: 'Zone A Temp', value: '22.4°C', icon: Thermometer, status: 'normal' },
  { label: 'Zone B Temp', value: '24.1°C', icon: Thermometer, status: 'normal' },
  { label: 'Air Pressure', value: '1013 hPa', icon: Gauge, status: 'normal' },
  { label: 'Network', value: '142ms', icon: Wifi, status: 'normal' },
];

export default function ControlPanel() {
  const [states, setStates] = useState<Record<string, boolean>>({ conveyor: true, lights: true, alarm: false });

  const toggle = (id: string) => setStates(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Control Panel</h1>
        <p className="text-sm text-muted-foreground">Facility systems management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {controls.map((ctrl, i) => {
          const on = states[ctrl.id];
          return (
            <motion.div
              key={ctrl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`stat-card cursor-pointer transition-all ${on ? 'border-primary/30 glow-accent' : ''}`}
              onClick={() => toggle(ctrl.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${on ? 'bg-primary/20' : 'bg-secondary'}`}>
                  <ctrl.icon className={`w-5 h-5 ${on ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${on ? 'bg-primary' : 'bg-secondary'}`}>
                  <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">{ctrl.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ctrl.description}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${on ? 'bg-slot-empty animate-pulse' : 'bg-muted-foreground/30'}`} />
                <span className={`text-[11px] font-medium ${on ? 'text-slot-empty' : 'text-muted-foreground'}`}>
                  {on ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Sensor Readings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sensors.map(sensor => (
            <div key={sensor.label} className="rounded-lg bg-secondary/30 p-3 text-center">
              <sensor.icon className="w-4 h-4 text-primary mx-auto mb-2" />
              <p className="text-lg font-bold font-mono text-foreground">{sensor.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{sensor.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
