import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3335/api';

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
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        // Prepare FormData for the backend
        const backendFormData = new FormData();

        // Append all fields
        Object.entries(fields).forEach(([key, value]) => {
            const val = Array.isArray(value) ? value[0] : value;
            if (val !== undefined) backendFormData.append(key, val);
        });

        // Append all files
        Object.entries(files).forEach(([key, fileList]) => {
            const filesArray = Array.isArray(fileList) ? fileList : [fileList];
            filesArray.forEach((file) => {
                if (file) {
                    backendFormData.append(key, fs.createReadStream(file.filepath), {
                        filename: file.originalFilename || key,
                        contentType: file.mimetype || 'application/octet-stream',
                    });
                }
            });
        });

        const role = Array.isArray(fields.role) ? fields.role[0] : fields.role;
        let endpoint = '/auth/register'; // Default passenger

        if (role === 'driver') endpoint = '/auth/register-driver';
        if (role === 'organization') endpoint = '/auth/register-organization';

        const response = await axios.post(`${BACKEND_URL}${endpoint}`, backendFormData, {
            headers: {
                ...backendFormData.getHeaders(),
            },
        });

        return res.status(200).json(response.data);

    } catch (error: any) {
        console.error('Registration Proxy error:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Registration failed';
        return res.status(status).json({ message });
    }
}
