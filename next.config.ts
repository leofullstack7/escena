import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep server packages external so fal client works on the host.
  serverExternalPackages: ["@fal-ai/client"],
  webpack: (config) => {
    // cursor/identity uses ESM .js import specifiers that map to .ts sources.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
