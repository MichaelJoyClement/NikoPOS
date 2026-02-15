import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const defaultBusiness = await prisma.business.findFirst({
        where: { name: 'Default Business' }
    });

    if (defaultBusiness) {
        console.log('Found Default Business:', defaultBusiness.id);
        const userCount = await prisma.user.count({ where: { businessId: defaultBusiness.id } });
        const itemCount = await prisma.item.count({ where: { businessId: defaultBusiness.id } });
        const saleCount = await prisma.sale.count({ where: { businessId: defaultBusiness.id } });

        console.log('Relations:');
        console.log('- Users:', userCount);
        console.log('- Items:', itemCount);
        console.log('- Sales:', saleCount);
    } else {
        console.log('Default Business not found.');
    }
}
main().finally(() => prisma.$disconnect());
