import { Controller, Get, Post, Body } from '@nestjs/common';
import { BusinessService } from './business.service';
import { Prisma } from '@prisma/client';

@Controller('businesses')
export class BusinessController {
    constructor(private readonly businessService: BusinessService) { }

    @Post()
    create(@Body() data: Prisma.BusinessCreateInput) {
        return this.businessService.create(data);
    }

    @Get()
    findAll() {
        return this.businessService.findAll();
    }
}
