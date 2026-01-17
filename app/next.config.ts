import type { NextConfig } from "next";

function normalizeHostname(value: string) {
  // Accept either "example.com" or "https://example.com".
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
  const protocol: "http" | "https" = protocolEnv === "http" ? "http" : "https";

  const hostname = normalizeHostname(process.env.DOMAIN_NAME || "");
  const hostnames = new Set<string>();

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

  // Local development
  patterns.push(
    { protocol: "http", hostname: "localhost", pathname: "/api/files/**" },
    { protocol: "http", hostname: "127.0.0.1", pathname: "/api/files/**" }
  );

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getRemoteImagePatterns(),
    // Configure image qualities used across the app to avoid runtime warnings
    // (logs showed images requesting 60, 75 and 85)
    qualities: [60, 75, 85],
  },
};

export default nextConfig;
