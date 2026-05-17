export default () => ({
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiration: process.env.JWT_EXPIRATION || '15m',
  },
  recoveryToken: {
    expiration: parseInt(process.env.RECOVERY_TOKEN_EXPIRATION || '15', 10),
  },
  port: parseInt(process.env.PORT || '3000', 10),
});