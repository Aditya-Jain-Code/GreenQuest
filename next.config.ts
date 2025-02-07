import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    WEB3_AUTH_CLIENT_ID: process.env.WEB3_AUTH_CLIENT_ID,
    WEB3_AUTH_CLIENT_SECRET: process.env.WEB3_AUTH_CLIENT_SECRET,
  },
};

export default nextConfig;
