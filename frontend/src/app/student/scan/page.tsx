"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { markAttendance } from '@/lib/api';

type ScanStatus = 'idle' | 'scanning' | 'locating' | 'submitting' | 'success' | 'error';

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState('');

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
    }
  };

  const startScanner = async () => {
    setStatus('scanning');
    setMessage('');

    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (qrData) => {
          await stopScanner();
          setStatus('locating');

          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              setStatus('submitting');
              const res = await markAttendance(
                qrData,
                pos.coords.latitude,
                pos.coords.longitude,
              );
              if (res.success) {
                setStatus('success');
                setMessage('Attendance marked successfully!');
              } else {
                setStatus('error');
                setMessage(res.message ?? 'Failed to mark attendance');
              }
            },
            () => {
              setStatus('error');
              setMessage('Location access denied. Please allow location to mark attendance.');
            },
          );
        },
        () => { /* ignore per-frame decode errors */ },
      );
    } catch {
      setStatus('error');
      setMessage('Camera access denied. Please allow camera access to scan.');
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  const statusMessages: Partial<Record<ScanStatus, string>> = {
    scanning: 'Point your camera at the QR code...',
    locating: 'Getting your location...',
    submitting: 'Marking attendance...',
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Logo />
        <Button variant="outline_gray" size="sm" onClick={() => router.push('/student/dashboard')}>
          Back
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
            Scan QR Code
          </h1>
          <p className="text-gray-600 mt-1">Scan the lecturer's QR code to mark your attendance</p>
        </div>

        {/* Camera viewport — always in DOM so html5-qrcode can attach */}
        <div
          id="qr-reader"
          className={`w-full max-w-sm rounded-xl overflow-hidden border-2 border-orange-300 bg-black ${status !== 'scanning' ? 'hidden' : ''}`}
        />

        {/* Feedback states */}
        {status === 'idle' && (
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.243m-4.243 0L9.757 9.757M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">Camera is off. Press the button below to start scanning.</p>
            <Button variant="primary" size="md" fullWidth onClick={startScanner}>
              Start Camera
            </Button>
          </div>
        )}

        {(status === 'locating' || status === 'submitting') && (
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-600">{statusMessages[status]}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-semibold">{message}</p>
            <Button variant="primary" size="md" fullWidth onClick={() => router.push('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 text-sm">{message}</p>
            <Button variant="primary" size="md" fullWidth onClick={startScanner}>
              Try Again
            </Button>
            <Button variant="outline_gray" size="md" fullWidth onClick={() => router.push('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {status === 'scanning' && (
          <Button variant="outline_gray" size="md" onClick={async () => { await stopScanner(); setStatus('idle'); }}>
            Cancel
          </Button>
        )}
      </main>
    </div>
  );
}
