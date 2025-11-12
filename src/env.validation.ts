import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),

  // Gmail API Configuration
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REFRESH_TOKEN: Joi.string().required(),
  GOOGLE_REDIRECT_URI: Joi.string()
    .uri()
    .default('https://developers.google.com/oauthplayground'),
  FROM_EMAIL: Joi.string().email().required(),
  FROM_NAME: Joi.string().required(),

  // Redis Configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
});
