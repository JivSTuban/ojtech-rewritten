import React, { Component } from 'react';
import { ToastConsumer } from '../../providers/ToastContext';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '../../components/ui/Toast';

export class Toaster extends Component {
  render() {
    return (
      <ToastConsumer>
        {(value) => (
          <ToastProvider>
            {value.toasts.map(({ id, title, description, action, ...props }) => (
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </Toast>
            ))}
            <ToastViewport />
          </ToastProvider>
        )}
      </ToastConsumer>
    );
  }
} 