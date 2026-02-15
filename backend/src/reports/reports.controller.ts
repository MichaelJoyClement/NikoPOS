import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CostPriceInterceptor } from '../auth/interceptors/cost-price.interceptor';

@UseGuards(JwtAuthGuard)
@UseInterceptors(CostPriceInterceptor)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    getDashboardStats(@Query('businessId') businessId: string) {
        return this.reportsService.getDashboardStats(businessId);
    }

    @Get('inventory')
    getInventory(@Query('businessId') businessId: string) {
        return this.reportsService.getInventory(businessId);
    }

    @Get('receipt/:transactionId')
    getReceipt(@Param('transactionId') transactionId: string) {
        return this.reportsService.getReceipt(transactionId);
    }
}
