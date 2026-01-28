/**
 * Auth Library Tests
 * Tests authentication utility functions without database dependencies
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Test the underlying libraries directly since the auth module depends on Prisma
describe('Authentication Functions', () => {
  const JWT_SECRET = 'test-secret';

  describe('Password Hashing (bcrypt)', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 12);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 12);
      
      const isValid = await bcrypt.compare('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should verify a valid token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should reject token with wrong secret', () => {
      const payload = { userId: 'user123' };
      const token = jwt.sign(payload, JWT_SECRET);
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });

    it('should reject expired token', () => {
      const payload = { userId: 'user123' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
      
      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });

    it('should include iat and exp in token', () => {
      const payload = { userId: 'user123' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('Token Extraction Logic', () => {
    it('should extract token from Bearer header', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      
      const extractToken = (header: string): string | null => {
        if (header?.startsWith('Bearer ')) {
          return header.substring(7);
        }
        return null;
      };
      
      const token = extractToken(authHeader);
      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
    });

    it('should return null for non-Bearer header', () => {
      const extractToken = (header: string): string | null => {
        if (header?.startsWith('Bearer ')) {
          return header.substring(7);
        }
        return null;
      };
      
      expect(extractToken('Basic abc123')).toBeNull();
      expect(extractToken('')).toBeNull();
    });

    it('should extract token from cookie string', () => {
      const cookieHeader = 'admin_token=abc123; other_cookie=xyz';
      
      const extractFromCookie = (cookies: string): string | null => {
        const parsed = Object.fromEntries(
          cookies.split('; ').map(c => c.split('='))
        );
        return parsed['admin_token'] || null;
      };
      
      expect(extractFromCookie(cookieHeader)).toBe('abc123');
    });
  });
});
