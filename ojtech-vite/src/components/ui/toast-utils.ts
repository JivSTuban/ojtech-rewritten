import { ToastHelper } from "../../providers/ToastContext";
import type { ToasterToastProps } from "./Toast";
import { ToastActionElement } from "./Toast";

type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning";
};

// Placeholder for the actual toast function that will be provided by the ToastContext
let showToast: (props: ToastProps) => void = () => {};

// This is exported and will be overwritten by the actual implementation
// when the ToastContext is initialized
export const setToastFunction = (toastFn: (props: ToastProps) => void) => {
  showToast = toastFn;
};

export const toast = {
  default: (props: ToastProps) => {
    showToast({ ...props, variant: "default" });
  },
  destructive: (props: ToastProps) => {
    showToast({ ...props, variant: "destructive" });
  },
  success: (props: ToastProps) => {
    showToast({ ...props, variant: "success" });
  },
  warning: (props: ToastProps) => {
    showToast({ ...props, variant: "warning" });
  },
};

// Export dismiss function
export const dismissToast = (toastId?: string) => {
  setTimeout(() => {
    ToastHelper.dismiss(toastId);
  }, 0);
}; 