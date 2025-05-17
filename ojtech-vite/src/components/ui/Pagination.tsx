import React, { Component } from 'react';
import {
import { cn } from '../../lib/utils';
import { Button, buttonVariants, type ButtonProps } from '../../components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

class Pagination extends Component<PaginationProps, any> {
  render() {
    return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">First page</span>
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      
      {pageNumbers.map((page, index) => {
        // Check if we need to render ellipsis
        if (index > 0 && page > pageNumbers[index - 1] + 1) {
          return (
            <div key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </div>
          );
  }
}

export default Pagination;
