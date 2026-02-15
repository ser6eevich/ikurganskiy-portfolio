import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Database Path Normalization ---');

    // 1. Update Project thumbnails
    const projects = await prisma.project.findMany();
    console.log(`Checking ${projects.length} projects...`);
    for (const project of projects) {
        if (project.thumbnail && project.thumbnail.includes('localhost:5000')) {
            const relativePath = project.thumbnail.split('localhost:5000')[1];
            await prisma.project.update({
                where: { id: project.id },
                data: { thumbnail: relativePath }
            });
            console.log(`Updated project: ${project.title}`);
        }
    }

    // 2. Update ArchiveItem fileUrls and thumbnails
    const archiveItems = await prisma.archiveItem.findMany();
    console.log(`Checking ${archiveItems.length} archive items...`);
    for (const item of archiveItems) {
        let updateData = {};
        let changed = false;

        if (item.fileUrl && item.fileUrl.includes('localhost:5000')) {
            updateData.fileUrl = item.fileUrl.split('localhost:5000')[1];
            changed = true;
        }

        if (item.thumbnail && item.thumbnail.includes('localhost:5000')) {
            updateData.thumbnail = item.thumbnail.split('localhost:5000')[1];
            changed = true;
        }

        if (changed) {
            await prisma.archiveItem.update({
                where: { id: item.id },
                data: updateData
            });
            console.log(`Updated archive item: ${item.title}`);
        }
    }

    // 3. Update CanvasElement content (for images)
    const elements = await prisma.canvasElement.findMany({
        where: { type: 'image' }
    });
    console.log(`Checking ${elements.length} canvas elements...`);
    for (const el of elements) {
        if (el.content && el.content.includes('localhost:5000')) {
            const relativePath = el.content.split('localhost:5000')[1];
            await prisma.canvasElement.update({
                where: { id: el.id },
                data: { content: relativePath }
            });
            console.log(`Updated element ID: ${el.id}`);
        }
    }

    console.log('--- Path Normalization Completed ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
