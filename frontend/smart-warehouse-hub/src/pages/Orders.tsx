import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Clock, CheckCircle2, Loader2, Plus, Play, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useOrders, useCreateOrder, useUpdateOrder, useUpdateOrderStatus, useDeleteOrder } from '../hooks/use-orders';
import { useInventoryItems } from '../hooks/use-inventory';
import { FormDialog } from '../components/common/FormDialog';
import { StatusBadge } from '../components/common/StatusBadge';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  picking: { icon: Loader2, color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/30' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  cancelled: { icon: X, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

// Seed robot options matching mockup list
const ROBOT_OPTIONS = ['AGV-01', 'AGV-02', 'AGV-03', 'AMR-01', 'AMR-02'];

export default function Orders() {
  const { data: orders = [], isLoading, isError, error, refetch } = useOrders();
  const { data: inventoryItems = [] } = useInventoryItems();

  // Mutations
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const statusMutation = useUpdateOrderStatus();
  const deleteMutation = useDeleteOrder();

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [robotDialogOpen, setRobotDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form states - Create Order
  const [formOrderId, setFormOrderId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [orderItems, setOrderItems] = useState<{ sku: string; name: string; quantity: number }[]>([]);

  // Form states - Assign Robot
  const [selectedRobot, setSelectedRobot] = useState('');

  const resetCreateForm = () => {
    setFormOrderId(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormNotes('');
    setSelectedSku('');
    setSelectedQty(1);
    setOrderItems([]);
  };

  const handleOpenCreate = () => {
    resetCreateForm();
    setCreateDialogOpen(true);
  };

  const handleAddItemToOrder = () => {
    if (!selectedSku) return;
    const invItem = inventoryItems.find((i) => i.sku === selectedSku);
    if (!invItem) return;

    // Check if item is already added
    const existingIndex = orderItems.findIndex((item) => item.sku === selectedSku);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += Number(selectedQty);
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, { sku: selectedSku, name: invItem.name, quantity: Number(selectedQty) }]);
    }
    
    setSelectedSku('');
    setSelectedQty(1);
  };

  const handleRemoveItemFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrderId || orderItems.length === 0) return;

    try {
      await createMutation.mutateAsync({
        orderId: formOrderId,
        notes: formNotes || undefined,
        items: orderItems.map((item) => ({
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
        })),
      });
      setCreateDialogOpen(false);
      resetCreateForm();
    } catch (err) {
      // error is handled inside hook
    }
  };

  const handleOpenAssignRobot = (order: any) => {
    setSelectedOrder(order);
    setSelectedRobot(order.assignedRobot || ROBOT_OPTIONS[0]);
    setRobotDialogOpen(true);
  };

  const handleAssignRobotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedRobot) return;

    try {
      // 1. Assign robot and advance status to 'picking'
      await updateMutation.mutateAsync({
        id: selectedOrder.id,
        data: {
          assignedRobot: selectedRobot,
          progress: 10, // Start picking at 10%
        },
      });
      
      await statusMutation.mutateAsync({
        id: selectedOrder.id,
        status: 'picking',
      });

      setRobotDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      // error is handled inside hook
    }
  };

  const handleAdvanceProgress = async (order: any) => {
    const nextProgress = Math.min((order.progress || 0) + 25, 100);
    try {
      await updateMutation.mutateAsync({
        id: order.id,
        data: {
          progress: nextProgress,
        },
      });
      
      if (nextProgress === 100) {
        await statusMutation.mutateAsync({
          id: order.id,
          status: 'completed',
        });
      }
    } catch (err) {
      // error is handled inside hook
    }
  };

  const handleCancelOrder = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel and delete this order?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        // error is handled inside hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-12">
        <LoadingState message="Connecting to orders register..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Orders Offline"
          message={error?.message || 'Failed to fetch active orders from PostgreSQL'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Warehouse Orders</h1>
          <p className="text-sm text-slate-400">{orders.length} registered orders active today</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <Plus className="w-4 h-4" /> Create Order
        </Button>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order, i) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const Icon = cfg.icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-white/20"
              >
                {/* Header Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color} ${order.status === 'picking' ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-white text-sm tracking-wide">{order.orderId}</p>
                      <p className="text-[10px] text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} type="order" />
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-red-500/20 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Items in Order */}
                <div className="text-xs text-slate-300 mb-4 bg-white/5 border border-white/5 rounded-xl p-3">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Products</span>
                  <div className="space-y-1">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between font-mono">
                        <span>{item.name} <span className="text-slate-500">(SKU: {item.sku})</span></span>
                        <span className="font-bold text-cyan-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-slate-400 italic">
                      Notes: {order.notes}
                    </div>
                  )}
                </div>

                {/* Operations & Progress */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    {/* Progress slider bar */}
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span>Picking Progress</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          style={{ width: `${order.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Robot assignments */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {order.assignedRobot ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-violet-500/10 border border-violet-500/20 text-violet-400 px-3 py-1 rounded-xl flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-violet-400" /> {order.assignedRobot}
                          </span>
                          
                          {/* Progress simulation button */}
                          <Button
                            onClick={() => handleAdvanceProgress(order)}
                            size="sm"
                            className="h-8 gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-xs rounded-xl"
                          >
                            <Play className="w-3 h-3" /> Advance Progress
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleOpenAssignRobot(order)}
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-400 text-xs rounded-xl"
                        >
                          <Bot className="w-3.5 h-3.5" /> Assign AGV/AMR
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10 text-slate-500">
            No active orders. Create an order to trigger robot fleets.
          </div>
        )}
      </div>

      {/* CREATE ORDER DIALOG */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Create New Dispatch Order"
        description="Select items from inventory to compile a picking dispatch payload."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Order ID</Label>
            <Input
              value={formOrderId}
              onChange={(e) => setFormOrderId(e.target.value.toUpperCase())}
              placeholder="ORD-1000"
              required
              className="bg-black/40 border-white/10 text-white rounded-xl font-mono font-bold"
            />
          </div>

          {/* Selector to add items */}
          <div className="p-3 border border-white/5 bg-white/5 rounded-xl space-y-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Add Product Line</span>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Select value={selectedSku} onValueChange={setSelectedSku}>
                  <SelectTrigger className="bg-black/50 border-white/10 rounded-xl text-xs text-slate-200">
                    <SelectValue placeholder="Choose inventory item..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10 text-slate-100 max-h-[200px]">
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.sku} value={item.sku} className="text-xs">
                        {item.name} ({item.sku}) — Stock: {item.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input
                  type="number"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Number(e.target.value))}
                  min={1}
                  placeholder="Qty"
                  className="bg-black/50 border-white/10 rounded-xl font-mono text-xs text-white"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddItemToOrder}
              disabled={!selectedSku}
              variant="outline"
              className="w-full h-8 text-xs border-cyan-500/20 hover:bg-cyan-950/20 text-cyan-400 hover:text-cyan-300 rounded-xl"
            >
              Add Line Item
            </Button>
          </div>

          {/* Current added items list */}
          {orderItems.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider block">Lines to Dispatch</Label>
              <div className="border border-white/10 rounded-xl p-2.5 max-h-[140px] overflow-y-auto space-y-1.5 bg-black/30">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg px-2.5 py-1.5 text-xs">
                    <span className="text-slate-200 font-mono font-medium">
                      {item.name} <span className="text-slate-500">x{item.quantity}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItemFromOrder(idx)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Order Notes / Instructions</Label>
            <Input
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Express loading dock dispatch"
              className="bg-black/40 border-white/10 text-white rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={orderItems.length === 0 || createMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold mt-4 rounded-xl py-2.5"
          >
            {createMutation.isPending ? 'Submitting Dispatch...' : 'Dispatch Order'}
          </Button>
        </form>
      </FormDialog>

      {/* ASSIGN ROBOT DIALOG */}
      <FormDialog
        open={robotDialogOpen}
        onOpenChange={setRobotDialogOpen}
        title="Assign AGV/AMR Fleet Robot"
        description="Select an active autonomous mobile robot to dispatch for picking."
      >
        <form onSubmit={handleAssignRobotSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Select AGV/AMR Robot</Label>
            <Select value={selectedRobot} onValueChange={setSelectedRobot}>
              <SelectTrigger className="bg-black/40 border-white/10 rounded-xl text-slate-200">
                <SelectValue placeholder="Choose AGV..." />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-slate-100">
                {ROBOT_OPTIONS.map((bot) => (
                  <SelectItem key={bot} value={bot}>
                    {bot} (Operational — Battery OK)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl flex gap-2.5 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>
              Dispatching AGV starts the autonomous picking sequence. Status updates will be sent in real-time.
            </p>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold mt-4 rounded-xl py-2.5"
          >
            {updateMutation.isPending ? 'Allocating Fleet...' : 'Dispatch AGV'}
          </Button>
        </form>
      </FormDialog>
    </div>
  );
}
