import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import multerS3 from 'multer-s3';
import s3, { bucketName } from '../s3_config.js';

const router = express.Router();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `uploads/${uuidv4()}${ext}`);
        }
    }),
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // multer-s3 provides location which is the full URL
    const fileUrl = req.file.location;
    res.json({ url: fileUrl, filename: req.file.key, mimetype: req.file.mimetype });
});

export default router;
