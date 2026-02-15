'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptData {
    store_name: string;
    transaction_no: string;
    date: string;
    pelanggan: string;
    items: {
        name: string;
        qty: number;
        price: number;
        total: number;
        guarantee: string | null;
    }[];
    total: number;
}

export default function ReceiptPage() {
    const { id } = useParams();
    const [data, setData] = useState<ReceiptData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchReceipt();
        }
    }, [id]);

    const fetchReceipt = async () => {
        try {
            const res = await api.get(`/reports/receipt/${id}`);
            setData(res.data);
        } catch (error) {
            toast.error('Gagal memuat struk');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat struk...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Struk tidak ditemukan</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-gray-50/50 dark:bg-black/50">
            <Card className="w-full max-w-md shadow-lg print:shadow-none print:border-none">
                <CardHeader className="text-center border-b pb-4">
                    <CardTitle className="text-xl font-bold uppercase">{data.store_name}</CardTitle>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>No: {data.transaction_no}</p>
                        <p>{new Date(data.date).toLocaleString('id-ID')}</p>
                        <p>Pelanggan: {data.pelanggan}</p>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="py-2 px-4 text-left font-medium">Item</th>
                                <th className="py-2 px-4 text-center font-medium">Qty</th>
                                <th className="py-2 px-4 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {data.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            @{new Intl.NumberFormat('id-ID').format(item.price)}
                                        </div>
                                        {item.guarantee && (
                                            <div className="text-xs text-blue-500 mt-0.5">
                                                Garansi: {item.guarantee}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center">{item.qty}</td>
                                    <td className="py-3 px-4 text-right">
                                        {new Intl.NumberFormat('id-ID').format(item.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-muted/20 border-t">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total Tagihan</span>
                            <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.total)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 print:hidden flex flex-col gap-2 border-t">
                    <Button onClick={handlePrint} className="w-full gap-2" variant="outline">
                        <Printer className="h-4 w-4" /> Cetak Struk
                    </Button>
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => window.location.href = '/sales'}
                        >
                            Kembali ke Kasir
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => window.location.href = '/sales/history'}
                        >
                            Riwayat Transaksi
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Print styles */}
            <style jsx global>{`
        @media print {
          @page { margin: 0; }
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; border: none; }
          .print\\:hidden { display: none; }
          header, /* Hide layout elements */
          nav, 
          aside { display: none !important; }
        }
      `}</style>
        </div>
    );
}
