import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Initial Admin Setup (Dev only helper)
router.get('/init', async (req, res) => {
    try {
        const count = await prisma.admin.count();
        if (count === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.admin.create({
                data: { email: 'admin@portfolio.com', password: hashedPassword }
            });
            return res.json({ message: 'Admin created: admin@portfolio.com / admin123' });
        }
        res.json({ message: 'Admin already exists' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
