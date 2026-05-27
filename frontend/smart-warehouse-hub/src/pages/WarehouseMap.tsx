import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Bot, RefreshCw, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventoryItems } from "@/hooks/use-inventory";
import type { InventoryItem } from "@/api/types";

// ── Types matching SlotPanel expectations ────────────────────────────────────
type SlotStatus = 'empty' | 'occupied' | 'reserved' | 'inprogress';

interface Slot {
  id: string;
  rackId: string;
  label: string;
  status: SlotStatus;
  item?: {
    name: string;
    sku: string;
    quantity: number;
    lastUpdated: string;
  };
}

interface RackGroup {
  id: string;
  label: string;
  slots: Slot[];
}

// Map inventory status → slot status color
function itemToSlotStatus(item: InventoryItem): SlotStatus {
  if (item.status === 'out-of-stock') return 'empty';
  if (item.status === 'low-stock') return 'reserved';
  return 'occupied';
}

// Build rack groups from live inventory items
function buildRacksFromInventory(items: InventoryItem[]): RackGroup[] {
  const rackMap = new Map<string, Map<string, Slot>>();

  items.forEach(item => {
    const rackKey = item.rack;
    if (!rackMap.has(rackKey)) rackMap.set(rackKey, new Map());
    const slots = rackMap.get(rackKey)!;
    const slotId = `${rackKey}-${item.slot}`;
    slots.set(item.slot, {
      id: slotId,
      rackId: rackKey,
      label: item.slot,
      status: itemToSlotStatus(item),
      item: {
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        lastUpdated: item.updated_at ?? item.created_at ?? new Date().toISOString(),
      },
    });
  });

  return Array.from(rackMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rackLabel, slotsMap]) => ({
      id: `rack-${rackLabel}`,
      label: rackLabel,
      slots: Array.from(slotsMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
    }));
}

const statusColors: Record<SlotStatus, string> = {
  empty: 'bg-slot-empty',
  occupied: 'bg-slot-occupied',
  reserved: 'bg-slot-reserved',
  inprogress: 'bg-slot-inprogress',
};

// Inline slot detail panel (replaces SlotPanel which expects old mock types)
function SlotDetailPanel({ slot, onClose }: { slot: Slot; onClose: () => void }) {
  if (!slot) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="stat-card border border-primary/20"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">
          Slot {slot.label} · Rack {slot.rackId}
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors"
        >
          Close ✕
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`w-3 h-3 rounded-sm ${statusColors[slot.status]}`} />
        <span className="text-xs font-semibold capitalize text-foreground">{slot.status}</span>
      </div>

      {slot.item ? (
        <div className="space-y-2.5">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40">
            <Package className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">{slot.item.name}</p>
              <p className="text-xs font-mono text-muted-foreground">{slot.item.sku}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary/30 rounded-lg p-2.5">
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-bold text-foreground text-base">{slot.item.quantity}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2.5">
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-semibold text-foreground">
                {new Date(slot.item.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">This slot is empty.</p>
      )}
    </motion.div>
  );
}

// Placeholder robots (would come from a robots API in a full implementation)
const mockActiveRobots = [
  { id: 'agv-01', name: 'AGV-01', position: { rack: 'A', slot: 'A3' } },
  { id: 'amr-02', name: 'AMR-02', position: { rack: 'C', slot: 'C7' } },
];

export default function WarehouseMap() {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const { data: inventoryItems = [], isLoading, refetch, isFetching } = useInventoryItems();

  const racks = useMemo(() => buildRacksFromInventory(inventoryItems), [inventoryItems]);

  const totalSlots = racks.reduce((s, r) => s + r.slots.length, 0);
  const emptySlots = racks.reduce((s, r) => s + r.slots.filter(sl => sl.status === 'empty').length, 0);
  const lowStockSlots = racks.reduce((s, r) => s + r.slots.filter(sl => sl.status === 'reserved').length, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warehouse Map</h1>
          <p className="text-sm text-muted-foreground">Interactive digital twin · Real-time view from live inventory</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Legend */}
          {([
            { label: 'In Stock', cls: 'bg-slot-occupied' },
            { label: 'Low Stock', cls: 'bg-slot-reserved' },
            { label: 'Empty', cls: 'bg-slot-empty' },
          ] as const).map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${l.cls}`} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}

          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="gap-1.5 text-xs h-8">
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Locations', value: totalSlots, color: 'text-foreground' },
          { label: 'Empty Slots', value: emptySlots, color: 'text-slot-empty' },
          { label: 'Low Stock', value: lowStockSlots, color: 'text-slot-reserved' },
        ].map(stat => (
          <div key={stat.label} className="stat-card py-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Rack Grid */}
      <div className="stat-card relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading warehouse map…</p>
            </div>
          </div>
        ) : racks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No inventory data</p>
            <p className="text-xs text-muted-foreground mt-1">Add inventory items to see the warehouse map populate.</p>
          </div>
        ) : (
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {racks.map((rack, rackIdx) => (
              <motion.div
                key={rack.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: rackIdx * 0.05 }}
                className="rounded-md border-x-8 border-y-4 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 p-4 shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] relative overflow-hidden"
              >
                {/* Industrial Rack Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-wider font-mono drop-shadow">
                    RACK {rack.label}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-500 bg-black/5 dark:bg-black/40 px-2 py-0.5 rounded-sm">
                    {rack.slots.filter(s => s.status === 'empty').length}/{rack.slots.length} free
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 relative z-10">
                  {rack.slots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                      className={`relative flex items-center justify-center h-12 rounded-sm text-[10px] font-bold text-white transition-all duration-300 cursor-pointer 
                      bg-gradient-to-b from-white/40 to-black/10 dark:from-white/20 dark:to-black/40 
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-4px_8px_rgba(0,0,0,0.2),0_4px_6px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.6),0_4px_6px_rgba(0,0,0,0.5)]
                      border border-black/20 dark:border-black/50 ${statusColors[slot.status]} ${
                        selectedSlot?.id === slot.id
                          ? 'ring-2 ring-primary scale-110 z-20 brightness-110 dark:brightness-125'
                          : 'hover:brightness-110 dark:hover:brightness-125 hover:-translate-y-0.5'
                      }`}
                      title={slot.item ? `${slot.item.name} (${slot.item.sku}) — Qty: ${slot.item.quantity}` : 'Empty slot'}
                    >
                      <span className="drop-shadow-md">{slot.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Active Robots Section */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Active Robots</h4>
          <div className="flex flex-wrap gap-3">
            {mockActiveRobots.map(robot => (
              <div key={robot.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slot-inprogress/10 border border-slot-inprogress/30">
                <Bot className="w-3.5 h-3.5 text-slot-inprogress animate-pulse" />
                <span className="text-xs font-mono font-medium text-foreground">{robot.name}</span>
                <span className="text-[10px] text-muted-foreground">→ {robot.position.slot}</span>
              </div>
            ))}
            {mockActiveRobots.length === 0 && (
              <p className="text-xs text-muted-foreground">No robots currently active.</p>
            )}
          </div>
        </div>
      </div>

      {/* Slot Detail Panel */}
      {selectedSlot && (
        <SlotDetailPanel slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}
    </div>
  );
}
