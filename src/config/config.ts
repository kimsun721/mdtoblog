export default () => ({
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  // MONGO_URL: process.env.MONGO_URL,
  JWTKEY: process.env.JWTKEY,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  CRYPTO_SECRET: process.env.CRYPTO_SECRET,
  FRONT_URL: process.env.FRONT_URL,
});
