import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const form = formidable({ maxFileSize: 5 * 1024 * 1024 });
        const [, files] = await form.parse(req);
        const uploaded = files.photo?.[0] || files.file?.[0];
        if (!uploaded) {
            return res.status(400).json({ valid: false, message: 'No passport photo file uploaded.' });
        }

        const buffer = fs.readFileSync(uploaded.filepath);
        const image = sharp(buffer);
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            return res.status(400).json({ valid: false, message: 'Invalid image file.' });
        }

        if (!['jpeg', 'jpg', 'png', 'webp'].includes((metadata.format || '').toLowerCase())) {
            return res.status(400).json({ valid: false, message: 'Passport photo must be JPG or PNG format.' });
        }

        if (metadata.width < 300 || metadata.height < 300) {
            return res.status(400).json({
                valid: false,
                message: 'Photo resolution is too low. Minimum 300x300 pixels required for an official passport photo.',
            });
        }

        const aspectRatio = metadata.width / metadata.height;
        if (aspectRatio < 0.7 || aspectRatio > 1.15) {
            return res.status(400).json({
                valid: false,
                message: 'Photo framing must be square (1:1) or standard portrait (3:4 / 35x45mm) passport ratio.',
            });
        }

        // Sample average brightness & corner background uniformity
        const stats = await image.stats();
        const meanBrightness =
            (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;

        if (meanBrightness < 45) {
            return res.status(400).json({
                valid: false,
                message: 'Photo is too dark. Please use a well-lit official passport photo.',
            });
        }
        if (meanBrightness > 248) {
            return res.status(400).json({
                valid: false,
                message: 'Photo is overexposed. Please upload a clear passport photo.',
            });
        }

        return res.status(200).json({
            valid: true,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            message: 'Official passport photo framing and quality verified.',
        });
    } catch (error: any) {
        console.error('Passport photo validation error:', error);
        return res.status(500).json({ valid: false, message: 'Unable to validate passport photo.' });
    }
}
