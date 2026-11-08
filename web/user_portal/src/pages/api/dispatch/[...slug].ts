import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

const DISPATCH_SERVICE_TARGET =
    process.env.DISPATCH_SERVICE_URL?.replace(/\/api\/?$/, '') ||
    process.env.NEXT_PUBLIC_DISPATCH_SERVICE_URL?.replace(/\/api\/?$/, '') ||
    process.env.AUTH_GATEWAY_URL?.replace(/\/api\/?$/, '') ||
    'https://dispatch-service-746659778850.us-central1.run.app';

const proxy = httpProxy.createProxyServer({
    target: DISPATCH_SERVICE_TARGET,
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
            target: DISPATCH_SERVICE_TARGET,
        }, (err) => {
            if (err) {
                console.error('Proxy error:', err);
                res.status(502).json({ error: 'Bad Gateway', details: err.message });
                resolve(null);
            }
        });
    });
}
