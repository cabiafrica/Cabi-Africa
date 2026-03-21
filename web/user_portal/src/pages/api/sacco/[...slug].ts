import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

// Create a proxy instance with target set to the sacco service (port 3338)
const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:3338',
    changeOrigin: true,
});

export const config = {
    api: {
        bodyParser: false, // Must disable body parser for proxying to work correctly
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
        // req.url will be something like /api/sacco/list
        // sacco-service sets global prefix 'api' and has controllers like @Controller('sacco')
        // So it expects /api/sacco/list
        // Since Next.js removes the base match in some configs, but usually [...slug] keeps it?
        // Actually, if we hit /api/sacco/list, the proxy.web sends it as /api/sacco/list to target.
        // Target is localhost:3338. So it hits http://localhost:3338/api/sacco/list.
        // which matches sacco-service's routing!
        
        proxy.web(req, res, {
            target: 'http://localhost:3338',
        }, (err) => {
            if (err) {
                console.error('Proxy error (SACCO):', err);
                res.status(502).json({ error: 'Bad Gateway', details: err.message });
                resolve(null);
            }
        });
    });
}
