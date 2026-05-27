import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-md w-full bg-black/90 border border-white/10 text-slate-100 backdrop-blur-xl shadow-2xl p-6 rounded-2xl animate-in fade-in zoom-in duration-300 ${className}`}
      >
        <DialogHeader className="space-y-1.5 mb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-slate-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
