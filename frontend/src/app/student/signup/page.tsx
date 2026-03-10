"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { PasswordToggleIcon } from '@/components/PasswordToggleIcon';
import { studentRegister } from '@/lib/api';

export default function StudentSignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    indexNumber: '',
    fullName: '',
    email: '',
    department: '',
    level: '',
    pin: '',
    confirmPin: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    pin: '',
    confirmPin: ''
  });

  const [touched, setTouched] = useState({
    email: false,
    pin: false,
    confirmPin: false
  });

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): string => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePin = (pin: string): string => {
    if (!pin) return '';
    if (!/^\d{4}$/.test(pin)) {
      return 'PIN must be exactly 4 digits';
    }
    return '';
  };

  const toTitleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === 'department' && value) {
      processedValue = toTitleCase(value);
    }

    const updatedFormData = {
      ...formData,
      [name]: processedValue
    };
    setFormData(updatedFormData);

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    let error = '';
    if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'pin') {
      error = validatePin(value);
      if (touched.confirmPin && updatedFormData.confirmPin) {
        const confirmError = updatedFormData.confirmPin !== value ? 'PINs do not match' : '';
        setErrors(prev => ({
          ...prev,
          pin: error,
          confirmPin: confirmError
        }));
        return;
      }
    } else if (name === 'confirmPin') {
      error = value !== updatedFormData.pin ? 'PINs do not match' : '';
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const pinError = validatePin(formData.pin);
    const confirmPinError = formData.pin !== formData.confirmPin
      ? 'PINs do not match'
      : '';

    if (emailError || pinError || confirmPinError) {
      setTouched({
        email: true,
        pin: true,
        confirmPin: true
      });
      setErrors({
        email: emailError,
        pin: pinError,
        confirmPin: confirmPinError
      });
      return;
    }

    if (!formData.department.trim() || !formData.level) {
      alert('Please enter department and select level');
      return;
    }

    setApiError('');
    setLoading(true);

    const result = await studentRegister(
      formData.indexNumber,
      formData.fullName,
      formData.email,
      formData.department,
      formData.level,
      formData.pin,
    );

    setLoading(false);

    if (result.success) {
      router.push('/student/login');
    } else {
      setApiError(result.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col">
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
              Student Sign Up
            </h1>
            <p className="mt-2 text-gray-600">
              Create your account to mark attendance
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
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your full name"
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                    touched.email && errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder="Enter your email"
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  list="departmentList"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Start typing your department"
                />
                <datalist id="departmentList">
                  <option value="Information Technology" />
                  <option value="Electrical Engineering" />
                  <option value="Mechanical Engineering" />
                  <option value="Civil Engineering" />
                  <option value="Business Administration" />
                  <option value="Accounting" />
                  <option value="Economics" />
                  <option value="Mathematics" />
                  <option value="Physics" />
                  <option value="Chemistry" />
                  <option value="Biology" />
                  <option value="Nursing" />
                </datalist>
                <p className="mt-1 text-xs text-gray-500">
                  Select from suggestions or type your department
                </p>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select your level</option>
                  <option value="100">Level 100</option>
                  <option value="200">Level 200</option>
                  <option value="300">Level 300</option>
                  <option value="400">Level 400</option>
                </select>
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
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                      touched.pin && errors.pin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="Create a 4-digit PIN"
                  />
                  <PasswordToggleIcon
                    visible={showPin}
                    onToggle={() => setShowPin(prev => !prev)}
                    label={showPin ? 'Hide PIN' : 'Show PIN'}
                  />
                </div>
                {touched.pin && errors.pin && (
                  <p className="mt-1 text-sm text-red-600">{errors.pin}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter 4 digits (e.g., 1234)
                </p>
              </div>

              <div>
                <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm PIN
                </label>
                <div className="relative">
                  <input
                    id="confirmPin"
                    name="confirmPin"
                    type={showConfirmPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={formData.confirmPin}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                      touched.confirmPin && errors.confirmPin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="Confirm your PIN"
                  />
                  <PasswordToggleIcon
                    visible={showConfirmPin}
                    onToggle={() => setShowConfirmPin(prev => !prev)}
                    label={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                  />
                </div>
                {touched.confirmPin && errors.confirmPin && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPin}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {apiError && (
                <p className="text-sm text-red-600 text-center">{apiError}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/student/login"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Sign in
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
