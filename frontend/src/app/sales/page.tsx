'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/contexts/BusinessContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, X, Trash2, ShoppingCart } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface Product {
    id: string;
    kodeItem: string;
    namaItem: string;
    hargaJual: number;
    stock: number;
}

interface CartItem extends Product {
    qty: number;
    subtotal: number;
}

export default function SalesPage() {
    const { businessId, businesses } = useBusiness();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const activeBusiness = businesses.find(b => b.id === businessId);
    const isMozaVariasi = activeBusiness?.name === 'Moza Variasi';

    // Load products on mount
    useEffect(() => {
        if (businessId) {
            fetchProducts();
        }
    }, [businessId]);

    const fetchProducts = async () => {
        try {
            const res = await api.get(`/items?businessId=${businessId}`);
            // Map to ensure numeric fields from Decimal
            const data = res.data.map((p: any) => ({
                ...p,
                hargaJual: Number(p.hargaJual),
                stock: Number(p.stock)
            }));
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products', error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.namaItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kodeItem.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.error('Stok habis!');
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.qty >= product.stock) {
                    toast.error('Jumlah melebihi stok yang tersedia');
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * Number(item.hargaJual) }
                        : item
                );
            }
            return [...prev, { ...product, qty: 1, subtotal: Number(product.hargaJual) }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQty = (productId: string, qty: number) => {
        if (qty < 1) return;
        const product = products.find(p => p.id === productId);
        if (product && qty > product.stock) {
            toast.error(`Stok tidak mencukupi (Maks: ${product.stock})`);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === productId
                ? { ...item, qty, subtotal: qty * Number(item.hargaJual) }
                : item
        ));
    };

    const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const payload = {
                businessId,
                items: cart.map(item => ({
                    itemId: item.id,
                    jumlah: item.qty,
                    satuan: 'PCS', // Default for now
                    harga: item.hargaJual,
                    potongan: 0,
                })),
                pelanggan: isMozaVariasi
                    ? `${vehicleModel}${plateNumber ? ` [${plateNumber}]` : ''}`
                    : (customerName || 'General Customer')
            };

            const res = await api.post('/sales', payload);
            toast.success('Transaksi berhasil!');
            setCart([]);
            setCustomerName('');
            setVehicleModel('');
            setPlateNumber('');
            router.push(`/reports/receipt/${res.data.id}`);
        } catch (error) {
            toast.error('Gagal memproses transaksi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Left Panel: Product List */}
            <div className="w-2/3 flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari barang (Nama / Kode / Barcode)..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    // Auto-focus logic for barcode scanner could be added here
                    />
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-2">
                    {filteredProducts.map(product => (
                        <Card
                            key={product.id}
                            className={`flex flex-col justify-between transition-colors ${product.stock > 0
                                ? 'cursor-pointer hover:border-primary'
                                : 'opacity-50 cursor-not-allowed bg-muted'
                                }`}
                            onClick={() => product.stock > 0 && addToCart(product)}
                        >
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium leading-tight">
                                    {product.namaItem}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">{product.kodeItem}</p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="font-bold text-lg mt-2">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.hargaJual)}
                                </div>
                                <div className={`text-xs mt-1 font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Stok: {product.stock}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Right Panel: Cart */}
            <Card className="w-1/3 flex flex-col h-full border-l shadow-xl">
                <CardHeader className="border-b bg-card/50">
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Keranjang
                    </CardTitle>
                </CardHeader>

                <div className="p-4 border-b bg-card/30 space-y-3">
                    {isMozaVariasi ? (
                        <>
                            <Input
                                placeholder="Merk/Tipe Mobil (misal: Avanza)"
                                value={vehicleModel}
                                onChange={(e) => setVehicleModel(e.target.value)}
                            />
                            <Input
                                placeholder="Plat Nomor (misal: B 1234 ABC)"
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value)}
                            />
                        </>
                    ) : (
                        <Input
                            placeholder="Nama Pelanggan (Opsional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Item</TableHead>
                                <TableHead className="w-[20%]">Qty</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-[10%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="text-sm">{item.namaItem}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Intl.NumberFormat('id-ID').format(item.hargaJual)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="1"
                                            className="h-8 w-16 px-1"
                                            value={item.qty}
                                            onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {new Intl.NumberFormat('id-ID').format(item.subtotal)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {cart.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        Belum ada item dipilih
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <CardFooter className="border-t bg-card/50 p-4 flex flex-col gap-4">
                    <div className="flex w-full justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(grandTotal)}</span>
                    </div>
                    <Button
                        className="w-full h-12 text-lg font-bold"
                        size="lg"
                        disabled={cart.length === 0 || loading}
                        onClick={handleCheckout}
                    >
                        {loading ? 'Memproses...' : 'Bayar / Proses'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
