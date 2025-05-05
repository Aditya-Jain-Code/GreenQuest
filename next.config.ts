import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
    WEB3AUTH_CLIENT_ID: process.env.WEB3AUTH_CLIENT_ID,
    WEB3AUTH_CLIENT_SECRET: process.env.WEB3AUTH_CLIENT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
};

export default nextConfig;
