import type { NextApiRequest, NextApiResponse } from 'next';
import loginHandler from '../login';
import { applyCorsHeaders } from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (applyCorsHeaders(req, res, 'POST, OPTIONS')) {
        return;
    }
    return loginHandler(req, res);
}
