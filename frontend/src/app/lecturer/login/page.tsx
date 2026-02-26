

"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { PasswordToggleIcon } from '@/components/PasswordToggleIcon';

export default function LecturerLoginPage() {
  const [formData, setFormData] = useState({
    staffId: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

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
              Lecturer Login
            </h1>
            <p className="mt-2 text-gray-600">
              Sign in to manage your courses and attendance
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
                  Staff ID
                </label>
                <input
                  id="staffId"
                  name="staffId"
                  type="text"
                  required
                  value={formData.staffId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your staff ID"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your password"
                  />
                  <PasswordToggleIcon
                    visible={showPassword}
                    onToggle={() => setShowPassword(prev => !prev)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/lecturer/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
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
                  href="/lecturer/signup"
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
