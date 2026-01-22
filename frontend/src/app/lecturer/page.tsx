"use client"

import Link from 'next/link';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { AcademicIllustrations } from '@/components/AcademicIllustrations';

export default function LecturerPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col">
      <header className="w-full px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 relative">
        <AcademicIllustrations />

        <div className="max-w-md w-full space-y-8 text-center relative z-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
              Lecturer Portal
            </h1>
            <p className="text-lg text-gray-600">
              Choose an option to continue
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <Link href="/lecturer/login">
              <Button
               className='mb-7'
                variant="secondary"
                size="md"
                fullWidth
              >
                Login
              </Button>
            </Link>
            <Link href="/lecturer/signup">
              <Button
                variant="outline_gray"
                size="md"
                fullWidth
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full px-6 py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Attendo. All rights reserved.</p>
      </footer>
    </div>
  );
}
