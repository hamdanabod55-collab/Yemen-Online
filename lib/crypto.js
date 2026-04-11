import crypto from 'crypto';

// AES-256-GCM requires a 32-byte key and 16-byte initialization vector (IV)
// For security, the key must be stored in environment variables (e.g., 64-character hex string)
const ALGORITHM = 'aes-256-gcm';
const INTERNAL_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

export function encryptData(text) {
  if (!text) return text;
  
  // Ensure the key is exactly 32 bytes
  const key = Buffer.from(INTERNAL_KEY, 'hex').subarray(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return iv:authTag:encryptedText
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptData(encryptedString) {
  if (!encryptedString) return encryptedString;
  
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) return null;
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    
    const key = Buffer.from(INTERNAL_KEY, 'hex').subarray(0, 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
}
