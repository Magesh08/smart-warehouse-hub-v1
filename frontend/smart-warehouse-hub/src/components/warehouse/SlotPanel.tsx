import { X, PackagePlus, Hand, ArrowRightLeft } from "lucide-react";
import { Slot } from "@/data/warehouse";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SlotPanelProps {
  slot: Slot | null;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  empty: "Empty",
  occupied: "Occupied",
  reserved: "Reserved",
  inprogress: "In Progress",
};

export function SlotPanel({ slot, onClose }: SlotPanelProps) {
  return (
    <AnimatePresence>
      {slot && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-80 glass-panel border-l border-border/50 z-50 flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div>
              <h3 className="font-bold text-foreground text-lg">Slot {slot.label}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full slot-${slot.status}`} />
                <span className="text-xs text-muted-foreground">{statusLabels[slot.status]}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-5 overflow-auto">
            {slot.item ? (
              <>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Item Name</p>
                    <p className="text-sm font-medium text-foreground">{slot.item.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">SKU</p>
                    <p className="text-sm font-mono text-primary">{slot.item.sku}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Quantity</p>
                    <p className="text-sm font-medium text-foreground">{slot.item.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Last Updated</p>
                    <p className="text-sm text-muted-foreground">{slot.item.lastUpdated}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-slot-empty/10 flex items-center justify-center mb-3">
                  <PackagePlus className="w-6 h-6 text-slot-empty" />
                </div>
                <p className="text-sm text-muted-foreground">This slot is available</p>
              </div>
            )}
          </div>

          <div className="p-4 space-y-2 border-t border-border/50">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="sm">
              <PackagePlus className="w-4 h-4" /> Inbound Product
            </Button>
            {slot.item && (
              <>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Hand className="w-4 h-4" /> Pick Item
                </Button>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <ArrowRightLeft className="w-4 h-4" /> Move Item
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
