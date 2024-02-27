export const envConfig = () => ({
  environment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGO_DB,
  port: process.env.PORT || 3000,
  default_limit: process.env.DEFAULT_LIMIT || 10,
});
