import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';
import ApiResponseUtil from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponseUtil.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = JWTUtil.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return ApiResponseUtil.unauthorized(res, 'Invalid or expired token');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponseUtil.unauthorized(res);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponseUtil.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};
