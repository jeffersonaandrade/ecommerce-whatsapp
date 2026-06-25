import { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminLoginForm } from '@/components/admin/admin-login-form'

export const metadata: Metadata = {
  title: 'Login Admin',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  )
}
