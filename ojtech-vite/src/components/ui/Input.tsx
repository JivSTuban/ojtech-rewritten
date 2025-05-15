import React, { Component, createRef, RefObject } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  forwardedRef?: React.RefObject<HTMLInputElement>;
}

export class Input extends Component<InputProps> {
  private inputRef: RefObject<HTMLInputElement>;
  
  constructor(props: InputProps) {
    super(props);
    this.inputRef = props.forwardedRef || createRef<HTMLInputElement>();
  }
  
  render() {
    const { className, type, forwardedRef, ...props } = this.props;
    
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={this.inputRef}
        {...props}
      />
    );
  }
} 