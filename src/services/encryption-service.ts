'use server';
/**
 * @fileOverview A server-side service for encrypting and decrypting sensitive data, such as managed credentials.
 * This service uses AES-256-GCM, a secure authenticated encryption algorithm.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

let encryptionKey: Buffer;

function getEncryptionKey(): Buffer {
  if (!encryptionKey) {
    const secret = process.env.ENCRYPTION_SECRET_KEY;
    if (!secret || secret.length < 16) {
      console.error('[ENCRYPTION SERVICE] FATAL: ENCRYPTION_SECRET_KEY is not defined or is too short. It must be at least 16 characters long. Credential encryption/decryption will fail.');
      throw new Error('Encryption key is not configured properly.');
    }
    // Use SHA-256 to ensure the key is always 32 bytes (256 bits) long, suitable for AES-256.
    encryptionKey = crypto.createHash('sha256').update(String(secret)).digest();
  }
  return encryptionKey;
}

/**
 * Encrypts a piece of text.
 * @param text The plain text to encrypt.
 * @returns A string containing the iv, auth tag, and encrypted data, separated by colons and hex-encoded.
 */
export async function encrypt(text: string): Promise<string> {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine iv, authTag, and encrypted data into a single string for storage.
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a payload created by the `encrypt` function.
 * @param encryptedPayload The string containing the iv, auth tag, and encrypted data.
 * @returns The decrypted plain text.
 */
export async function decrypt(encryptedPayload: string): Promise<string> {
  try {
    const key = getEncryptionKey();
    const parts = encryptedPayload.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format.');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error: any) {
    console.error(`[ENCRYPTION SERVICE] Decryption failed. Error: ${error.message}. This may be due to a changed ENCRYPTION_SECRET_KEY or tampered data.`);
    throw new Error('Decryption failed.');
  }
}
