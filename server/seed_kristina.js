
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Kristina Egiazarova Project...');

    const projectData = {
        title: 'Kristina Egiazarova — AI Avatar Ecosystem',
        slug: 'kristina-ai-ecosystem',
        category: 'AI / PRODUCTION',
        description: 'Создание экосистемы «цифровых двойников» для Кристины Егиазаровой. Цель проекта — масштабирование личного бренда и производство контента без физического участия спикера.',
        thumbnail: '', // Placeholder, user needs to upload
        isPublished: true,
    };

    const existing = await prisma.project.findFirst({
        where: { slug: projectData.slug }
    });

    if (existing) {
        console.log(`Project "${projectData.title}" already exists. Updating...`);
        await prisma.project.update({
            where: { id: existing.id },
            data: projectData
        });
    } else {
        await prisma.project.create({
            data: projectData
        });
        console.log(`Project "${projectData.title}" created.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
