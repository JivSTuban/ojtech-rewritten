import React, { Component } from 'react';
import { cn } from '../../lib/utils';

class Skeleton extends Component<any, any> {
  render() {
    return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
  }
}

export default Skeleton;
