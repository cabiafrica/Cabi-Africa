import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

const AUTH_GATEWAY_URL = process.env.AUTH_GATEWAY_URL || 'http://localhost:3334';

const proxy = httpProxy.createProxyServer({
    target: AUTH_GATEWAY_URL,
    changeOrigin: true,
});

export const config = {
    api: {
        bodyParser: false, // Disable body parser for proxying
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
        if (req.url) {
            req.url = req.url.replace(/^\/api\/dispatch/, '/api');
        }

        // Actually, let's keep it simple.
        // If I send to http://localhost:3334/api/dispatch/... 
        // But dispatch service controller is likely just @Controller('dispatch') or similar?
        // Let's check dispatch.controller.ts

        proxy.web(req, res, {
            target: AUTH_GATEWAY_URL,
        }, (err) => {
            if (err) {
                console.error('Proxy error:', err);
                res.status(502).json({ error: 'Bad Gateway', details: err.message });
                resolve(null);
            }
        });
    });
}
