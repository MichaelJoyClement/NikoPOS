'use client';

import { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const formSchema = z.object({
    kodeItem: z.string().min(1, 'Kode item wajib diisi'),
    barcode: z.string().optional(),
    namaItem: z.string().min(1, 'Nama item wajib diisi'),
    stock: z.coerce.number().min(0),
    satuan: z.string().min(1, 'Satuan wajib diisi'),
    merek: z.string().optional(),
    hargaPokok: z.coerce.number().min(0),
    hargaJual: z.coerce.number().min(0),
    mataUang: z.string().default('IDR'),
});

type FormValues = z.infer<typeof formSchema>;

export function AddItemDialog({ onSuccess }: { onSuccess: () => void }) {
    const { businessId } = useBusiness();
    const [open, setOpen] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            kodeItem: '',
            barcode: '',
            namaItem: '',
            stock: 0,
            satuan: 'PCS',
            merek: '',
            hargaPokok: 0,
            hargaJual: 0,
            mataUang: 'IDR',
        },
    });

    async function onSubmit(values: FormValues) {
        if (!businessId) {
            toast.error('Silakan pilih bisnis terlebih dahulu');
            return;
        }

        try {
            await api.post('/items', { ...values, businessId });
            toast.success('Item berhasil ditambahkan');
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            toast.error('Gagal menambahkan item');
            console.error(error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Item Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan detail item baru untuk inventory bisnis Anda.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error('Form validation errors:', errors))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="kodeItem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kode Item</FormLabel>
                                        <FormControl>
                                            <Input placeholder="BRG-001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="barcode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Barcode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="namaItem"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Item</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Kopi Bubuk 100gr" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stok Awal</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="satuan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Satuan</FormLabel>
                                        <FormControl>
                                            <Input placeholder="PCS" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="merek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Merek</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="hargaPokok"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Harga Pokok (HPP)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hargaJual"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Harga Jual</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit">Simpan Item</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
