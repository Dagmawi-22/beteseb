import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * End-to-End Encryption Service
 *
 * Uses hybrid encryption:
 * - RSA-OAEP for key exchange (public/private key pairs)
 * - AES-GCM for message encryption (symmetric)
 *
 * Flow:
 * 1. Each user generates an RSA key pair on first use
 * 2. Public keys are shared via the database
 * 3. Private keys are stored securely on device
 * 4. Messages are encrypted with AES-256-GCM
 * 5. AES keys are encrypted with recipient's RSA public key
 */

const PRIVATE_KEY_STORAGE_KEY = 'user_private_key';
const PUBLIC_KEY_STORAGE_KEY = 'user_public_key';

interface EncryptedMessage {
  encryptedContent: string;      // Base64 encoded encrypted message
  encryptedKey: string;          // Base64 encoded encrypted AES key
  iv: string;                    // Base64 encoded initialization vector
}

export class EncryptionService {
  /**
   * Generate RSA key pair for a user
   * Returns: { publicKey, privateKey } in PEM format
   */
  static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    // Note: Web Crypto API (used by expo-crypto) supports RSA key generation
    // For React Native, we'll use SubtleCrypto which is available in modern versions

    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );

    // Export keys to JWK format for storage
    const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

    return {
      publicKey: JSON.stringify(publicKeyJwk),
      privateKey: JSON.stringify(privateKeyJwk),
    };
  }

  /**
   * Store private key securely on device
   */
  static async storePrivateKey(privateKey: string): Promise<void> {
    await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, privateKey);
  }

  /**
   * Store public key on device (for easy retrieval)
   */
  static async storePublicKey(publicKey: string): Promise<void> {
    await SecureStore.setItemAsync(PUBLIC_KEY_STORAGE_KEY, publicKey);
  }

  /**
   * Retrieve private key from secure storage
   */
  static async getPrivateKey(): Promise<string | null> {
    return await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
  }

  /**
   * Retrieve public key from secure storage
   */
  static async getPublicKey(): Promise<string | null> {
    return await SecureStore.getItemAsync(PUBLIC_KEY_STORAGE_KEY);
  }

  /**
   * Check if user has encryption keys set up
   */
  static async hasKeys(): Promise<boolean> {
    const privateKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
    return privateKey !== null;
  }

  /**
   * Encrypt a message for a recipient
   * @param message - Plain text message
   * @param recipientPublicKey - Recipient's public key (JWK format)
   * @returns Encrypted message object
   */
  static async encryptMessage(
    message: string,
    recipientPublicKey: string
  ): Promise<EncryptedMessage> {
    // 1. Generate a random AES key for this message
    const aesKey = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    // 2. Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 3. Encrypt the message with AES-GCM
    const messageData = new TextEncoder().encode(message);
    const encryptedMessageBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      messageData
    );

    // 4. Export the AES key to raw format
    const aesKeyData = await crypto.subtle.exportKey('raw', aesKey);

    // 5. Import recipient's public key
    const publicKeyJwk = JSON.parse(recipientPublicKey);
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );

    // 6. Encrypt the AES key with recipient's RSA public key
    const encryptedKeyBuffer = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      aesKeyData
    );

    // 7. Convert everything to Base64 for storage/transmission
    return {
      encryptedContent: this.arrayBufferToBase64(encryptedMessageBuffer),
      encryptedKey: this.arrayBufferToBase64(encryptedKeyBuffer),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  /**
   * Decrypt a message using user's private key
   * @param encryptedMessage - Encrypted message object
   * @returns Decrypted plain text message
   */
  static async decryptMessage(encryptedMessage: EncryptedMessage): Promise<string> {
    // 1. Get user's private key from secure storage
    const privateKeyJwkString = await this.getPrivateKey();
    if (!privateKeyJwkString) {
      throw new Error('Private key not found');
    }

    // 2. Import private key
    const privateKeyJwk = JSON.parse(privateKeyJwkString);
    const privateKey = await crypto.subtle.importKey(
      'jwk',
      privateKeyJwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['decrypt']
    );

    // 3. Decrypt the AES key using RSA private key
    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedMessage.encryptedKey);
    const aesKeyData = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encryptedKeyBuffer
    );

    // 4. Import the AES key
    const aesKey = await crypto.subtle.importKey(
      'raw',
      aesKeyData,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['decrypt']
    );

    // 5. Decrypt the message using AES key
    const encryptedContentBuffer = this.base64ToArrayBuffer(encryptedMessage.encryptedContent);
    const iv = this.base64ToArrayBuffer(encryptedMessage.iv);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      encryptedContentBuffer
    );

    // 6. Convert decrypted data back to string
    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Initialize encryption for a user (generate and store keys)
   * @returns Public key to be stored in the database
   */
  static async initializeEncryption(): Promise<string> {
    const hasKeys = await this.hasKeys();
    if (hasKeys) {
      // If keys exist, return the existing public key
      const existingPublicKey = await this.getPublicKey();
      if (existingPublicKey) {
        return existingPublicKey;
      }
    }

    const { publicKey, privateKey } = await this.generateKeyPair();
    await this.storePrivateKey(privateKey);
    await this.storePublicKey(publicKey);
    return publicKey;
  }

  /**
   * Get user's public key from their stored private key
   * (In case we need to re-upload it)
   */
  static async getPublicKeyFromPrivateKey(): Promise<string | null> {
    const privateKeyJwkString = await this.getPrivateKey();
    if (!privateKeyJwkString) {
      return null;
    }

    // Import private key
    const privateKeyJwk = JSON.parse(privateKeyJwkString);
    const privateKey = await crypto.subtle.importKey(
      'jwk',
      privateKeyJwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );

    // Note: We need to derive public key from private key
    // In practice, we should store both. Let's modify our approach.
    // For now, we'll store both public and private keys together
    return null; // This is a limitation we'll address
  }

  /**
   * Clear all encryption keys (e.g., on logout)
   */
  static async clearKeys(): Promise<void> {
    await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
    await SecureStore.deleteItemAsync(PUBLIC_KEY_STORAGE_KEY);
  }

  // Utility functions
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
