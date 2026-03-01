import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required().min(16),
  JWT_EXPIRATION: Joi.string().default('1d'),

  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),

  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(14).default(12),
  DEFAULT_PAGE_SIZE: Joi.number().integer().min(1).max(100).default(10),
  MAX_PAGE_SIZE: Joi.number().integer().min(1).max(200).default(50),
});
