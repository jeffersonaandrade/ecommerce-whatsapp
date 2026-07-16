import type { NextConfig } from 'next'
import { SECURITY_HEADERS } from './lib/security/security-headers'

function getSupabaseProductsRemotePattern():
  | { protocol: 'https'; hostname: string; pathname: string }
  | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw) return null

  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:') return null
    return {
      protocol: 'https',
      hostname: parsed.hostname,
      pathname: '/storage/v1/object/public/products/**',
    }
  } catch {
    return null
  }
}

const supabaseProductsPattern = getSupabaseProductsRemotePattern()

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
      {
        protocol: 'https',
        hostname: 'dcdn-us.mitiendanube.com',
        pathname: '/stores/**',
      },
      ...(supabaseProductsPattern ? [supabaseProductsPattern] : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [...SECURITY_HEADERS],
      },
    ]
  },
}

export default nextConfig
