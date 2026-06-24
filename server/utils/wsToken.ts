// WebSocket token utilities - cryptographically signed tokens for WS authentication
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const SECRET = process.env.WS_TOKEN_SECRET || randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 30000; // 30 seconds

export function createWsToken(user: { sub: string; username?: string; name?: string }): {
  token: string;
  expiresIn: number;
} {
  const payload: TokenPayload = {
    sub: user.sub,
    username: user.username,
    name: user.name,
    exp: Date.now() + TOKEN_TTL_MS,
    nonce: randomBytes(8).toString('hex'),
  };
  return { token: sign(payload), expiresIn: 30 };
}

export function validateWsToken(token: string): { sub: string; username?: string; name?: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;

  // Verify signature
  const expectedSignature = createHmac('sha256', SECRET).update(payloadStr).digest('base64url');

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  // Parse and validate payload
  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadStr));
  } catch {
    return null;
  }

  // Check expiration
  if (payload.exp < Date.now()) {
    return null;
  }

  return {
    sub: payload.sub,
    username: payload.username,
    name: payload.name,
  };
}

// Utils
function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf8');
}

function sign(payload: TokenPayload): string {
  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac('sha256', SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${signature}`;
}

interface TokenPayload {
  sub: string;
  username?: string;
  name?: string;
  exp: number;
  nonce: string;
}
