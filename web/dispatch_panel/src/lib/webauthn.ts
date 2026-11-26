/**
 * Cabi Africa WebAuthn / FIDO2 Passkey Client Utility
 */

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
    try {
        if (typeof window !== 'undefined' && window.PublicKeyCredential) {
            return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        }
    } catch (e) {
        // Ignore detection errors
    }
    return false;
}

export function bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function base64urlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function registerPasskeyCredential(
    userId: string,
    email: string,
    challengeBase64: string,
    rpName = 'Cabi Africa Dispatch Console'
): Promise<any> {
    if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported on this browser.');
    }

    const challengeBuffer = base64urlToBuffer(challengeBase64);
    const userBuffer = new TextEncoder().encode(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challengeBuffer,
        rp: {
            name: rpName,
            id: window.location.hostname,
        },
        user: {
            id: userBuffer,
            name: email,
            displayName: email.split('@')[0],
        },
        pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (!credential) {
        throw new Error('Passkey creation cancelled or declined by user.');
    }

    return {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
    };
}

export async function authenticateWithPasskey(
    challengeBase64: string
): Promise<any> {
    if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported on this browser.');
    }

    const challengeBuffer = base64urlToBuffer(challengeBase64);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challengeBuffer,
        rpId: window.location.hostname,
        userVerification: 'preferred',
        timeout: 60000,
    };

    const assertion = (await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (!assertion) {
        throw new Error('Biometric authentication cancelled or declined by user.');
    }

    return {
        id: assertion.id,
        rawId: bufferToBase64url(assertion.rawId),
        type: assertion.type,
    };
}
