import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BusinessService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.BusinessCreateInput) {
        return this.prisma.business.create({ data });
    }

    findAll() {
        return this.prisma.business.findMany();
    }
}
