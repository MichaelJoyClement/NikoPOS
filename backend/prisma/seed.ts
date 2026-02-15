import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const username = 'owner';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create Businesses
    const businessAbadi = await prisma.business.upsert({
        where: { id: '3711db27-6726-0000-0000-608d67bf750c' }, // Static UUID for consistency
        update: { name: 'Abadi AC' },
        create: {
            id: '3711db27-6726-0000-0000-608d67bf750c',
            name: 'Abadi AC',
        },
    });

    const businessMoza = await prisma.business.upsert({
        where: { id: '12a3cc6e-ce65-0000-0000-d5ddf30f1b0c' },
        update: { name: 'Moza Variasi' },
        create: {
            id: '12a3cc6e-ce65-0000-0000-d5ddf30f1b0c',
            name: 'Moza Variasi',
        },
    });

    // 2. Create Users
    const passwordOwner = 'password123';
    const hashedOwner = await bcrypt.hash(passwordOwner, 10);

    const owner = await prisma.user.upsert({
        where: { username },
        update: {},
        create: {
            username,
            password: hashedOwner,
            role: 'OWNER',
            businessId: businessAbadi.id,
        },
    });

    const usernameAdmin = 'admin';
    const passwordAdmin = 'admin123';
    const hashedAdmin = await bcrypt.hash(passwordAdmin, 10);

    const admin = await prisma.user.upsert({
        where: { username: usernameAdmin },
        update: {},
        create: {
            username: usernameAdmin,
            password: hashedAdmin,
            role: 'ADMIN',
            businessId: businessAbadi.id,
        },
    });

    console.log('Seeded businesses:', businessAbadi.name, ',', businessMoza.name);
    console.log('Seeded owner user:', owner.username, '(password123)');
    console.log('Seeded admin user:', admin.username, '(admin123)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
