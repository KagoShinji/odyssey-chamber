import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

interface NotificationContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: "danger" | "primary";
    resolve: (val: boolean) => void;
  } | null>(null);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(() => ({
    success: (msg: string, dur?: number) => addToast(msg, "success", dur),
    error: (msg: string, dur?: number) => addToast(msg, "error", dur),
    info: (msg: string, dur?: number) => addToast(msg, "info", dur),
  }), [addToast]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || "Confirm Action",
        message: options.message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "primary",
        resolve,
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toasts overlay */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Modal */}
      {confirmState && (
        <Dialog 
          open={confirmState.isOpen} 
          onOpenChange={(open) => {
            if (!open) {
              confirmState.resolve(false);
              setConfirmState(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[420px] bg-white text-gray-900 border border-gray-150 rounded-2xl shadow-2xl p-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-heading font-black text-gray-900 flex items-center gap-2">
                {confirmState.variant === "danger" && (
                  <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 animate-bounce" />
                )}
                {confirmState.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 leading-relaxed">
                {confirmState.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  confirmState.resolve(false);
                  setConfirmState(null);
                }}
                className="rounded-full border-gray-200 text-gray-700 font-heading font-semibold cursor-pointer hover:bg-gray-50"
              >
                {confirmState.cancelText}
              </Button>
              <Button
                onClick={() => {
                  confirmState.resolve(true);
                  setConfirmState(null);
                }}
                className={`rounded-full font-heading font-semibold cursor-pointer ${
                  confirmState.variant === "danger"
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-md"
                    : "bg-green-700 hover:bg-green-600 text-white shadow-md"
                }`}
              >
                {confirmState.confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0" />,
    error: <AlertTriangle className="text-rose-400 w-5 h-5 flex-shrink-0" />,
    info: <Info className="text-amber-400 w-5 h-5 flex-shrink-0" />,
  };

  const borderColors = {
    success: "border-l-emerald-500",
    error: "border-l-rose-500",
    info: "border-l-amber-500",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-150/5 border-l-4 ${borderColors[toast.type]} bg-[#0D1A14]/95 backdrop-blur-md text-white shadow-xl max-w-sm w-full relative overflow-hidden`}
    >
      <div className="flex items-center gap-3">
        {icons[toast.type]}
        <p className="text-xs font-heading font-medium leading-relaxed pr-2 text-gray-200">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white cursor-pointer transition-colors p-1 rounded-lg hover:bg-white/5"
      >
        <X size={14} />
      </button>

      {/* Countdown progress bar at bottom of toast */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] ${
          toast.type === "success"
            ? "bg-emerald-500"
            : toast.type === "error"
            ? "bg-rose-500"
            : "bg-amber-500"
        }`}
      />
    </motion.div>
  );
};
