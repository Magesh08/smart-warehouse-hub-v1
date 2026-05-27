import { useState } from "react";
import { cameras } from "@/data/monitoring";
import { motion } from "framer-motion";
import { Camera, Circle, Scan, Video, VideoOff, Maximize2, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusBadge: Record<string, { color: string; label: string }> = {
  online: { color: 'bg-slot-empty', label: 'Live' },
  recording: { color: 'bg-slot-occupied animate-pulse', label: 'REC' },
  offline: { color: 'bg-muted-foreground', label: 'Offline' },
};

export default function CameraVision() {
  const [selectedCam, setSelectedCam] = useState(cameras[0].id);
  const [scanMode, setScanMode] = useState(false);
  const activeCam = cameras.find(c => c.id === selectedCam)!;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Camera & Vision</h1>
          <p className="text-sm text-muted-foreground">AI-powered visual monitoring · Object detection</p>
        </div>
        <Button
          size="sm"
          variant={scanMode ? "default" : "outline"}
          onClick={() => setScanMode(!scanMode)}
          className="gap-2"
        >
          <Scan className="w-4 h-4" />
          {scanMode ? 'Scanning...' : 'Barcode Scan'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2">
          <motion.div
            key={activeCam.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="stat-card relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-foreground text-sm">{activeCam.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-foreground ${statusBadge[activeCam.status].color}`}>
                  {statusBadge[activeCam.status].label}
                </span>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7"><ZoomIn className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7"><Maximize2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            {/* Simulated camera feed */}
            <div className="relative aspect-video bg-secondary/30 rounded-lg border border-border/50 overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              
              {/* Scan lines effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" />

              {/* Camera info overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <Circle className="w-2.5 h-2.5 text-slot-occupied fill-slot-occupied animate-pulse" />
                <span className="text-[10px] font-mono text-foreground/70">{activeCam.location}</span>
              </div>
              <div className="absolute top-3 right-3 text-[10px] font-mono text-foreground/50">
                {new Date().toLocaleTimeString()}
              </div>

              {/* AI Detection Boxes */}
              {activeCam.detections.map((det, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="absolute border-2 border-primary rounded-sm"
                  style={{
                    left: `${(det.bbox.x / 640) * 100}%`,
                    top: `${(det.bbox.y / 360) * 100}%`,
                    width: `${(det.bbox.w / 640) * 100}%`,
                    height: `${(det.bbox.h / 360) * 100}%`,
                  }}
                >
                  <div className="absolute -top-5 left-0 bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded text-[9px] font-mono font-bold whitespace-nowrap">
                    {det.type} · {(det.confidence * 100).toFixed(0)}%
                  </div>
                  {/* Corner markers */}
                  <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-primary" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-primary" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-primary" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-primary" />
                </motion.div>
              ))}

              {/* Barcode scan overlay */}
              {scanMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-48 h-32 border-2 border-dashed border-slot-reserved rounded-lg flex items-center justify-center">
                    <div className="w-44 h-0.5 bg-slot-occupied animate-pulse" />
                  </div>
                  <span className="absolute bottom-4 text-xs font-mono text-slot-reserved">Align barcode within frame</span>
                </motion.div>
              )}

              {activeCam.status === 'offline' && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
                  <div className="text-center">
                    <VideoOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Camera Offline</p>
                  </div>
                </div>
              )}

              {/* No detections */}
              {activeCam.detections.length === 0 && activeCam.status !== 'offline' && (
                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground">
                  No objects detected
                </div>
              )}
            </div>

            {/* Detection summary */}
            {activeCam.detections.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeCam.detections.map((det, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[11px] font-mono text-foreground">{det.type}</span>
                    <span className="text-[10px] text-muted-foreground">{(det.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Camera list */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">All Cameras</h3>
          {cameras.map((cam, i) => {
            const badge = statusBadge[cam.status];
            return (
              <motion.button
                key={cam.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedCam(cam.id)}
                className={`w-full text-left stat-card cursor-pointer transition-all ${selectedCam === cam.id ? 'ring-1 ring-primary border-primary/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {cam.status === 'offline' ? (
                      <VideoOff className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span className="text-xs font-bold text-foreground">{cam.name}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${badge.color}`} />
                </div>
                <p className="text-[10px] text-muted-foreground">{cam.location}</p>
                {cam.detections.length > 0 && (
                  <p className="text-[10px] text-primary mt-1">{cam.detections.length} detection{cam.detections.length > 1 ? 's' : ''}</p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
