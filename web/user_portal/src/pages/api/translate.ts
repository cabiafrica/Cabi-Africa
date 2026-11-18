import type { NextApiRequest, NextApiResponse } from 'next';
import {
    SupportedLang,
    translateBatchContextual,
    translateTextWithBreakdown,
} from '@/lib/translator';

const SUPPORTED: SupportedLang[] = ['en', 'sw', 'fr', 'ar'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { text, texts, targetLang = 'sw' } = req.body ?? {};
    const lang = SUPPORTED.includes(targetLang) ? (targetLang as SupportedLang) : 'sw';

    if (Array.isArray(texts)) {
        const cleanTexts = texts
            .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
            .slice(0, 120);
        const translations = await translateBatchContextual(cleanTexts, lang);
        return res.status(200).json({ success: true, targetLang: lang, translations });
    }

    if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ message: 'Text or texts array to translate is required.' });
    }

    const result = await translateTextWithBreakdown(text, lang);
    return res.status(200).json({ success: true, ...result });
}
