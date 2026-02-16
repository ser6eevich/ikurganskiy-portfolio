import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'https://s3.timeweb.com',
    region: process.env.S3_REGION || 'ru-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true, // Required for many S3-compatible providers like Timeweb
});

export const bucketName = process.env.S3_BUCKET_NAME;
export default s3;
