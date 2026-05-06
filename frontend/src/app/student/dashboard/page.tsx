"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import {
  AttendanceRecordPayload,
  StudentCourseSummary,
  StudentPayload,
  getAttendanceHistory,
  getStudentCoursesSummary,
  getStudentProfile,
  studentLogout,
} from '@/lib/api';

export default function StudentDashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<StudentPayload | null>(null);
  const [records, setRecords] = useState<AttendanceRecordPayload[]>([]);
  const [courseSummaries, setCourseSummaries] = useState<StudentCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, historyRes, summaryRes] = await Promise.all([
        getStudentProfile(),
        getAttendanceHistory(),
        getStudentCoursesSummary(),
      ]);
      if (!profileRes.success) {
        router.push('/student/login');
        return;
      }
      setProfile(profileRes.student ?? null);
      setRecords(historyRes.records ?? []);
      setCourseSummaries(summaryRes.courses ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    await studentLogout();
    router.push('/student/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
            <p className="text-xs text-gray-500">{profile?.index_number}</p>
          </div>
          <Button variant="outline_gray" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome + profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
              Welcome, {profile?.full_name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.department} &bull; Level {profile?.level} &bull; {profile?.email}
            </p>
          </div>
          <Link href="/student/scan">
            <Button variant="primary" size="md">
              Scan QR Code
            </Button>
          </Link>
        </div>

        {/* My Courses */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            <span className="text-sm text-gray-500">{courseSummaries.length} course{courseSummaries.length !== 1 ? 's' : ''}</span>
          </div>

          {courseSummaries.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No course attendance yet. Scan a QR code to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courseSummaries.map(course => {
                const barWidth = Math.min(course.attendance_percentage, 100);
                return (
                  <div key={course.course_id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded mb-1">
                          {course.course_code}
                        </span>
                        <p className="font-semibold text-gray-900 text-sm">{course.course_name}</p>
                        <p className="text-xs text-gray-400">{course.department} &bull; Level {course.level}</p>
                      </div>
                      {course.can_write_exam ? (
                        <span className="shrink-0 inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                          Eligible to write exam
                        </span>
                      ) : (
                        <span className="shrink-0 inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                          Barred from exam
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{course.sessions_attended} of {course.total_sessions} sessions attended</span>
                        <span className={`font-semibold ${course.can_write_exam ? 'text-green-600' : 'text-red-600'}`}>
                          {course.attendance_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${course.can_write_exam ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">75% required to write exam</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
            <span className="text-sm text-gray-500">{records.length} record{records.length !== 1 ? 's' : ''}</span>
          </div>

          {records.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No attendance records yet. Scan a QR code to mark your first attendance.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-orange-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Session ID</th>
                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Date</th>
                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Time</th>
                    <th className="text-left px-6 py-3 text-gray-600 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => {
                    const date = new Date(record.marked_at);
                    return (
                      <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-gray-700">#{record.session_id}</td>
                        <td className="px-6 py-4 text-gray-700">{date.toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-700">{date.toLocaleTimeString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Present
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
