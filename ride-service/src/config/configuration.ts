export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'ride_user',
    password: process.env.DB_PASSWORD || 'ride_pass',
    database: process.env.DB_DATABASE || 'ride_service',
  },
  ors: {
    apiUrl: process.env.ORS_API_URL || 'http://localhost:8082/ors',
    apiKey: process.env.ORS_API_KEY || '',
  },
  app: {
    port: parseInt(process.env.PORT || '3001', 10),
    environment: process.env.NODE_ENV || 'development',
  },
  ws: {
    port: parseInt(process.env.WS_PORT || '3002', 10),
  },
  ride: {
    searchRadiusMeters: parseInt(process.env.DRIVER_SEARCH_RADIUS_METERS || '5000', 10),
    offerTimeoutSeconds: parseInt(process.env.DRIVER_OFFER_TIMEOUT_SECONDS || '20', 10),
    scheduledSearchBeforeMinutes: parseInt(process.env.SCHEDULED_SEARCH_BEFORE_MINUTES || '10', 10),
  },
});
