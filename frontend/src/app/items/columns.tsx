'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Item = {
    id: string;
    kodeItem: string;
    barcode: string | null;
    namaItem: string;
    stock: number;
    satuan: string;
    merek: string | null;
    hargaPokok: number;
    hargaJual: number;
    mataUang: string;
};

export function getColumns(
    onEdit: (item: Item) => void,
    onDelete: (item: Item) => void,
    onRestock: (item: Item) => void,
    role?: 'OWNER' | 'ADMIN'
): ColumnDef<Item>[] {
    const cols: ColumnDef<Item>[] = [
        {
            accessorKey: 'kodeItem',
            header: 'Kode Item',
        },
        {
            accessorKey: 'barcode',
            header: 'Barcode',
        },
        {
            accessorKey: 'namaItem',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Nama Item
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'stock',
            header: 'Stok',
        },
        {
            accessorKey: 'satuan',
            header: 'Satuan',
        },
        {
            accessorKey: 'merek',
            header: 'Merek',
        },
        {
            accessorKey: 'hargaPokok',
            header: 'Harga Pokok',
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('hargaPokok'));
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                }).format(amount);
            },
        },
        {
            accessorKey: 'hargaJual',
            header: 'Harga Jual',
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('hargaJual'));
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                }).format(amount);
            },
        },
        {
            accessorKey: 'mataUang',
            header: 'Mata Uang',
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(item.id)}
                            >
                                Salin ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onRestock(item)}>
                                Restock / Tambah Stok
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                                Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => onDelete(item)}
                            >
                                Hapus Item
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    if (role === 'ADMIN') {
        return cols.filter(col => (col as any).accessorKey !== 'hargaPokok');
    }

    return cols;
}

// Keep a static export for backward compatibility
export const columns: ColumnDef<Item>[] = getColumns(() => { }, () => { }, () => { });
