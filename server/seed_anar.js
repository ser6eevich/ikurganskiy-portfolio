import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const project = await prisma.project.create({
            data: {
                title: 'Anar Dreams x IBA — Africa Charity Tour',
                slug: 'anar-dreams-iba',
                category: 'PRODUCTION',
                description: 'International collaboration with Anar Dreams & IBA. Social experiment and charity in Africa.',
                isPublished: true,
                thumbnail: '',
            },
        });
        console.log('Created project:', project);
    } catch (e) {
        console.error(e);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
