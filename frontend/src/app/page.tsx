'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/contexts/BusinessContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalPenjualan: number;
  totalTransaksi: number;
  totalItems: number;
  lowStockItems: number;
  recentSales: {
    id: string;
    noTransaksi: string;
    tanggal: string;
    grandTotal: number;
    itemCount: number;
    pelanggan: string | null;
  }[];
  lowStockList: {
    id: string;
    namaItem: string;
    stock: string | number;
    satuan: string;
  }[];
  topItems: {
    name: string;
    totalSold: number;
  }[];
}

export default function Home() {
  const { businesses, businessId } = useBusiness();
  const router = useRouter();
  const currentBusiness = businesses.find((b) => b.id === businessId);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (businessId) {
      fetchStats();
    }
  }, [businessId]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/reports/dashboard?businessId=${businessId}`);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="text-muted-foreground">
          {currentBusiness?.name || 'Pilih Bisnis'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalPenjualan || 0)}</div>
            <p className="text-xs text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransaksi || 0}</div>
            <p className="text-xs text-muted-foreground">Hari ini</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Item</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Item aktif</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lowStockItems || 0}</div>
            <p className="text-xs text-muted-foreground">Perlu restock (≤ 5)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Penjualan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentSales && stats.recentSales.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/reports/receipt/${sale.id}`)}
                  >
                    <div>
                      <div className="font-mono text-sm font-medium">{sale.noTransaksi}</div>
                      <div className="text-xs font-semibold text-primary/80 mt-0.5">
                        {sale.pelanggan || 'Pelanggan Umum'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(sale.tanggal).toLocaleString('id-ID')} • {sale.itemCount} item
                      </div>
                    </div>
                    <div className="font-bold">
                      {formatCurrency(Number(sale.grandTotal))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Belum ada data transaksi
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="col-span-3 border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle>Stok Menipis (≤ 5)</CardTitle>
            <CardDescription>Perlu restock segera</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.lowStockList && stats.lowStockList.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{item.namaItem}</p>
                    <p className="text-xs text-muted-foreground">Stok: {Number(item.stock)} {item.satuan}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-orange-200 hover:bg-orange-100 hover:text-orange-700"
                    onClick={() => router.push('/items')}
                  >
                    Restock
                  </Button>
                </div>
              ))}
              {(!stats?.lowStockList || stats.lowStockList.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">Stok aman 👍</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Item Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topItems && stats.topItems.length > 0 ? (
              <div className="space-y-3">
                {stats.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.totalSold} terjual</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
