import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthTokens, DecodedToken } from '../types';

export class JWTUtil {
  /**
   * Generate access and refresh tokens
   */
  static generateTokens(userId: string, role: 'worker' | 'employer' | 'admin'): AuthTokens {
    const accessToken = jwt.sign(
      { userId, role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, role },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as DecodedToken;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decode(token: string): any {
    return jwt.decode(token);
  }
}

export default JWTUtil;
