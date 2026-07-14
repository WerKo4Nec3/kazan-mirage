/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — the whole app is client-side, so Netlify serves plain
  // HTML/JS/CSS from `out/` with no serverless runtime needed.
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
