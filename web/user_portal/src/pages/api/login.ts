import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3335/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing email/phone or password' });
        }

        // Forward request to backend user-service
        const response = await axios.post(`${BACKEND_URL}/auth/login`, {
            email,
            password
        });

        // The backend now returns a real JWT token
        return res.status(200).json(response.data);

    } catch (error: any) {
        console.error('Login Proxy error:', error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Authentication failed';
        return res.status(status).json({ message });
    }
}
