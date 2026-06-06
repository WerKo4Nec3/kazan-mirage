/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pannellum accesses window/document — suppress SSR for that component
  // via dynamic() in the component itself; no special config needed.
};

export default nextConfig;
