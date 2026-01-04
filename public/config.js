window.RUNTIME_CONFIG = {
  VITE_BASE_URL: "http://localhost:3000/api/v1",
  VITE_LOG_LEVEL: "info",
  VITE_CDN_DOMAIN: "s3-cdn-server-for-retrieving-files",
  VITE_SPACE_URL: "http://localhost:5403",
  VITE_SPACE_API_KEY: "",
  // Analytics should go through API Gateway, not directly to the service
  // In production, this will be the API Gateway URL (e.g., https://api.socialbeats.es/socialbeats-api)
  VITE_ANALYTICS_SERVICE_URL: "http://localhost:3000"
};
