import React, { Component } from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const spinnerVariants = cva(
  "inline-block rounded-full border-2 border-current border-t-transparent animate-spin",
  {
    variants: {
      size: {
        default: "h-4 w-4 border-2",
        sm: "h-3 w-3 border-2",
        lg: "h-6 w-6 border-3",
        xl: "h-10 w-10 border-4"
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof spinnerVariants> {}

export class Spinner extends Component<SpinnerProps> {
  render() {
    const { size, className, ...props } = this.props;
    
    return (
      <div
        className={cn(spinnerVariants({ size, className }))}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
}
