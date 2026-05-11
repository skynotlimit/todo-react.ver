import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.121.50"],
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default withNextIntl(nextConfig);
