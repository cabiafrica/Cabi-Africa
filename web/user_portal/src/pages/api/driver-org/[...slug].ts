import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxy from 'http-proxy';

const REFERRAL_SERVICE_URL =
    process.env.REFERRAL_SERVICE_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://api.cabi.africa'
        : 'http://localhost:3338');

const proxy = httpProxy.createProxyServer({
    target: REFERRAL_SERVICE_URL,
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
            target: REFERRAL_SERVICE_URL,
        }, (err) => {
            if (err) {
                console.error('Proxy error (Driver Org):', err);
                res.status(502).json({ error: 'Bad Gateway', details: err.message });
                resolve(null);
            }
        });
    });
}
