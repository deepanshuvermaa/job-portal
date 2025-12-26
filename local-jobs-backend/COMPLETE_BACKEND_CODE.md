# Complete Backend Implementation Guide

## Remaining Files to Create

Due to the extensive nature of a complete production backend, here are all the remaining files you need to create. Copy each section into its respective file path.

---

## 1. Upload Service (`src/services/upload.service.ts`)

```typescript
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export class UploadService {
  /**
   * Upload image to Cloudinary
   */
  static async uploadImage(
    buffer: Buffer,
    folder: string,
    filename?: string
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `job-platform/${folder}`,
          public_id: filename,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}

export default UploadService;
```

---

## 2. Email Service (`src/services/email.service.ts`)

```typescript
import axios from 'axios';
import { config } from '../config/env';

export class EmailService {
  /**
   * Send email via Brevo
   */
  static async sendEmail(
    to: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: config.EMAIL_FROM, name: 'Job Platform' },
          to: [{ email: to }],
          subject: subject,
          htmlContent: htmlContent,
        },
        {
          headers: {
            'api-key': config.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Email sent successfully:', response.data);
      return true;
    } catch (error: any) {
      console.error('Email Error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <h1>Welcome to Job Platform!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining our hyperlocal job marketplace.</p>
      <p>Start exploring verified jobs in your city now!</p>
    `;
    return this.sendEmail(email, 'Welcome to Job Platform', html);
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(
    email: string,
    name: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<boolean> {
    const html = status === 'approved'
      ? `<h1>Profile Approved!</h1><p>Hi ${name}, your profile has been verified and approved.</p>`
      : `<h1>Profile Rejected</h1><p>Hi ${name}, your profile verification was rejected. Reason: ${reason}</p>`;

    return this.sendEmail(email, `Profile ${status}`, html);
  }
}

export default EmailService;
```

---

## 3. Notification Service (`src/services/notification.service.ts`)

```typescript
import { supabase } from '../config/supabase';
import { Notification } from '../types';

export class NotificationService {
  /**
   * Create notification
   */
  static async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: any
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Notification creation error:', error);
      return null;
    }
  }

  /**
   * Send notification to worker when application status changes
   */
  static async applicationStatusChanged(
    workerId: string,
    jobTitle: string,
    status: string
  ): Promise<void> {
    const messages = {
      shortlisted: `You've been shortlisted for ${jobTitle}!`,
      rejected: `Your application for ${jobTitle} was not selected.`,
      hired: `Congratulations! You've been hired for ${jobTitle}!`,
    };

    await this.create(
      workerId,
      'application_status',
      'Application Update',
      messages[status as keyof typeof messages] || `Application status updated to ${status}`,
      '/worker/applications'
    );
  }

  /**
   * Notify employer of new application
   */
  static async newApplication(
    employerId: string,
    jobTitle: string,
    workerName: string
  ): Promise<void> {
    await this.create(
      employerId,
      'new_application',
      'New Application Received',
      `${workerName} has applied for your job: ${jobTitle}`,
      '/employer/applications'
    );
  }
}

export default NotificationService;
```

---

## 4. Auth Middleware (`src/middlewares/auth.middleware.ts`)

```typescript
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
```

---

## 5. Validation Middleware (`src/middlewares/validation.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import ApiResponseUtil from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponseUtil.error(
          res,
          'Validation error',
          400,
          error.errors
        );
      }
      return ApiResponseUtil.error(res, 'Invalid request data');
    }
  };
};
```

---

## 6. Error Middleware (`src/middlewares/error.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import ApiResponseUtil from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return ApiResponseUtil.error(res, err.message, 400);
  }

  if (err.name === 'UnauthorizedError') {
    return ApiResponseUtil.unauthorized(res, err.message);
  }

  return ApiResponseUtil.serverError(res, err.message || 'Internal server error');
};
```

---

## 7. Upload Middleware (`src/middlewares/upload.middleware.ts`)

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg, and .pdf formats allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});
```

---

## 8. Rate Limit Middleware (`src/middlewares/rateLimit.middleware.ts`)

```typescript
import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later.',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many OTP requests, please try again later.',
});
```

---

## Next Steps

1. Create all the above files in their respective paths
2. Create controllers for:
   - Auth Controller
   - Worker Controller
   - Employer Controller
   - Job Controller
   - Admin Controller
3. Create routes for all controllers
4. Create main app.ts and server.ts
5. Install dependencies: `cd local-jobs-backend && npm install`
6. Create .env file based on .env.example
7. Run the backend: `npm run dev`

The backend is designed to work with:
- Supabase (Free PostgreSQL database)
- Cloudinary (Free image storage)
- MSG91 (SMS OTP for India)
- Brevo (Free email service)

Would you like me to continue with the controllers and routes?
