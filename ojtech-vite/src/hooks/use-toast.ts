import { toast, dismissToast } from "../components/ui/toast-utils";
import type { ToasterToastProps } from "../components/ui/Toast";

export interface UseToastType {
  toast: (props: Omit<ToasterToastProps, 'id'>) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToastProps) => void;
  };
  dismiss: (toastId?: string) => void;
}

export const useToast = (): UseToastType => {
  return {
    toast,
    dismiss: dismissToast,
  };
}; 