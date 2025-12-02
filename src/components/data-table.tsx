import { cn } from "@/lib/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { flexRender, useReactTable } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import type { Table as ReactTable } from "@tanstack/react-table";

export type DataTableProps<T> = React.ComponentProps<typeof Table> & {
  data: T[];
  table: ReturnType<typeof useReactTable<T>>;
};

const ITEMS_PER_PAGE_OPTIONS = [6, 12, 18, 24, 30];

const TableRowCompletion = <T,>({
  table,
  pagination,
}: {
  table: ReactTable<T>;
  pagination: { pageIndex: number; pageSize: number };
}) => {
  const currentRows = table.getRowModel().rows.length;
  const rowsToAdd = pagination.pageSize - currentRows;

  const columns = table.getAllColumns();

  if (
    table.getRowModel().rows.length === 0 ||
    (table.getPageCount() === 1 && rowsToAdd === 0)
  ) {
    return null;
  }

  if (rowsToAdd > 0) {
    return Array.from({ length: rowsToAdd }).map((_, idx) => (
      <TableRow key={`empty-row-${idx}`} className="hover:bg-accent/10 h-14">
        {columns.map((_, colIdx) => (
          <TableCell
            key={`empty-cell-${colIdx}`}
            className={cn(colIdx === 0 && "max-w-4")}
          />
        ))}
      </TableRow>
    ));
  }

  return null;
};

export const DataTable = <T,>({ data, table }: DataTableProps<T>) => {
  const dataIds = data.map((_, index) => {
    const row = table.getRowModel().rows[index];
    return row.id as UniqueIdentifier;
  });

  const columns = table.getAllColumns();

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="**:data-[slot=table-cell]:first:w-8">
          {table.getRowModel().rows?.length ? (
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="relative h-14"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRowCompletion
                table={table}
                pagination={table.getState().pagination}
              />
            </SortableContext>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum resultado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter className={cn(`col-span-[${columns.length}]`)}>
          <TableRow>
            <TableCell colSpan={columns.length}>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                  {table.getFilteredSelectedRowModel().rows.length} de{" "}
                  {table.getFilteredRowModel().rows.length} linha(s)
                  selecionadas.
                </div>
                <div className="flex w-full items-center gap-8 lg:w-fit">
                  <div className="hidden items-center gap-2 lg:flex">
                    <Label
                      htmlFor="rows-per-page"
                      className="text-sm font-medium"
                    >
                      Linhas por página
                    </Label>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-20"
                        id="rows-per-page"
                      >
                        <SelectValue
                          placeholder={table.getState().pagination.pageSize}
                        />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {ITEMS_PER_PAGE_OPTIONS.map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Ir para a primeira página</span>
                      <IconChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Ir para a página anterior</span>
                      <IconChevronLeft />
                    </Button>
                    <Button
                      variant="outline"
                      className="size-8"
                      size="icon"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Ir para a próxima página</span>
                      <IconChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden size-8 lg:flex"
                      size="icon"
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Ir para a última página</span>
                      <IconChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
