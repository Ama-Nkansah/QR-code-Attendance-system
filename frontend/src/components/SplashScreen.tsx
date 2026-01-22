"use client"

import React from 'react';
import { Button } from './Button';
import { Logo } from './Logo';
import { AcademicIllustrations } from './AcademicIllustrations';
import Link from 'next/link';

export const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col relative overflow-hidden">
      <header className="w-full px-6 py-4 flex justify-between items-center relative z-10">
        <Logo />
        <Link
          href="/feedback"
          className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          Feedback
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 relative">
        <AcademicIllustrations />

        <div className="max-w-md w-full text-center space-y-8 relative z-10">
          <div className="space-y-4">
            <h1
              className="text-7xl font-extrabold text-gray-900 tracking-wide"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Attendo
            </h1>
            <p className=" text-lg md:text-xl text-gray-700 max-w-lg mx-auto leading-relaxed">
              Mark your attendance instantly by scanning your QR code.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex gap-4">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => console.log('Student login')}
              >
                Student&apos;s Login
              </Button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => console.log('Student signup')}
              >
               Student&apos;s Sign Up
              </Button>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => console.log('Lecturer login')}
              >
                Lecturer&apos;s Login
              </Button>
            </div>
          </div>

        </div>
      </main>

      <footer className="w-full px-6 py-4 text-center text-sm text-gray-500 relative z-10">
        <p>&copy; {new Date().getFullYear()} Attendo. All rights reserved.</p>
      </footer>
    </div>
  );
};
