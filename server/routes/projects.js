import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all projects (Public & Private for admin)
router.get('/', async (req, res) => {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
});

// GET single project by slug or ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const project = await prisma.project.findFirst({
        where: {
            OR: [
                { slug: id },
                { id: isNaN(Number(id)) ? undefined : Number(id) }
            ]
        },
        include: { elements: true }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
});

// CREATE Project
router.post('/', async (req, res) => {
    const { title, slug, category, thumbnail } = req.body;
    try {
        const project = await prisma.project.create({
            data: {
                title,
                slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
                category,
                thumbnail: thumbnail || ''
            }
        });
        res.json(project);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Slug already exists or invalid data' });
    }
});

// UPDATE Project Details
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, slug, category, thumbnail } = req.body;
    try {
        const project = await prisma.project.update({
            where: { id: Number(id) },
            data: { title, slug, category, thumbnail }
        });
        res.json(project);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// UPDATE Canvas Elements (Batch)
router.patch('/:id/elements', async (req, res) => {
    const { id } = req.params; // project ID
    const { elements } = req.body; // Array of elements

    try {
        // Delete old
        await prisma.canvasElement.deleteMany({ where: { projectId: Number(id) } });

        // Create new
        if (elements && elements.length > 0) {
            const newElements = elements.map(el => ({
                type: el.type,
                content: el.content,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                styles: el.styles ? JSON.stringify(el.styles) : '{}',
                projectId: Number(id)
            }));
            await prisma.canvasElement.createMany({ data: newElements });
        }

        const updated = await prisma.project.findUnique({
            where: { id: Number(id) },
            include: { elements: true }
        });
        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save elements' });
    }
});

// DELETE Project
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Step 1: Delete elements explicitly
        await prisma.canvasElement.deleteMany({
            where: { projectId: Number(id) }
        });

        // Step 2: Delete the project
        await prisma.project.delete({
            where: { id: Number(id) }
        });

        res.json({ success: true });
    } catch (e) {
        console.error("Delete Error:", e);
        if (e.code === 'P2025') {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(500).json({ error: e.message || 'Failed to delete project' });
    }
});

export default router;
