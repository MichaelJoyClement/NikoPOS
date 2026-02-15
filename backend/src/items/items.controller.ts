import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CostPriceInterceptor } from '../auth/interceptors/cost-price.interceptor';

@UseGuards(JwtAuthGuard)
@UseInterceptors(CostPriceInterceptor)
@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    @Post()
    create(@Body() createItemDto: Prisma.ItemUncheckedCreateInput) {
        return this.itemsService.create(createItemDto);
    }

    @Get()
    findAll(@Query('businessId') businessId: string, @Query('search') search?: string) {
        const where: Prisma.ItemWhereInput = {};
        if (businessId) where.businessId = businessId;
        if (search) {
            where.OR = [
                { namaItem: { contains: search, mode: 'insensitive' } },
                { kodeItem: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }
        return this.itemsService.findAll({ where });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.itemsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateItemDto: Prisma.ItemUpdateInput) {
        return this.itemsService.update(id, updateItemDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.itemsService.remove(id);
    }

    @Post(':id/restock')
    restock(
        @Param('id') id: string,
        @Body() data: { qty: number; hargaBeli: number; hargaJual?: number },
    ) {
        return this.itemsService.restock(id, data.qty, data.hargaBeli, data.hargaJual);
    }
}
