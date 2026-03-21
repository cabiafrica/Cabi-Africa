import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:3338',
    changeOrigin: true,
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise((resolve, reject) => {
        proxy.web(req, res, {
            target: 'http://localhost:3338',
        }, (err) => {
            if (err) {
                console.error('Proxy error (Driver Org):', err);
                res.status(502).json({ error: 'Bad Gateway', details: err.message });
                resolve(null);
            }
        });
    });
}
