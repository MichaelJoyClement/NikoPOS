import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.ItemUncheckedCreateInput) {
        return this.prisma.item.create({ data });
    }

    findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ItemWhereUniqueInput;
        where?: Prisma.ItemWhereInput;
        orderBy?: Prisma.ItemOrderByWithRelationInput;
    }) {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.item.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    findOne(id: string) {
        return this.prisma.item.findUnique({ where: { id } });
    }

    update(id: string, data: Prisma.ItemUpdateInput) {
        return this.prisma.item.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const hasSales = await this.prisma.saleItem.findFirst({
            where: { itemId: id },
        });

        if (hasSales) {
            throw new BadRequestException('Item tidak dapat dihapus karena memiliki riwayat penjualan. Silakan non-aktifkan item jika tidak ingin digunakan.');
        }

        return this.prisma.item.delete({ where: { id } });
    }

    async restock(id: string, qty: number, hargaBeli: number, hargaJual?: number) {
        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item) throw new BadRequestException('Item not found');

        const currentStock = Number(item.stock);
        const currentHPP = Number(item.hargaPokok);

        // Weighted Average Cost Formula
        // (OldQty * OldPrice + NewQty * NewPrice) / (OldQty + NewQty)
        const totalValue = (currentStock * currentHPP) + (qty * hargaBeli);
        const newStock = currentStock + qty;
        const newHPP = newStock > 0 ? totalValue / newStock : hargaBeli;

        return this.prisma.item.update({
            where: { id },
            data: {
                stock: newStock,
                hargaPokok: newHPP,
                hargaJual: hargaJual ?? item.hargaJual, // Update sending price if provided
            },
        });
    }
}
