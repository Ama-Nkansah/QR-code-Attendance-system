"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { PasswordToggleIcon } from '@/components/PasswordToggleIcon';

export default function StudentLoginPage() {
  const [formData, setFormData] = useState({
    indexNumber: '',
    pin: ''
  });

  const [showPin, setShowPin] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col">
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
              Student Login
            </h1>
            <p className="mt-2 text-gray-600">
              Sign in to mark attendance
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="indexNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Index Number
                </label>
                <input
                  id="indexNumber"
                  name="indexNumber"
                  type="text"
                  required
                  value={formData.indexNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your index number"
                />
              </div>

              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                  4-Digit PIN
                </label>
                <div className="relative">
                  <input
                    id="pin"
                    name="pin"
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={formData.pin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your 4-digit PIN"
                  />
                  <PasswordToggleIcon
                    visible={showPin}
                    onToggle={() => setShowPin(prev => !prev)}
                    label={showPin ? 'Hide PIN' : 'Show PIN '}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
              >
                Sign In
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/student/signup"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full px-6 py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Attendo. All rights reserved.</p>
      </footer>
    </div>
  );
}
