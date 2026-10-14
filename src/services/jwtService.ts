/**
 * Standard RFC 7519 Compliant JSON Web Token (JWT) Service
 * - Algorithm: HS256 (HMAC with SHA-256)
 * - Self-contained zero-dependency implementation (works identically in Browser, Node, and Web Workers)
 * - Base64URL encoding/decoding
 * - Cryptographic signature verification and expiration tracking
 */

import { JWTPayload, JWTVerifyResult } from '../types';

// Institutional signing secret for Smart Library AI Tokens
const JWT_SECRET = 'smart-library-institutional-hmac-sha256-secret-key-2026-v2';
const JWT_ISSUER = 'smart-library-institutional-auth';
const TOKEN_STORAGE_KEY = 'smartlib_auth_jwt_token';

// ==========================================
// Cryptographic Hash & HMAC Implementation
// ==========================================

function sha256Bytes(ascii: string): number[] {
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  hash = hash.slice(0, 8);
  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';

  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength | 0;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = (w15 >>> 7 | w15 << 25) ^ (w15 >>> 18 | w15 << 14) ^ (w15 >>> 3);
      const s1 = (w2 >>> 17 | w2 << 15) ^ (w2 >>> 19 | w2 << 13) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 =
        hash[7] +
        ((hash[4] >>> 6 | hash[4] << 26) ^ (hash[4] >>> 11 | hash[4] << 21) ^ (hash[4] >>> 25 | hash[4] << 7)) +
        ch +
        k[i] +
        (w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const temp2 =
        ((hash[0] >>> 2 | hash[0] << 30) ^ (hash[0] >>> 13 | hash[0] << 19) ^ (hash[0] >>> 22 | hash[0] << 10)) +
        maj;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  const bytes: number[] = [];
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      bytes.push((hash[i] >> (j * 8)) & 255);
    }
  }
  return bytes;
}

function hmacSha256Bytes(key: string, message: string): number[] {
  let k: number[] = [];
  for (let i = 0; i < key.length; i++) k.push(key.charCodeAt(i) & 255);

  if (k.length > 64) {
    k = sha256Bytes(key);
  }
  while (k.length < 64) k.push(0);

  const o_key_pad = k.map(b => b ^ 0x5c);
  const i_key_pad = k.map(b => b ^ 0x36);

  let innerMsg = '';
  for (let i = 0; i < i_key_pad.length; i++) innerMsg += String.fromCharCode(i_key_pad[i]);
  innerMsg += message;

  const innerHash = sha256Bytes(innerMsg);

  let outerMsg = '';
  for (let i = 0; i < o_key_pad.length; i++) outerMsg += String.fromCharCode(o_key_pad[i]);
  for (let i = 0; i < innerHash.length; i++) outerMsg += String.fromCharCode(innerHash[i]);

  return sha256Bytes(outerMsg);
}

// ==========================================
// Base64URL Encoding & Decoding
// ==========================================

function bytesToBase64Url(bytes: number[]): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa !== 'undefined'
    ? btoa(binary)
    : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function stringToBase64Url(str: string): string {
  const utf8Bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8Bytes.push(charCode);
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8Bytes.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
    } else {
      // surrogate pair
      i++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8Bytes.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
  }
  return bytesToBase64Url(utf8Bytes);
}

function base64UrlToString(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = typeof atob !== 'undefined'
    ? atob(base64)
    : Buffer.from(base64, 'base64').toString('binary');

  // Decode UTF-8
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }
  return decodeURIComponent(escape(binary));
}

// ==========================================
// JWT Service Class
// ==========================================

export class JWTService {
  private secret: string;
  private issuer: string;

  constructor(secret = JWT_SECRET, issuer = JWT_ISSUER) {
    this.secret = secret;
    this.issuer = issuer;
  }

  /**
   * Hashes a password into a secure SHA-256 hex digest
   */
  public hashPassword(password: string): string {
    const bytes = sha256Bytes(`smartlib_salt_2026_${password}`);
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Signs a JWT with the given claims and expiration
   * @param claims Payload claims (subject, email, role, etc.)
   * @param expiresInSeconds Duration token remains valid (default: 7 days)
   */
  public sign(
    claims: Omit<JWTPayload, 'iat' | 'exp' | 'iss'>,
    expiresInSeconds: number = 7 * 24 * 3600
  ): { token: string; payload: JWTPayload } {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload: JWTPayload = {
      ...claims,
      iat: now,
      exp,
      iss: this.issuer,
    };

    const encodedHeader = stringToBase64Url(JSON.stringify(header));
    const encodedPayload = stringToBase64Url(JSON.stringify(payload));
    const message = `${encodedHeader}.${encodedPayload}`;

    const signatureBytes = hmacSha256Bytes(this.secret, message);
    const encodedSignature = bytesToBase64Url(signatureBytes);

    const token = `${message}.${encodedSignature}`;
    return { token, payload };
  }

  /**
   * Verifies the authenticity, signature integrity, and expiration of a JWT token
   */
  public verify(token: string): JWTVerifyResult {
    try {
      if (!token || typeof token !== 'string') {
        return { valid: false, error: 'Token missing or invalid format.' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Malformed JWT: Must contain exactly 3 dot-separated segments.' };
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;

      // 1. Verify header
      const headerStr = base64UrlToString(encodedHeader);
      const header = JSON.parse(headerStr);
      if (header.alg !== 'HS256' || header.typ !== 'JWT') {
        return { valid: false, error: 'Unsupported JWT algorithm or token type.' };
      }

      // 2. Verify signature
      const message = `${encodedHeader}.${encodedPayload}`;
      const expectedSigBytes = hmacSha256Bytes(this.secret, message);
      const expectedSignature = bytesToBase64Url(expectedSigBytes);

      if (encodedSignature !== expectedSignature) {
        return { valid: false, error: 'Invalid JWT signature: token may have been forged or tampered with.' };
      }

      // 3. Verify payload and expiration
      const payloadStr = base64UrlToString(encodedPayload);
      const payload = JSON.parse(payloadStr) as JWTPayload;

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        const expiredAgo = now - payload.exp;
        return { valid: false, error: `JWT token expired ${expiredAgo}s ago. Please authenticate again.` };
      }

      return { valid: true, payload };
    } catch (err: any) {
      return { valid: false, error: `JWT decoding failed: ${err?.message || 'Unknown error'}` };
    }
  }

  /**
   * Decodes payload without strict signature validation (useful for UI inspecting)
   */
  public decode(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadStr = base64UrlToString(parts[1]);
      return JSON.parse(payloadStr) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Browser / Memory Storage Management
   */
  public getStoredToken(): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(TOKEN_STORAGE_KEY) || (globalThis as any).__SMARTLIB_JWT_TOKEN__ || null;
      }
    } catch {}
    return (globalThis as any).__SMARTLIB_JWT_TOKEN__ || null;
  }

  public setStoredToken(token: string): void {
    (globalThis as any).__SMARTLIB_JWT_TOKEN__ = token;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
    } catch {}
  }

  public clearStoredToken(): void {
    delete (globalThis as any).__SMARTLIB_JWT_TOKEN__;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {}
  }
}

// Global Singleton Instance
export const jwtService = new JWTService();
