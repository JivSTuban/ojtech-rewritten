import React, { Component, createRef, RefObject, ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Root Dialog component
interface DialogProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export class Dialog extends Component<DialogProps> {
  render() {
    return <DialogPrimitive.Root {...this.props} />;
  }
}

// DialogTrigger component
export class DialogTrigger extends Component<DialogPrimitive.DialogTriggerProps> {
  render() {
    return <DialogPrimitive.Trigger {...this.props} />;
  }
}

// DialogPortal component
export class DialogPortal extends Component<DialogPrimitive.DialogPortalProps> {
  render() {
    return <DialogPrimitive.Portal {...this.props} />;
  }
}

// DialogClose component
export class DialogClose extends Component<DialogPrimitive.DialogCloseProps> {
  render() {
    return <DialogPrimitive.Close {...this.props} />;
  }
}

// DialogOverlay component
interface DialogOverlayProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class DialogOverlay extends Component<DialogOverlayProps> {
  private overlayRef: RefObject<HTMLDivElement>;
  
  constructor(props: DialogOverlayProps) {
    super(props);
    this.overlayRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <DialogPrimitive.Overlay
        ref={this.overlayRef}
        className={cn(
          'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        {...props}
      />
    );
  }
}

// DialogContent component
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  forwardedRef?: React.RefObject<HTMLDivElement>;
}

export class DialogContent extends Component<DialogContentProps> {
  private contentRef: RefObject<HTMLDivElement>;
  
  constructor(props: DialogContentProps) {
    super(props);
    this.contentRef = props.forwardedRef || createRef<HTMLDivElement>();
  }
  
  render() {
    const { className, children, forwardedRef, ...props } = this.props;
    
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={this.contentRef}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
}

// DialogHeader component
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export class DialogHeader extends Component<DialogHeaderProps> {
  render() {
    const { className, ...props } = this.props;
    
    return (
      <div
        className={cn(
          'flex flex-col space-y-1.5 text-center sm:text-left',
          className
        )}
        {...props}
      />
    );
  }
}

// DialogFooter component
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export class DialogFooter extends Component<DialogFooterProps> {
  render() {
    const { className, ...props } = this.props;
    
    return (
      <div
        className={cn(
          'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
          className
        )}
        {...props}
      />
    );
  }
}

// DialogTitle component
interface DialogTitleProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  forwardedRef?: React.RefObject<HTMLHeadingElement>;
}

export class DialogTitle extends Component<DialogTitleProps> {
  private titleRef: RefObject<HTMLHeadingElement>;
  
  constructor(props: DialogTitleProps) {
    super(props);
    this.titleRef = props.forwardedRef || createRef<HTMLHeadingElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <DialogPrimitive.Title
        ref={this.titleRef}
        className={cn(
          'text-lg font-semibold leading-none tracking-tight',
          className
        )}
        {...props}
      />
    );
  }
}

// DialogDescription component
interface DialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {
  forwardedRef?: React.RefObject<HTMLParagraphElement>;
}

export class DialogDescription extends Component<DialogDescriptionProps> {
  private descriptionRef: RefObject<HTMLParagraphElement>;
  
  constructor(props: DialogDescriptionProps) {
    super(props);
    this.descriptionRef = props.forwardedRef || createRef<HTMLParagraphElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <DialogPrimitive.Description
        ref={this.descriptionRef}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    );
  }
} 