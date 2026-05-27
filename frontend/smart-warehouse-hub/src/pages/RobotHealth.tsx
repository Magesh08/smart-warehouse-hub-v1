import { robots } from "@/data/warehouse";
import { robotHealthHistory } from "@/data/monitoring";
import { motion } from "framer-motion";
import { Bot, Battery, Thermometer, AlertTriangle, Wrench, Activity, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

const maintenanceSchedule = [
  { robot: 'AGV-01', task: 'Motor inspection', dueIn: '3 days', priority: 'warning' },
  { robot: 'AGV-02', task: 'Battery replacement', dueIn: '1 day', priority: 'critical' },
  { robot: 'AMR-01', task: 'Sensor calibration', dueIn: '7 days', priority: 'info' },
  { robot: 'AMR-02', task: 'Full diagnostic', dueIn: 'Overdue', priority: 'critical' },
  { robot: 'AGV-03', task: 'Wheel alignment', dueIn: '14 days', priority: 'info' },
];

const errorLogs = [
  { time: '14:15', robot: 'AMR-02', error: 'Navigation sensor malfunction', severity: 'critical' },
  { time: '13:42', robot: 'AGV-01', error: 'Minor path deviation corrected', severity: 'warning' },
  { time: '12:30', robot: 'AGV-02', error: 'Low battery auto-shutdown', severity: 'warning' },
  { time: '11:15', robot: 'AMR-01', error: 'Communication timeout (recovered)', severity: 'info' },
  { time: '09:20', robot: 'AGV-01', error: 'Obstacle detected — rerouted', severity: 'info' },
];

const priorityStyle: Record<string, string> = {
  critical: 'text-destructive bg-destructive/10 border-destructive/20',
  warning: 'text-slot-reserved bg-slot-reserved/10 border-slot-reserved/20',
  info: 'text-primary bg-primary/10 border-primary/20',
};

export default function RobotHealth() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Robot Health Monitor</h1>
        <p className="text-sm text-muted-foreground">Fleet diagnostics · Predictive maintenance</p>
      </div>

      {/* Robot status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {robots.map((robot, i) => (
          <motion.div
            key={robot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`stat-card ${robot.status === 'error' ? 'border-destructive/30' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Bot className={`w-4 h-4 ${robot.status === 'error' ? 'text-destructive' : 'text-primary'}`} />
              <span className="font-mono font-bold text-sm text-foreground">{robot.name}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Battery className="w-3 h-3" /> Battery</span>
                <span className={`text-xs font-mono font-bold ${robot.battery > 50 ? 'text-slot-empty' : robot.battery > 20 ? 'text-slot-reserved' : 'text-destructive'}`}>{robot.battery}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${robot.battery > 50 ? 'bg-slot-empty' : robot.battery > 20 ? 'bg-slot-reserved' : 'bg-destructive'}`} style={{ width: `${robot.battery}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp</span>
                <span className="text-xs font-mono text-foreground">{(35 + Math.random() * 5).toFixed(1)}°C</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Battery history chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> AGV-01 Battery Trend (7d)
          </h3>
          <p className="text-[10px] text-muted-foreground mb-4">Daily peak battery level</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={robotHealthHistory}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(222 22% 9%)', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', fontSize: '11px' }} />
              <Line type="monotone" dataKey="battery" stroke="hsl(145, 65%, 42%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(145, 65%, 42%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Uptime chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="stat-card">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> AGV-01 Uptime % (7d)
          </h3>
          <p className="text-[10px] text-muted-foreground mb-4">Daily operational uptime</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={robotHealthHistory}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(222 22% 9%)', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', fontSize: '11px' }} />
              <Bar dataKey="uptime" fill="hsl(190, 95%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Error logs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="stat-card">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slot-reserved" /> Error Logs Today
          </h3>
          <div className="space-y-2">
            {errorLogs.map((log, i) => (
              <div key={i} className={`flex items-start gap-3 p-2 rounded-lg border ${priorityStyle[log.severity]}`}>
                <span className="text-[10px] font-mono mt-0.5 opacity-70">{log.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{log.error}</p>
                  <p className="text-[10px] opacity-70">{log.robot}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Maintenance schedule */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="stat-card">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" /> Maintenance Schedule
          </h3>
          <div className="space-y-2">
            {maintenanceSchedule.map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${priorityStyle[item.priority]}`}>
                <div>
                  <p className="text-xs font-bold">{item.robot}</p>
                  <p className="text-[10px] opacity-70">{item.task}</p>
                </div>
                <span className="text-[11px] font-mono font-bold">{item.dueIn}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
