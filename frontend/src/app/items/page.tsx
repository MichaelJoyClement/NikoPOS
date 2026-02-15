'use client';

import { useEffect, useState, useMemo } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Item, getColumns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { AddItemDialog } from '@/components/items/AddItemDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

export default function ItemsPage() {
    const { businessId, isLoading } = useBusiness();
    const { user } = useAuth();
    const [data, setData] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    // Edit state
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Item>>({});

    // Delete state
    const [deleteItem, setDeleteItem] = useState<Item | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // Restock state
    const [restockItem, setRestockItem] = useState<Item | null>(null);
    const [restockOpen, setRestockOpen] = useState(false);
    const [restockQty, setRestockQty] = useState<number>(0);
    const [restockPrice, setRestockPrice] = useState<number>(0);
    const [newSellingPrice, setNewSellingPrice] = useState<number>(0);

    useEffect(() => {
        if (businessId) {
            fetchItems();
        }
    }, [businessId]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/items?businessId=${businessId}`);
            const mappedData = res.data.map((item: any) => ({
                ...item,
                hargaJual: Number(item.hargaJual),
                stock: Number(item.stock),
            }));
            setData(mappedData);
        } catch (error) {
            toast.error('Gagal memuat data item');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Edit ---
    const handleEdit = (item: Item) => {
        setEditItem(item);
        setEditForm({
            namaItem: item.namaItem,
            kodeItem: item.kodeItem,
            barcode: item.barcode,
            stock: item.stock,
            satuan: item.satuan,
            merek: item.merek,
            hargaPokok: item.hargaPokok,
            hargaJual: item.hargaJual,
        });
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        if (!editItem) return;
        try {
            await api.patch(`/items/${editItem.id}`, editForm);
            toast.success('Item berhasil diupdate');
            setEditOpen(false);
            setEditItem(null);
            fetchItems();
        } catch (error) {
            toast.error('Gagal mengupdate item');
            console.error(error);
        }
    };

    // --- Delete ---
    const handleDelete = (item: Item) => {
        setDeleteItem(item);
        setDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteItem) return;
        try {
            await api.delete(`/items/${deleteItem.id}`);
            toast.success('Item berhasil dihapus');
            setDeleteOpen(false);
            setDeleteItem(null);
            fetchItems();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus item');
            console.error(error);
        }
    };

    const handleRestock = (item: Item) => {
        setRestockItem(item);
        setRestockQty(0);
        setRestockPrice(item.hargaPokok);
        setNewSellingPrice(item.hargaJual);
        setRestockOpen(true);
    };

    const handleRestockSubmit = async () => {
        if (!restockItem || restockQty <= 0) return;
        try {
            await api.post(`/items/${restockItem.id}/restock`, {
                qty: restockQty,
                hargaBeli: restockPrice,
                hargaJual: newSellingPrice,
            });
            toast.success(`Berhasil menambah stok, update HPP, dan harga jual`);
            setRestockOpen(false);
            setRestockItem(null);
            fetchItems();
        } catch (error) {
            toast.error('Gagal menambah stok');
            console.error(error);
        }
    };

    const columns = useMemo(() => getColumns(handleEdit, handleDelete, handleRestock, user?.role), [user?.role]);

    if (isLoading || loading) {
        return <div className="p-8 text-center text-muted-foreground">Memuat data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Daftar Item</h2>
                <AddItemDialog onSuccess={fetchItems} />
            </div>
            <DataTable columns={columns} data={data} filterColumn="namaItem" filterPlaceholder="Filter nama item..." />

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Ubah detail item &quot;{editItem?.namaItem}&quot;
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kode Item</Label>
                                <Input
                                    value={editForm.kodeItem || ''}
                                    onChange={(e) => setEditForm({ ...editForm, kodeItem: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Barcode</Label>
                                <Input
                                    value={editForm.barcode || ''}
                                    onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nama Item</Label>
                            <Input
                                value={editForm.namaItem || ''}
                                onChange={(e) => setEditForm({ ...editForm, namaItem: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Stok</Label>
                                <Input
                                    type="number"
                                    value={editForm.stock ?? 0}
                                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Satuan</Label>
                                <Input
                                    value={editForm.satuan || ''}
                                    onChange={(e) => setEditForm({ ...editForm, satuan: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Merek</Label>
                                <Input
                                    value={editForm.merek || ''}
                                    onChange={(e) => setEditForm({ ...editForm, merek: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {user?.role === 'OWNER' && (
                                <div className="space-y-2">
                                    <Label>Harga Pokok (HPP)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.hargaPokok ?? 0}
                                        onChange={(e) => setEditForm({ ...editForm, hargaPokok: Number(e.target.value) })}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Harga Jual</Label>
                                <Input
                                    type="number"
                                    value={editForm.hargaJual ?? 0}
                                    onChange={(e) => setEditForm({ ...editForm, hargaJual: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
                        <Button onClick={handleEditSave}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Restock Dialog */}
            <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Restock Item</DialogTitle>
                        <DialogDescription>
                            Tambah stok untuk &quot;{restockItem?.namaItem}&quot;
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Stok Saat Ini</Label>
                            <Input disabled value={restockItem?.stock || 0} />
                        </div>
                        <div className="space-y-2">
                            <Label>Jumlah Masuk</Label>
                            <Input
                                type="number"
                                placeholder="Masukkan jumlah..."
                                value={restockQty}
                                onChange={(e) => setRestockQty(Number(e.target.value))}
                                autoFocus
                            />
                        </div>
                        {user?.role === 'OWNER' && (
                            <div className="space-y-2">
                                <Label>Harga Beli Satuan (Baru)</Label>
                                <Input
                                    type="number"
                                    value={restockPrice}
                                    onChange={(e) => setRestockPrice(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    *Harga Pokok akan diupdate otomatis dengan metode rata-rata (Weighted Average).
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Harga Jual Baru</Label>
                            <Input
                                type="number"
                                value={newSellingPrice}
                                onChange={(e) => setNewSellingPrice(Number(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground">
                                *Sesuaikan harga jual jika HPP mengalami kenaikan.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRestockOpen(false)}>Batal</Button>
                        <Button onClick={handleRestockSubmit}>Simpan Restock</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus item &quot;{deleteItem?.namaItem}&quot;? Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
