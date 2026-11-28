import {
  base64urlToBuffer,
  bufferToBase64url,
  isPlatformAuthenticatorAvailable,
  registerPasskeyCredential,
  authenticateWithPasskey,
} from '../lib/webauthn';

describe('Dispatch Panel WebAuthn Passkey Utilities', () => {
  it('round-trips ArrayBuffer <-> base64url without padding or unsafe chars', () => {
    const original = new Uint8Array([0, 1, 2, 251, 252, 253, 254, 255]);
    const encoded = bufferToBase64url(original.buffer);
    expect(encoded).not.toMatch(/[+/=]/);

    const decoded = new Uint8Array(base64urlToBuffer(encoded));
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it('returns false when PublicKeyCredential is unavailable', async () => {
    const prev = (window as any).PublicKeyCredential;
    delete (window as any).PublicKeyCredential;
    expect(await isPlatformAuthenticatorAvailable()).toBe(false);
    (window as any).PublicKeyCredential = prev;
  });

  it('throws clear error when registering or authenticating without WebAuthn support', async () => {
    const prev = (window as any).PublicKeyCredential;
    delete (window as any).PublicKeyCredential;
    await expect(
      registerPasskeyCredential('u1', 'ops@cabi.africa', 'dGVzdA')
    ).rejects.toThrow('WebAuthn is not supported');
    await expect(authenticateWithPasskey('dGVzdA')).rejects.toThrow(
      'WebAuthn is not supported'
    );
    (window as any).PublicKeyCredential = prev;
  });
});
