/**
 * Auth Controller Unit Tests
 */

const { hashPassword, comparePassword } = require('../../src/utils/encryption');
const { generateAccessToken, verifyAccessToken } = require('../../src/config/jwt');

describe('Authentication', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should verify password correctly', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      const isValid = await comparePassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Tokens', () => {
    it('should generate access token', () => {
      const payload = { id: '123', email: 'test@example.com', role: 'admin' };
      const token = generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify access token', () => {
      const payload = { id: '123', email: 'test@example.com', role: 'admin' };
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });
});

