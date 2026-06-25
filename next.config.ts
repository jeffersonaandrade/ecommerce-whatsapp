import type { NextConfig } from 'next'

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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      ...(supabaseProductsPattern ? [supabaseProductsPattern] : []),
    ],
  },
}

export default nextConfig
