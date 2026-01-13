import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

// Create a proxy instance with target set to the dispatch service
const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:3334',
    changeOrigin: true,
    pathRewrite: {
        '^/api/dispatch': '/api', // Rewrite /api/dispatch/drivers -> /api/drivers if dispatch service has /api/drivers
    },
});

export const config = {
    api: {
        bodyParser: false, // Disable body parser for proxying
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
        // If dispatch service has URLs like /drivers, we want /api/dispatch/drivers -> /drivers? 
        // Wait, dispatch-service main.ts sets globalPrefix='api'. So it expects /api/...
        // So /api/dispatch/drivers -> /api/drivers

        // Let's adjust pathRewrite
        // req.url will be /api/dispatch/something
        // We want target/api/somethng

        // Actually, let's keep it simple.
        // If I send to http://localhost:3334/api/dispatch/... 
        // But dispatch service controller is likely just @Controller('dispatch') or similar?
        // Let's check dispatch.controller.ts

        proxy.web(req, res, {
            target: 'http://localhost:3334',
        }, (err) => {
            if (err) {
                console.error('Proxy error:', err);
                res.status(502).json({ error: 'Bad Gateway', details: err.message });
                resolve(null);
            }
        });
    });
}
