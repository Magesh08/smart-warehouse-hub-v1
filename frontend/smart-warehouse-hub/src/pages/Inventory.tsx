import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, QrCode, Trash2, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  useInventoryItems,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from '../hooks/use-inventory';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { FormDialog } from '../components/common/FormDialog';
import { ErrorState } from '../components/common/ErrorState';

export default function Inventory() {
  const [search, setSearch] = useState('');
  const { data: items = [], isLoading, isError, error, refetch } = useInventoryItems({ search });

  // Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mutations
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();

  // Form State
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRack, setFormRack] = useState('');
  const [formSlot, setFormSlot] = useState('');
  const [formQuantity, setFormQuantity] = useState(0);
  const [formMinStock, setFormMinStock] = useState(10);
  const [formCategory, setFormCategory] = useState('');
  const [formValue, setFormValue] = useState(0.0);

  const resetForm = () => {
    setFormSku('');
    setFormName('');
    setFormDescription('');
    setFormRack('');
    setFormSlot('');
    setFormQuantity(0);
    setFormMinStock(10);
    setFormCategory('');
    setFormValue(0.0);
  };

  const handleOpenCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item);
    setFormSku(item.sku);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setFormRack(item.rack);
    setFormSlot(item.slot);
    setFormQuantity(item.quantity);
    setFormMinStock(item.min_stock_level);
    setFormCategory(item.category);
    setFormValue(item.value || 0.0);
    setEditDialogOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku || !formName || !formRack || !formSlot) return;

    try {
      await createMutation.mutateAsync({
        sku: formSku,
        name: formName,
        description: formDescription || undefined,
        rack: formRack,
        slot: formSlot,
        quantity: Number(formQuantity),
        min_stock_level: Number(formMinStock),
        category: formCategory || 'General',
        tags: [],
        value: Number(formValue) || undefined,
      });
      setCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      // toast is triggered inside hook
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formSku || !formName) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedItem.id,
        data: {
          sku: formSku,
          name: formName,
          description: formDescription || undefined,
          rack: formRack,
          slot: formSlot,
          quantity: Number(formQuantity),
          min_stock_level: Number(formMinStock),
          category: formCategory,
          value: Number(formValue),
        },
      });
      setEditDialogOpen(false);
      setSelectedItem(null);
      resetForm();
    } catch (err) {
      // error is handled inside hook
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        // error is handled inside hook
      }
    }
  };

  // Columns definition for DataTable
  const columns: Column<any>[] = [
    {
      header: 'SKU',
      accessor: 'sku',
      sortable: true,
      className: 'font-mono text-cyan-400 text-xs font-semibold',
    },
    {
      header: 'Product Name',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-100">{row.name}</div>
          {row.description && (
            <div className="text-xs text-slate-500 line-clamp-1">{row.description}</div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Location',
      accessor: (row) => (
        <span className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300">
          Rack {row.rack} / Slot {row.slot}
        </span>
      ),
    },
    {
      header: 'Qty',
      accessor: 'quantity',
      sortable: true,
      className: 'font-mono text-center font-bold',
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      className: 'text-xs text-slate-400',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} type="stock" />,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenEdit(row)}
            variant="outline"
            className="border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-400 p-2 h-8 w-8"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={() => handleDelete(row.id)}
            variant="outline"
            className="border-white/10 hover:border-red-500/50 hover:bg-red-950/20 text-slate-300 hover:text-red-400 p-2 h-8 w-8"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Inventory"
          message={error?.message || 'Error occurred querying SQL database'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Inventory Management</h1>
          <p className="text-sm text-slate-400">{items.length} unique SKUs tracked in real-time</p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 text-slate-300">
            <QrCode className="w-4 h-4" /> Scan QR
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5 text-slate-300">
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <DataTable
          data={items}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Filter items by product name..."
          loading={isLoading}
        />
      </motion.div>

      {/* CREATE DIALOG */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Add New Inventory Product"
        description="Register a new SKU and allocate a physical shelf location in the warehouse."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">SKU</Label>
              <Input
                value={formSku}
                onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                placeholder="WDG-099"
                required
                className="bg-black/40 border-white/10 text-white rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Category</Label>
              <Input
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="Electronics"
                required
                className="bg-black/40 border-white/10 text-white rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Product Name</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Widget Pro X2"
              required
              className="bg-black/40 border-white/10 text-white rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Description</Label>
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Enter product details..."
              className="bg-black/40 border-white/10 text-white rounded-xl min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Rack Location</Label>
              <Input
                value={formRack}
                onChange={(e) => setFormRack(e.target.value.toUpperCase())}
                placeholder="A"
                required
                maxLength={2}
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Slot Location</Label>
              <Input
                value={formSlot}
                onChange={(e) => setFormSlot(e.target.value.toUpperCase())}
                placeholder="A3"
                required
                maxLength={4}
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Qty</Label>
              <Input
                type="number"
                value={formQuantity}
                onChange={(e) => setFormQuantity(Number(e.target.value))}
                min={0}
                required
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Min Stock</Label>
              <Input
                type="number"
                value={formMinStock}
                onChange={(e) => setFormMinStock(Number(e.target.value))}
                min={0}
                required
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Value ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formValue}
                onChange={(e) => setFormValue(Number(e.target.value))}
                min={0}
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold mt-4 rounded-xl py-2.5"
          >
            {createMutation.isPending ? 'Registering Item...' : 'Create Item'}
          </Button>
        </form>
      </FormDialog>

      {/* EDIT DIALOG */}
      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Inventory Product"
        description="Update shelf assignments, details, or adjust physical stock levels."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">SKU</Label>
              <Input
                value={formSku}
                onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                required
                className="bg-black/40 border-white/10 text-white rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Category</Label>
              <Input
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                required
                className="bg-black/40 border-white/10 text-white rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Product Name</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="bg-black/40 border-white/10 text-white rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Description</Label>
            <Textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="bg-black/40 border-white/10 text-white rounded-xl min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Rack Location</Label>
              <Input
                value={formRack}
                onChange={(e) => setFormRack(e.target.value.toUpperCase())}
                required
                maxLength={2}
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Slot Location</Label>
              <Input
                value={formSlot}
                onChange={(e) => setFormSlot(e.target.value.toUpperCase())}
                required
                maxLength={4}
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Qty</Label>
              <Input
                type="number"
                value={formQuantity}
                onChange={(e) => setFormQuantity(Number(e.target.value))}
                min={0}
                required
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Min Stock</Label>
              <Input
                type="number"
                value={formMinStock}
                onChange={(e) => setFormMinStock(Number(e.target.value))}
                min={0}
                required
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Value ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formValue}
                onChange={(e) => setFormValue(Number(e.target.value))}
                min={0}
                className="bg-black/40 border-white/10 text-white rounded-xl font-mono"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-semibold mt-4 rounded-xl py-2.5"
          >
            {updateMutation.isPending ? 'Syncing stock...' : 'Save Changes'}
          </Button>
        </form>
      </FormDialog>
    </div>
  );
}
