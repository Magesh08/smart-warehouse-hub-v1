import { robots } from "@/data/warehouse";
import { motion } from "framer-motion";
import { Bot, Battery, MapPin, Play, Square, AlertOctagon, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const statusStyle: Record<string, { dot: string; label: string }> = {
  idle: { dot: 'bg-slot-empty', label: 'Idle' },
  moving: { dot: 'bg-slot-inprogress animate-pulse', label: 'Moving' },
  charging: { dot: 'bg-slot-reserved', label: 'Charging' },
  error: { dot: 'bg-destructive animate-pulse', label: 'Error' },
};

export default function Robots() {
  const [eStop, setEStop] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Robot Control</h1>
          <p className="text-sm text-muted-foreground">AGV / AMR Fleet Management</p>
        </div>
        <Button
          onClick={() => setEStop(!eStop)}
          className={`gap-2 ${eStop ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-destructive/10 hover:bg-destructive/20 text-destructive'}`}
          size="sm"
        >
          <AlertOctagon className="w-4 h-4" />
          {eStop ? 'E-STOP ACTIVE' : 'Emergency Stop'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {robots.map((robot, i) => {
          const s = statusStyle[robot.status];
          return (
            <motion.div
              key={robot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`stat-card ${robot.status === 'error' ? 'border-destructive/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className={`w-5 h-5 text-primary ${robot.status === 'moving' ? 'animate-robot-move' : ''}`} />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-foreground">{robot.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Battery className="w-3.5 h-3.5" /> Battery
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full rounded-full ${robot.battery > 50 ? 'bg-slot-empty' : robot.battery > 20 ? 'bg-slot-reserved' : 'bg-destructive'}`} style={{ width: `${robot.battery}%` }} />
                    </div>
                    <span className="text-xs font-mono text-foreground">{robot.battery}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> Position
                  </div>
                  <span className="text-xs font-mono text-foreground">{robot.position.rack} · {robot.position.slot}</span>
                </div>
                {robot.task && (
                  <div className="text-xs text-primary bg-primary/5 rounded-md px-2 py-1.5 font-mono">{robot.task}</div>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8">
                  <Play className="w-3 h-3" /> Start
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8">
                  <Square className="w-3 h-3" /> Stop
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8">
                  <Navigation className="w-3 h-3" /> Send
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
