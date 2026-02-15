import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        businessId: string;
        noTransaksi?: string;
        pelanggan?: string;
        items: {
            itemId: string;
            jumlah: number;
            harga: number;
            satuan: string;
            potPersen?: number;
            potongan?: number;
            keterangan?: string;
        }[];
        keterangan?: string;
    }) {
        // Auto-generate noTransaksi if not provided
        const noTransaksi = data.noTransaksi || `TRX-${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        let subTotal = 0;
        const saleItems = data.items.map((item) => {
            const total = item.harga * item.jumlah * (1 - (item.potPersen || 0) / 100);
            subTotal += total;
            return {
                itemId: item.itemId,
                jumlah: item.jumlah,
                harga: item.harga,
                satuan: item.satuan,
                potPersen: item.potPersen || 0,
                total,
                keterangan: item.keterangan,
            };
        });

        const grandTotal = subTotal;

        return this.prisma.$transaction(async (tx) => {
            const sale = await tx.sale.create({
                data: {
                    businessId: data.businessId,
                    noTransaksi: noTransaksi,
                    pelanggan: data.pelanggan,
                    subTotal,
                    grandTotal,
                    keterangan: data.keterangan,
                    items: {
                        create: saleItems,
                    },
                },
                include: { items: true },
            });

            for (const item of data.items) {
                const itemData = await tx.item.findUnique({ where: { id: item.itemId } });
                if (!itemData || Number(itemData.stock) < item.jumlah) {
                    throw new BadRequestException(`Stok item ${itemData?.namaItem || 'Unknown'} tidak mencukupi (Tersisa: ${itemData?.stock || 0})`);
                }

                await tx.item.update({
                    where: { id: item.itemId },
                    data: { stock: { decrement: item.jumlah } },
                });
            }

            return sale;
        });
    }

    findAll(businessId: string) {
        return this.prisma.sale.findMany({
            where: { businessId },
            include: { items: { include: { item: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.sale.findUnique({
            where: { id },
            include: { items: { include: { item: true } } },
        });
    }
}
