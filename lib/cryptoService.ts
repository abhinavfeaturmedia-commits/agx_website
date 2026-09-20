// Web Crypto API (AES-GCM 256-bit) client-side encryption utility for AGX Credentials Vault
const ENC_PREFIX = 'enc:v1:';
const MASTER_SALT = 'agx-os-vault-master-key-salt-2026';

// Derive an AES-GCM 256-bit cryptographic key from an organization seed
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(MASTER_SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('agx-vault-crypto-salt-bytes'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Convert ArrayBuffer to Hex String
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to ArrayBuffer
function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

export const cryptoService = {
  // Check if string is already encrypted
  isEncrypted(value?: string): boolean {
    return Boolean(value && value.startsWith(ENC_PREFIX));
  },

  // Encrypt plaintext using AES-GCM
  async encrypt(plaintext: string): Promise<string> {
    if (!plaintext) return '';
    if (this.isEncrypted(plaintext)) return plaintext; // Already encrypted

    try {
      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        // Fallback for non-crypto environments
        return `${ENC_PREFIX}b64:${btoa(plaintext)}`;
      }

      const key = await getCryptoKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plaintext);

      const cipherBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );

      const ivHex = bufToHex(iv.buffer);
      const cipherHex = bufToHex(cipherBuffer);

      return `${ENC_PREFIX}${ivHex}:${cipherHex}`;
    } catch (err) {
      console.warn('Crypto encryption fallback:', err);
      return `${ENC_PREFIX}b64:${btoa(plaintext)}`;
    }
  },

  // Decrypt ciphertext using AES-GCM
  async decrypt(ciphertext: string): Promise<string> {
    if (!ciphertext) return '';
    if (!this.isEncrypted(ciphertext)) return ciphertext; // Return as-is if plain text

    try {
      const payload = ciphertext.slice(ENC_PREFIX.length);

      if (payload.startsWith('b64:')) {
        return atob(payload.slice(4));
      }

      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        return ciphertext;
      }

      const [ivHex, cipherHex] = payload.split(':');
      if (!ivHex || !cipherHex) return ciphertext;

      const key = await getCryptoKey();
      const iv = new Uint8Array(hexToBuf(ivHex));
      const cipherBuffer = hexToBuf(cipherHex);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        cipherBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
      console.warn('Crypto decryption error, returning raw value:', err);
      return ciphertext;
    }
  }
};
