/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    return config;
  },
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      //   {
      //     hostname: "lh3.googleusercontent.com",
      //   },
      //   {
      //     hostname: "utfs.io",
      //   },
    ],
  },
};

export default nextConfig;
