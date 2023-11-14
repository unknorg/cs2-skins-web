/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['raw.githubusercontent.com', 'steamcdn-a.akamaihd.net'],
    },
    experimental: {
        instrumentationHook: true,
    }
}

module.exports = nextConfig
