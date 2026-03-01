import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiration: process.env.JWT_EXPIRATION || '1d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  pagination: {
    defaultSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
    maxSize: parseInt(process.env.MAX_PAGE_SIZE || '50', 10),
  },

  password: {
    maxLength: 72,
  },
}));

export type AppConfig = ReturnType<typeof appConfig>;
