// admin-2fa.service.ts
import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

/**
 * Service handling admin two‑factor authentication (TOTP).
 * It can generate a secret, produce a QR code data URL, and verify a token.
 * In a real implementation you would persist the secret per admin user.
 */
@Injectable()
export class Admin2FAService {
    /** Generate a new TOTP secret for an admin */
    generateSecret(adminId: string) {
        const secret = speakeasy.generateSecret({ name: `Cabi Admin (${adminId})` });
        // In a real app, store secret.secret for the admin
        return secret;
    }

    /** Return a data‑URL QR code for the secret */
    async generateQrCodeDataUrl(secret: speakeasy.GeneratedSecret): Promise<string> {
        return QRCode.toDataURL(secret.otpauth_url);
    }

    /** Verify a TOTP token */
    verifyToken(secretBase32: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret: secretBase32,
            encoding: 'base32',
            token,
            window: 1,
        });
    }
}
