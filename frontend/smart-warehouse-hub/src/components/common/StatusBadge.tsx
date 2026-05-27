import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'stock' | 'order';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'stock',
  className = '',
}) => {
  const normStatus = status.toLowerCase().trim();
  
  let label = status;
  let bgStyles = 'bg-slate-500/10 border-slate-500/20 text-slate-300';
  let dotColor = 'bg-slate-400';

  if (type === 'stock') {
    switch (normStatus) {
      case 'in-stock':
      case 'instock':
        label = 'In Stock';
        bgStyles = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        dotColor = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
        break;
      case 'low-stock':
      case 'lowstock':
        label = 'Low Stock';
        bgStyles = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
        dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
        break;
      case 'out-of-stock':
      case 'outofstock':
        label = 'Out of Stock';
        bgStyles = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
        dotColor = 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]';
        break;
    }
  } else {
    // order status styles
    switch (normStatus) {
      case 'pending':
        label = 'Pending';
        bgStyles = 'bg-sky-500/10 border-sky-500/20 text-sky-400';
        dotColor = 'bg-sky-400';
        break;
      case 'picking':
        label = 'Picking';
        bgStyles = 'bg-violet-500/15 border-violet-500/30 text-violet-400 animate-pulse';
        dotColor = 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]';
        break;
      case 'completed':
        label = 'Completed';
        bgStyles = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        dotColor = 'bg-emerald-400';
        break;
      case 'cancelled':
      case 'cancelled_deleted':
        label = 'Cancelled';
        bgStyles = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
        dotColor = 'bg-rose-400';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-300 ${bgStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
};

export default StatusBadge;
