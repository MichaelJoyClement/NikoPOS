'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/contexts/BusinessContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Receipt, Search, Eye } from 'lucide-react';

interface Sale {
    id: string;
    noTransaksi: string;
    tanggal: string;
    pelanggan: string | null;
    grandTotal: number;
    items: {
        id: string;
        item: {
            namaItem: string;
        };
        jumlah: number;
        harga: number;
        total: number;
    }[];
}

export default function SalesHistoryPage() {
    const { businessId, isLoading: bizLoading } = useBusiness();
    const router = useRouter();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (businessId) {
            fetchSales();
        }
    }, [businessId]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/sales?businessId=${businessId}`);
            setSales(res.data);
        } catch (error) {
            toast.error('Gagal memuat riwayat transaksi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.noTransaksi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sale.pelanggan && sale.pelanggan.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    if (bizLoading || loading) {
        return <div className="p-8 text-center text-muted-foreground">Memuat data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Receipt className="h-8 w-8" />
                    Riwayat Transaksi
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari no. transaksi atau pelanggan..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredSales.length} transaksi
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Transaksi</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Jumlah Item</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[100px] text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale) => (
                                    <TableRow
                                        key={sale.id}
                                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => router.push(`/reports/receipt/${sale.id}`)}
                                    >
                                        <TableCell className="font-mono font-medium">
                                            {sale.noTransaksi}
                                        </TableCell>
                                        <TableCell>{formatDate(sale.tanggal)}</TableCell>
                                        <TableCell>{sale.pelanggan || 'Pelanggan Umum'}</TableCell>
                                        <TableCell>
                                            {sale.items.length} item
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(Number(sale.grandTotal))}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/reports/receipt/${sale.id}`);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                                Lihat
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        {searchQuery ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
