import { safeStorage } from 'electron';
import * as crypto from 'crypto';

export class SecureStorage {
  // Check if encryption is available
  static isEncryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }

  // Encrypt sensitive data using OS keychain
  static encrypt(plainText: string): Buffer {
    if (!this.isEncryptionAvailable()) {
      console.warn('Encryption not available, storing in plain text');
      return Buffer.from(plainText);
    }
    return safeStorage.encryptString(plainText);
  }

  // Decrypt sensitive data
  static decrypt(encrypted: Buffer): string {
    if (!this.isEncryptionAvailable()) {
      return encrypted.toString();
    }
    return safeStorage.decryptString(encrypted);
  }

  // For storing in JSON files, convert Buffer to base64
  static encryptToBase64(plainText: string): string {
    const encrypted = this.encrypt(plainText);
    return encrypted.toString('base64');
  }

  static decryptFromBase64(base64: string): string {
    const buffer = Buffer.from(base64, 'base64');
    return this.decrypt(buffer);
  }
}

// Alternative: Custom encryption using a master password
export class CustomEncryption {
  private static algorithm = 'aes-256-gcm';
  
  // Derive key from master password
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  }

  static encrypt(text: string, masterPassword: string): string {
    const salt = crypto.randomBytes(16);
    const key = this.deriveKey(masterPassword, salt);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv) as crypto.CipherGCM;
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine salt, iv, authTag, and encrypted data
    return JSON.stringify({
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted
    });
  }

  static decrypt(encryptedData: string, masterPassword: string): string {
    const { salt, iv, authTag, data } = JSON.parse(encryptedData);
    
    const key = this.deriveKey(
      masterPassword,
      Buffer.from(salt, 'hex')
    );
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, 'hex')
    ) as crypto.DecipherGCM;
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}