import React, { Component, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export class Table extends Component<TableProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <div className="w-full overflow-auto">
        <table 
          className={cn("w-full caption-bottom text-sm", className)} 
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export class TableHeader extends Component<TableHeaderProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <thead className={cn("[&_tr]:border-b", className)} {...props}>
        {children}
      </thead>
    );
  }
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export class TableBody extends Component<TableBodyProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
        {children}
      </tbody>
    );
  }
}

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export class TableFooter extends Component<TableFooterProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <tfoot 
        className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
        {...props}
      >
        {children}
      </tfoot>
    );
  }
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export class TableRow extends Component<TableRowProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <tr 
        className={cn(
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export class TableHead extends Component<TableHeadProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <th 
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        {children}
      </th>
    );
  }
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export class TableCell extends Component<TableCellProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <td 
        className={cn(
          "p-4 align-middle [&:has([role=checkbox])]:pr-0",
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
}

// Add static components to Table for easier imports
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Head = TableHead;
Table.Row = TableRow;
Table.Cell = TableCell;
