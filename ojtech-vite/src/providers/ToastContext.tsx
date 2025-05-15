import React, { Component, createContext } from 'react';
import type { ToastActionElement, ToasterToastProps } from '@/components/ui/Toast';

// Constants
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

// Types
type ToasterToast = ToasterToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ActionType = {
  ADD_TOAST: 'ADD_TOAST';
  UPDATE_TOAST: 'UPDATE_TOAST';
  DISMISS_TOAST: 'DISMISS_TOAST';
  REMOVE_TOAST: 'REMOVE_TOAST';
};

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

// Helper functions
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Create context
interface ToastContextValue extends State {
  toast: (props: Omit<ToasterToast, 'id'>) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => ({ id: '', dismiss: () => {}, update: () => {} }),
  dismiss: () => {},
});

// Main toast context provider
interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastProviderState {
  toasts: ToasterToast[];
}

// Timeout map
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export class ToastProvider extends Component<ToastProviderProps, ToastProviderState> {
  constructor(props: ToastProviderProps) {
    super(props);
    this.state = {
      toasts: [],
    };
  }
  
  private addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) {
      return;
    }

    const timeout = setTimeout(() => {
      toastTimeouts.delete(toastId);
      this.dispatch({
        type: 'REMOVE_TOAST',
        toastId: toastId,
      });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
  };
  
  // Reducer logic
  private reducer = (state: ToastProviderState, action: Action): ToastProviderState => {
    switch (action.type) {
      case 'ADD_TOAST':
        return {
          ...state,
          toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
        };

      case 'UPDATE_TOAST':
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toast.id ? { ...t, ...action.toast } : t
          ),
        };

      case 'DISMISS_TOAST': {
        const { toastId } = action;

        // Side effects
        if (toastId) {
          this.addToRemoveQueue(toastId);
        } else {
          state.toasts.forEach((toast) => {
            this.addToRemoveQueue(toast.id);
          });
        }

        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId || toastId === undefined
              ? {
                  ...t,
                  open: false,
                }
              : t
          ),
        };
      }
      case 'REMOVE_TOAST':
        if (action.toastId === undefined) {
          return {
            ...state,
            toasts: [],
          };
        }
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== action.toastId),
        };
      default:
        return state;
    }
  };

  // Dispatch function to update state
  private dispatch = (action: Action) => {
    this.setState((prevState) => this.reducer(prevState, action));
  };

  // Toast function
  private toast = (props: Omit<ToasterToast, 'id'>) => {
    const id = genId();

    const update = (props: ToasterToast) =>
      this.dispatch({
        type: 'UPDATE_TOAST',
        toast: { ...props, id },
      });
      
    const dismiss = () => this.dispatch({ type: 'DISMISS_TOAST', toastId: id });

    this.dispatch({
      type: 'ADD_TOAST',
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss();
        },
      },
    });

    return {
      id,
      dismiss,
      update,
    };
  };

  // Dismiss function
  private dismiss = (toastId?: string) => {
    this.dispatch({ type: 'DISMISS_TOAST', toastId });
  };

  render() {
    const value: ToastContextValue = {
      toasts: this.state.toasts,
      toast: this.toast,
      dismiss: this.dismiss,
    };

    return (
      <ToastContext.Provider value={value}>
        {this.props.children}
      </ToastContext.Provider>
    );
  }
}

// Context consumer class
interface ToastConsumerProps {
  children: (value: ToastContextValue) => React.ReactNode;
}

export class ToastConsumer extends Component<ToastConsumerProps> {
  render() {
    return (
      <ToastContext.Consumer>
        {this.props.children}
      </ToastContext.Consumer>
    );
  }
}

// Helper class to consume toast context
export class ToastHelper extends Component {
  static contextType = ToastContext;
  context!: React.ContextType<typeof ToastContext>;
  
  static toast(props: Omit<ToasterToast, 'id'>) {
    const context = this.contextType;
    if (context) {
      return context.toast(props);
    }
    return { id: '', dismiss: () => {}, update: () => {} };
  }
  
  static dismiss(toastId?: string) {
    const context = this.contextType;
    if (context) {
      context.dismiss(toastId);
    }
  }
}

export { ToastContext };