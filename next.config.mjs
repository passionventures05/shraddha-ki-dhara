/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // static HTML/CSS/JS in ./out (no server needed, free hosting)
  trailingSlash: true, // /products/ -> products/index.html (works on GitHub Pages + Cloudflare Pages)
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default nextConfig;
