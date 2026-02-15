'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type InventoryReportItem = {
    kode: string;
    nama_produk: string;
    umur_hari: number;
    saldo: number; // qty
    satuan: string;
    hpp: number;
    nilai: number; // total value
    keterangan: string;
};

export const getInventoryColumns = (role?: 'OWNER' | 'ADMIN'): ColumnDef<InventoryReportItem>[] => {
    const cols: ColumnDef<InventoryReportItem>[] = [
        {
            accessorKey: 'kode',
            header: 'Kode',
        },
        {
            accessorKey: 'nama_produk',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Nama Produk
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'umur_hari',
            header: 'Umur (Hari)',
        },
        {
            accessorKey: 'saldo',
            header: 'Saldo (Qty)',
        },
        {
            accessorKey: 'satuan',
            header: 'Satuan',
        },
        {
            accessorKey: 'hpp',
            header: 'HPP',
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('hpp'));
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                }).format(amount);
            },
        },
        {
            accessorKey: 'nilai',
            header: 'Nilai Aset',
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('nilai'));
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                }).format(amount);
            },
        },
        {
            accessorKey: 'keterangan',
            header: 'Keterangan',
        },
    ];

    if (role === 'ADMIN') {
        return cols.filter((col) => !['hpp', 'nilai'].includes((col as any).accessorKey));
    }

    return cols;
};

// Keep static for compatibility if needed, though getInventoryColumns is better
export const columns = getInventoryColumns();
