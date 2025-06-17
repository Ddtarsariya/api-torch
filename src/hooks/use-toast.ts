import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

const TOAST_TIMEOUT = 5000;

type ToastOptions = Omit<ToastProps, "id">;

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(
    ({ ...props }: ToastOptions) => {
      const id = uuidv4();
      const newToast = { id, ...props };

      setToasts((toasts) => [...toasts, newToast]);

      return id;
    },
    [setToasts],
  );

  const dismiss = useCallback(
    (id: string) => {
      setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
    },
    [setToasts],
  );

  useEffect(() => {
    const timeouts = toasts.map((toast) => {
      return setTimeout(() => {
        dismiss(toast.id);
      }, TOAST_TIMEOUT);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [toasts, dismiss]);

  return {
    toasts,
    toast,
    dismiss,
  };
}
