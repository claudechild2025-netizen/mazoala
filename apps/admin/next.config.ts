import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mazoala/contracts", "@mazoala/domain", "@mazoala/auth", "@mazoala/db"]
};

export default nextConfig;
