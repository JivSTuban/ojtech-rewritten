import React, { Component, createRef, RefObject } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  forwardedRef?: React.RefObject<HTMLTextAreaElement>;
}

export class Textarea extends Component<TextareaProps> {
  private textareaRef: RefObject<HTMLTextAreaElement>;
  
  constructor(props: TextareaProps) {
    super(props);
    this.textareaRef = props.forwardedRef || createRef<HTMLTextAreaElement>();
  }
  
  render() {
    const { className, forwardedRef, ...props } = this.props;
    
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={this.textareaRef}
        {...props}
      />
    );
  }
} 