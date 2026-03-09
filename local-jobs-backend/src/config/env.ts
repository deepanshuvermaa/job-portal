import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;

  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;

  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  MSG91_AUTH_KEY: string;
  MSG91_SENDER_ID: string;
  MSG91_TEMPLATE_ID: string;

  BREVO_API_KEY: string;
  EMAIL_FROM: string;

  FIREBASE_PROJECT_ID: string;
  FIREBASE_SERVICE_ACCOUNT: string;

  ADMIN_PASSWORD: string;

  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: EnvConfig = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:5173'),

  SUPABASE_URL: getEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_KEY: getEnv('SUPABASE_SERVICE_KEY'),

  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '30d'),  // 30 days - users stay logged in longer
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '90d'),  // 90 days for refresh

  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),

  MSG91_AUTH_KEY: getEnv('MSG91_AUTH_KEY', 'not-configured'),
  MSG91_SENDER_ID: getEnv('MSG91_SENDER_ID', 'JOBAPP'),
  MSG91_TEMPLATE_ID: getEnv('MSG91_TEMPLATE_ID', 'not-configured'),

  BREVO_API_KEY: getEnv('BREVO_API_KEY', 'not-configured'),
  EMAIL_FROM: getEnv('EMAIL_FROM', 'noreply@yourplatform.com'),

  FIREBASE_PROJECT_ID: getEnv('FIREBASE_PROJECT_ID', 'not-configured'),
  FIREBASE_SERVICE_ACCOUNT: getEnv('FIREBASE_SERVICE_ACCOUNT', '{}'),

  // IMPORTANT: Store bcrypt hash of admin password, not plain text
  // Generate hash: bcrypt.hash('YourPassword', 10)
  // Example hash for 'Dv12062001@': $2a$10$7YK1BdUphGMjZT/Ir7/tyOeMChIywDwYiGKUmpLtbEAClZg/2JIDC
  ADMIN_PASSWORD: getEnv('ADMIN_PASSWORD', '$2a$10$7YK1BdUphGMjZT/Ir7/tyOeMChIywDwYiGKUmpLtbEAClZg/2JIDC'),

  RATE_LIMIT_WINDOW_MS: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
};

export default config;
