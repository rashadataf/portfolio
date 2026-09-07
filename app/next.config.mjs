// @next/bundle-analyzer is a devDependency — only import it when ANALYZE=true
// so production doesn't crash with ERR_MODULE_NOT_FOUND.
const withBundleAnalyzer = process.env.ANALYZE === "true"
  ? (await import("@next/bundle-analyzer")).default
  : (config) => config;

function normalizeHostname(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed).hostname;
  } catch {
    return trimmed
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .trim();
  }
}

function getRemoteImagePatterns() {
  const protocolEnv = (process.env.PROTOCOL || "https").toLowerCase();
  const protocol = protocolEnv === "http" ? "http" : "https";

  const hostname = normalizeHostname(process.env.DOMAIN_NAME || "");
  const hostnames = new Set();

  if (hostname) {
    hostnames.add(hostname);
    if (!hostname.startsWith("www.")) {
      hostnames.add(`www.${hostname}`);
    }
  }

  const patterns = Array.from(hostnames).map((h) => ({
    protocol,
    hostname: h,
    pathname: "/api/files/**",
  }));

  patterns.push(
    { protocol: "http", hostname: "localhost", pathname: "/api/files/**" },
    { protocol: "http", hostname: "127.0.0.1", pathname: "/api/files/**" }
  );

  return patterns;
}

const nextConfig = {
  images: {
    remotePatterns: getRemoteImagePatterns(),
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    optimizePackageImports: ["@mui/material", "@mui/icons-material", "lucide-react"],
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

// Only apply bundle analyzer when ANALYZE=true (dev only).
// In production, @next/bundle-analyzer isn't installed (devDependency).
const bundleAnalyzer = process.env.ANALYZE === "true"
  ? withBundleAnalyzer({ enabled: true })
  : (config) => config;

export default bundleAnalyzer(nextConfig);
