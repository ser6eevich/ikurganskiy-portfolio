import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/send', async (req, res) => {
    const { name, contact, description, formats } = req.body;

    if (!name || !contact) {
        return res.status(400).json({ error: 'Name and Contact are required' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token || !chatId) {
        console.error('Telegram Credentials Missing');
        return res.status(500).json({ error: 'Server configuration error (Telegram)' });
    }

    const formatList = formats && formats.length > 0 ? formats.join(', ') : 'Не указан';

    // HTML Message Formatting
    const message = `
🚀 <b>НОВАЯ ЗАЯВКА</b>

👤 <b>Имя:</b> ${name}
📧 <b>Связь:</b> ${contact}
🏷 <b>Формат:</b> ${formatList}

📝 <b>Описание:</b>
${description || 'Без описания'}
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (response.ok) { // check response.ok, not data.ok (Telegram returns { ok: true, ... })
            if (data.ok) {
                res.json({ success: true, telegram: data });
            } else {
                console.error('Telegram Logic Error', data);
                res.status(500).json({ error: 'Failed to send to Telegram', details: data });
            }
        } else {
            console.error('Telegram HTTP Error', data);
            res.status(500).json({ error: 'Failed to send to Telegram', details: data });
        }
    } catch (error) {
        console.error('Network Error:', error);
        res.status(500).json({ error: 'Network error sending to Telegram', details: error.message });
    }
});

export default router;
