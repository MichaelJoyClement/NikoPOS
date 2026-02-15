import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const defaultBusiness = await prisma.business.findFirst({
        where: { name: 'Default Business' }
    });

    const abadiBusiness = await prisma.business.findFirst({
        where: { name: 'Abadi AC' }
    });

    if (defaultBusiness && abadiBusiness) {
        // Reassign users
        await prisma.user.updateMany({
            where: { businessId: defaultBusiness.id },
            data: { businessId: abadiBusiness.id }
        });

        // Delete the business
        await prisma.business.delete({
            where: { id: defaultBusiness.id }
        });

        console.log('Successfully reassigned users and deleted Default Business.');
    } else {
        console.log('Either Default Business or Abadi AC not found.');
    }
}
main().finally(() => prisma.$disconnect());
