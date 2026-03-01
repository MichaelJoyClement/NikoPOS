'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
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

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n);

export default function ReceiptPage() {
    const { id } = useParams();
    const [data, setData] = useState<ReceiptData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchReceipt();
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

    if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat struk...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Struk tidak ditemukan</div>;

    const dateObj = new Date(data.date);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Pad items to at least 10 rows for blank lines (like physical receipt)
    const MIN_ROWS = 10;
    const emptyRows = Math.max(0, MIN_ROWS - data.items.length);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 8mm; size: A5; }
                    body > * { visibility: hidden !important; }
                    #receipt-doc { visibility: visible !important; position: fixed; inset: 0; }
                    #receipt-doc * { visibility: visible !important; }
                    #receipt-actions { display: none !important; }
                    header, nav, aside, footer { display: none !important; }
                }

                #receipt-doc {
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    color: #000 !important;
                    background: #fff !important;
                }
                #receipt-doc * {
                    color: #000 !important;
                    box-sizing: border-box;
                }
                .cv-name {
                    font-size: 13px;
                    font-weight: bold;
                    color: #1a6bbf !important;
                }
                .store-brands {
                    font-size: 16px;
                    font-weight: 800;
                    color: #1a6bbf !important;
                    line-height: 1.2;
                }
                .address-line {
                    font-size: 11px;
                    color: #000 !important;
                }
                .receipt-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 8px;
                }
                .receipt-table th {
                    border: 1px solid #1a6bbf;
                    background-color: #dbeafe !important;
                    padding: 4px 6px;
                    text-align: center;
                    font-size: 11px;
                    font-weight: bold;
                    color: #000 !important;
                }
                .receipt-table td {
                    border: 1px solid #94a3b8;
                    padding: 3px 6px;
                    font-size: 11px;
                    height: 20px;
                    color: #000 !important;
                }
                .receipt-table .num { text-align: right; }
                .receipt-table .center { text-align: center; }
                .total-section {
                    border: 1px solid #94a3b8;
                    margin-left: auto;
                    width: 200px;
                    border-collapse: collapse;
                }
                .total-section td {
                    padding: 3px 8px;
                    border: 1px solid #94a3b8;
                    font-size: 11px;
                    color: #000 !important;
                }
                .sig-area {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 24px;
                    font-size: 11px;
                }
                .sig-block {
                    text-align: center;
                    min-width: 100px;
                }
                .sig-line {
                    border-top: 1px solid #000;
                    margin-top: 40px;
                    width: 100%;
                }
                .kepada-section {
                    border-bottom: 1px solid #000;
                    margin-bottom: 2px;
                    padding-bottom: 1px;
                    font-size: 11px;
                    min-width: 160px;
                }
            `}} />

            {/* Screen wrapper */}
            <div className="flex flex-col items-center bg-gray-100 min-h-screen py-8 px-4">

                {/* Receipt document */}
                <div id="receipt-doc" className="bg-white w-full max-w-[600px] shadow-md p-6">

                    {/* ===== HEADER ===== */}
                    <div className="flex justify-between items-start">

                        {/* Left: letterhead */}
                        <div>
                            <div className="cv-name">CV. MITRA ABADI</div>
                            <div className="store-brands">
                                Abadi AC · Moza Variasi · Sharon Florist
                            </div>
                            <div className="address-line mt-1">Jln. Negara No. 132 Yukum Jaya</div>
                            <div className="address-line">HP. 0813 6954 9009 &nbsp;·&nbsp; 0823 7559 6065</div>
                        </div>

                        {/* Right: date + Kepada Yth */}
                        <div className="text-right" style={{ fontSize: '11px', minWidth: '170px' }}>
                            <div style={{ marginBottom: '4px' }}>
                                Tanggal &nbsp;
                                <span style={{ borderBottom: '1px solid #000', paddingBottom: '1px' }}>
                                    {dateStr} {timeStr}
                                </span>
                            </div>
                            <div>No. Transaksi &nbsp;
                                <span style={{ borderBottom: '1px solid #000', paddingBottom: '1px' }}>
                                    {data.transaction_no}
                                </span>
                            </div>
                            <div style={{ marginTop: '8px' }}>Kepada Yth,</div>
                            <div className="kepada-section">{data.pelanggan}&nbsp;</div>
                            <div className="kepada-section">{data.store_name}&nbsp;</div>
                        </div>
                    </div>

                    {/* ===== ITEMS TABLE ===== */}
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th style={{ width: '36px' }}>No.</th>
                                <th style={{ width: '50px' }}>Banyaknya</th>
                                <th>Nama Barang</th>
                                <th style={{ width: '110px' }}>Harga Satuan</th>
                                <th style={{ width: '110px' }}>Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, i) => (
                                <tr key={i}>
                                    <td className="center">{i + 1}</td>
                                    <td className="center">{fmt(item.qty)}</td>
                                    <td>
                                        {item.name}
                                        {item.guarantee && (
                                            <span style={{ fontSize: '10px', color: '#555', marginLeft: '4px' }}>
                                                (Garansi: {item.guarantee})
                                            </span>
                                        )}
                                    </td>
                                    <td className="num">Rp {fmt(item.price)}</td>
                                    <td className="num">Rp {fmt(item.total)}</td>
                                </tr>
                            ))}
                            {/* Empty rows like physical receipt */}
                            {Array.from({ length: emptyRows }).map((_, i) => (
                                <tr key={`e-${i}`}>
                                    <td className="center" style={{ color: 'transparent' }}>-</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ===== TOTALS (right-aligned, like physical receipt) ===== */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <table className="total-section">
                            <tbody>
                                <tr>
                                    <td>Jumlah</td>
                                    <td style={{ width: '16px' }}>Rp.</td>
                                    <td className="num" style={{ minWidth: '80px' }}>{fmt(data.total)}</td>
                                </tr>
                                <tr>
                                    <td>Uang Muka</td>
                                    <td>Rp.</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 'bold' }}>Sisa</td>
                                    <td>Rp.</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* ===== SIGNATURES ===== */}
                    <div className="sig-area">
                        <div className="sig-block">
                            <div>Pembeli,</div>
                            <div className="sig-line"></div>
                        </div>
                        <div className="sig-block">
                            <div>Hormat Kami,</div>
                            <div className="sig-line"></div>
                        </div>
                    </div>

                    {/* Footer note */}
                    <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '16px', color: '#555' }}>
                        Terima kasih atas kepercayaan Anda berbelanja di {data.store_name}.
                    </div>
                </div>

                {/* Action buttons */}
                <div id="receipt-actions" className="flex flex-col gap-3 w-full max-w-[600px] mt-4">
                    <Button onClick={() => window.print()} className="w-full gap-2" size="lg">
                        <Printer className="h-4 w-4" /> Cetak Struk
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/sales'}>
                            Kembali ke Kasir
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/sales/history'}>
                            Riwayat Transaksi
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
