// src/config/database.js
//import dotenv from 'dotenv';
// dotenv.config();

const config = {
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE || "",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true" || true,
    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERTIFICATE === "true" || true,
  },
};

export default config;
