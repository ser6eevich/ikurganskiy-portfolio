import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const project = await prisma.project.create({
        data: {
            title: 'Anar Dreams x IBA — Africa Charity Tour',
            slug: 'anar-dreams-iba',
            category: 'PRODUCTION', // or CASE STUDY
            description: 'International collaboration with Anar Dreams & IBA. Social experiment and charity in Africa.',
            isPublished: true,
            thumbnail: '', // User will upload later or I can set a placeholder if needed
        },
    });

    console.log('Created project:', project);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
