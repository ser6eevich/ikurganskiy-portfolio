import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all archive items
router.get('/', async (req, res) => {
    const items = await prisma.archiveItem.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(items);
});

// CREATE archive item
router.post('/', async (req, res) => {
    const { title, fileUrl, type, category, description, orientation, thumbnail } = req.body;
    try {
        const newItem = await prisma.archiveItem.create({
            data: {
                title,
                fileUrl,
                type,
                category,
                description,
                orientation,
                thumbnail
            }
        });
        res.json(newItem);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// UPDATE archive item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, category, orientation, thumbnail } = req.body;
    try {
        const updatedItem = await prisma.archiveItem.update({
            where: { id: parseInt(id) },
            data: { title, description, category, orientation, thumbnail }
        });
        res.json(updatedItem);
    } catch (e) {
        console.error("Update Error:", e);
        res.status(500).json({ error: 'Failed to update item', details: e.message });
    }
});

// DELETE archive item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.archiveItem.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

export default router;
