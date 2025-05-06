const Joi = require('joi');

const authConfigSchema = Joi.object({
  port: Joi.number().integer().min(1).default(3000),
  basePath: Joi.string().default('/api/auth'),
  jwt: Joi.object({
    accessSecret: Joi.string().required(),
    refreshSecret: Joi.string().required(),
    accessExpiresIn: Joi.string().default('15m'),
    refreshExpiresIn: Joi.string().default('7d')
  }).required(),
  rateLimit: Joi.object({
    windowMs: Joi.number().integer().default(60 * 1000),
    max: Joi.number().integer().default(100),
    message: Joi.string().default('Too many requests')
  }).required(),
  logging: Joi.object({
    format: Joi.string().valid('combined','common','dev','short','tiny').default('dev')
  }).required(),
  providers: Joi.object({
    email: Joi.object().required(),
    sms: Joi.object().required()
  }).required(),
  storage: Joi.object({
    tokenBlacklist: Joi.object({
      type: Joi.string().valid('memory','redis').default('memory'),
      options: Joi.object().default({})
    }).required()
  }).required(),
  apiKey: Joi.object({
    require: Joi.boolean().default(false)
  }).default({ require: false }),
    cors: Joi.object({
        origin: Joi.string().default('*'),
        methods: Joi.string().default('GET,HEAD,PUT,PATCH,POST,DELETE'),
        preflightContinue: Joi.boolean().default(false),
        optionsSuccessStatus: Joi.number().default(204)
    }).default({}),
    helmet: Joi.object({
        contentSecurityPolicy: Joi.boolean().default(false),
        dnsPrefetchControl: Joi.boolean().default(true),
        frameguard: Joi.boolean().default(true),
        hidePoweredBy: Joi.boolean().default(true),
        hsts: Joi.boolean().default(true),
        ieNoOpen: Joi.boolean().default(true),
        noSniff: Joi.boolean().default(true),
        xssFilter: Joi.boolean().default(true)
    }).default({}),
    
  plugins: Joi.array().items(Joi.string()).default([])
});

module.exports = { authConfigSchema };