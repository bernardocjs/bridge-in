import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT!, 10),
  nodeEnv: process.env.NODE_ENV,
  corsOrigin: process.env.CORS_ORIGIN,

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiration: process.env.JWT_EXPIRATION,
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS!, 10),
  },

  pagination: {
    defaultSize: parseInt(process.env.DEFAULT_PAGE_SIZE!, 10),
    maxSize: parseInt(process.env.MAX_PAGE_SIZE!, 10),
  },

  password: {
    maxLength: 72,
  },

  mail: {
    apiKey: process.env.RESEND_API_KEY!,
    from: process.env.MAIL_FROM!,
  },

  logging: {
    level: process.env.LOG_LEVEL,
  },

  slug: {
    maxRetries: parseInt(process.env.MAX_SLUG_RETRIES!, 10),
  },

  prisma: {
    uniqueViolation: 'P2002',
  },
}));

export type AppConfig = ReturnType<typeof appConfig>;
