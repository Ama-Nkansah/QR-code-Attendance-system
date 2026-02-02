"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Logo } from './Logo';
import { AcademicIllustrations } from './AcademicIllustrations';
import { FeedbackModal } from './FeedbackModal';
import Link from 'next/link';

export const SplashScreen: React.FC = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col relative overflow-hidden">
      <header className="w-full px-6 py-4 flex justify-between items-center relative z-10">
        <Logo />
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="text-orange-600 hover:text-orange-700 font-medium transition-colors cursor-pointer"
        >
          Feedback
        </button>
      </header>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

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
            <motion.p
              className="text-lg md:text-xl text-gray-700 max-w-lg mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {Array.from("Mark your attendance instantly by scanning your QR code.").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.05,
                    delay: 0.5 + index * 0.03
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex gap-4">
              <Link href="/student" className="w-full">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Student
                </Button>
              </Link>
              <Link href="/lecturer" className="w-full">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  Lecturer
                </Button>
              </Link>
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
