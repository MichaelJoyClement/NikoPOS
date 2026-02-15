import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getInventory(businessId: string) {
        const items = await this.prisma.item.findMany({
            where: { businessId },
            orderBy: { namaItem: 'asc' },
        });

        return items.map((item) => ({
            kode: item.kodeItem,
            nama_produk: item.namaItem,
            umur_hari: Math.floor(
                (new Date().getTime() - new Date(item.createdAt).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
            saldo: item.stock,
            satuan: item.satuan,
            hpp: item.hargaPokok,
            nilai: Number(item.stock) * Number(item.hargaPokok),
            keterangan: item.merek || '-',
        }));
    }

    async getDashboardStats(businessId: string) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [todaySales, totalItems, lowStockItems, recentSales, lowStockList] = await Promise.all([
            // Today's sales
            this.prisma.sale.findMany({
                where: {
                    businessId,
                    tanggal: { gte: todayStart },
                },
                select: { grandTotal: true },
            }),
            // Total items count
            this.prisma.item.count({
                where: { businessId },
            }),
            // Low stock items (stock <= 5)
            this.prisma.item.count({
                where: {
                    businessId,
                    stock: { lte: 5 },
                },
            }),
            // Recent 5 sales
            this.prisma.sale.findMany({
                where: { businessId },
                orderBy: { tanggal: 'desc' },
                take: 5,
                include: {
                    items: { include: { item: true } },
                },
            }),
            // Low stock list (limit 5)
            this.prisma.item.findMany({
                where: {
                    businessId,
                    stock: { lte: 5 },
                },
                orderBy: { stock: 'asc' },
                take: 5,
            }),
        ]);

        const totalPenjualan = todaySales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
        const totalTransaksi = todaySales.length;

        // Top selling items (all time)
        const topItems = await this.prisma.saleItem.groupBy({
            by: ['itemId'],
            where: {
                sale: { businessId },
            },
            _sum: { jumlah: true },
            orderBy: { _sum: { jumlah: 'desc' } },
            take: 5,
        });

        const topItemDetails = await Promise.all(
            topItems.map(async (ti) => {
                const item = await this.prisma.item.findUnique({ where: { id: ti.itemId } });
                return {
                    name: item?.namaItem || 'Unknown',
                    totalSold: Number(ti._sum.jumlah) || 0,
                };
            }),
        );

        return {
            totalPenjualan,
            totalTransaksi,
            totalItems,
            lowStockItems, // This is count
            lowStockList,
            recentSales: recentSales.map((s) => ({
                id: s.id,
                noTransaksi: s.noTransaksi,
                tanggal: s.tanggal,
                grandTotal: s.grandTotal,
                itemCount: s.items.length,
                pelanggan: s.pelanggan,
            })),
            topItems: topItemDetails,
        };
    }

    async getReceipt(transactionId: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id: transactionId },
            include: {
                items: { include: { item: true } },
                business: true,
            },
        });

        if (!sale) return null;

        return {
            store_name: sale.business.name,
            transaction_no: sale.noTransaksi,
            date: sale.tanggal,
            pelanggan: sale.pelanggan || 'Pelanggan Umum',
            items: sale.items.map((i) => ({
                name: i.item.namaItem,
                qty: i.jumlah,
                price: i.harga,
                total: i.total,
                guarantee: i.item.garansi,
            })),
            total: sale.grandTotal,
        };
    }
}
