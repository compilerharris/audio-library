import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local premium placeholder covers are SVG; they are static assets we
    // author ourselves, so allowing SVG through the optimizer is safe here.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
