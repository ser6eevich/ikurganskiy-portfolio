import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import s3, { bucketName } from './s3_config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

const uploadsDir = path.join(__dirname, '../uploads');

async function uploadFile(filePath, key) {
    const fileContent = fs.readFileSync(filePath);
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ACL: 'public-read',
        ContentType: getContentType(filePath)
    });

    try {
        await s3.send(command);
        console.log(`Successfully uploaded: ${key}`);
        // Return the full URL. Timeweb usually follows this pattern:
        return `https://${bucketName}.s3.timeweb.com/${key}`;
    } catch (err) {
        console.error(`Error uploading ${key}:`, err);
        return null;
    }
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.glb': 'model/gltf-binary'
    };
    return map[ext] || 'application/octet-stream';
}

async function startMigration() {
    console.log('--- Starting S3 Migration ---');

    if (!fs.existsSync(uploadsDir)) {
        console.log('Uploads directory not found. Nothing to migrate.');
        return;
    }

    const files = fs.readdirSync(uploadsDir);
    console.log(`Found ${files.length} files in local uploads folder.`);

    const urlMap = {};

    for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        if (fs.lstatSync(filePath).isDirectory()) continue;

        const key = `uploads/${file}`;
        const publicUrl = await uploadFile(filePath, key);
        if (publicUrl) {
            urlMap[`/uploads/${file}`] = publicUrl;
        }
    }

    console.log('--- Updating Database ---');

    // 1. Projects
    const projects = await prisma.project.findMany();
    for (const p of projects) {
        let updated = false;
        let data = {};

        if (p.thumbnail && urlMap[p.thumbnail]) {
            data.thumbnail = urlMap[p.thumbnail];
            updated = true;
        }
        if (p.fileUrl && urlMap[p.fileUrl]) {
            data.fileUrl = urlMap[p.fileUrl];
            updated = true;
        }

        if (updated) {
            await prisma.project.update({ where: { id: p.id }, data });
            console.log(`Updated project DB entry: ${p.title}`);
        }
    }

    // 2. ArchiveItems
    const archiveItems = await prisma.archiveItem.findMany();
    for (const item of archiveItems) {
        let updated = false;
        let data = {};

        if (item.thumbnail && urlMap[item.thumbnail]) {
            data.thumbnail = urlMap[item.thumbnail];
            updated = true;
        }
        if (item.fileUrl && urlMap[item.fileUrl]) {
            data.fileUrl = urlMap[item.fileUrl];
            updated = true;
        }

        if (updated) {
            await prisma.archiveItem.update({ where: { id: item.id }, data });
            console.log(`Updated archive item DB entry: ${item.title}`);
        }
    }

    // 3. CanvasElements
    const elements = await prisma.canvasElement.findMany({ where: { type: 'image' } });
    for (const el of elements) {
        if (el.content && urlMap[el.content]) {
            await prisma.canvasElement.update({
                where: { id: el.id },
                data: { content: urlMap[el.content] }
            });
            console.log(`Updated canvas element DB entry ID: ${el.id}`);
        }
    }

    console.log('--- Migration Completed Successfully ---');
    console.log('Note: Local files in /uploads were NOT deleted. You can delete them later once you verify the site.');
}

startMigration()
    .catch(err => console.error('Migration failed:', err))
    .finally(async () => await prisma.$disconnect());
