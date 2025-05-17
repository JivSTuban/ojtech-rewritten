import { ToastHelper } from "../../providers/ToastContext";
import type { ToasterToastProps } from "./Toast";

// Create a toast function that can be imported directly
export const toast = (props: Omit<ToasterToastProps, 'id'>) => {
  // Return without causing synchronous renders
  setTimeout(() => {
    ToastHelper.toast(props);
  }, 0);
  return null;
};

// Export dismiss function
export const dismissToast = (toastId?: string) => {
  setTimeout(() => {
    ToastHelper.dismiss(toastId);
  }, 0);
}; 