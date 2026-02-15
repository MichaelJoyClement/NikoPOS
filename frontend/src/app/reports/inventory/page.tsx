'use client';

import { useEffect, useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import api from '@/lib/api';
import { InventoryReportItem, getInventoryColumns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';

export default function InventoryReportPage() {
    const { businessId } = useBusiness();
    const { user } = useAuth();
    const [data, setData] = useState<InventoryReportItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (businessId) {
            fetchReport();
        }
    }, [businessId]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/reports/inventory?businessId=${businessId}`);
            setData(response.data);
        } catch (error) {
            toast.error('Gagal memuat laporan inventory');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const totalAssetValue = data.reduce((acc, item) => acc + (Number(item.nilai) || 0), 0);
    const columns = useMemo(() => getInventoryColumns(user?.role), [user?.role]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Laporan Persediaan</h2>
            </div>

            {user?.role === 'OWNER' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Aset</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAssetValue)}
                        </div>
                        <p className="text-muted-foreground">Total Nilai Persediaan</p>
                    </CardContent>
                </Card>
            )}

            <DataTable columns={columns} data={data} filterColumn="nama_produk" filterPlaceholder="Filter nama produk..." />
        </div>
    );
}
