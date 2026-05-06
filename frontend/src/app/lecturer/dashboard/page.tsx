"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import {
  CoursePayload,
  CourseReportResponse,
  CreateCourseBody,
  SessionPayload,
  StudentReportRow,
  createCourse,
  createSession,
  deleteCourse,
  endSession,
  getCourseReport,
  getCourses,
  getLecturerProfile,
  getSessionQR,
  lecturerLogout,
  LecturerPayload,
} from '@/lib/api';

type Modal = 'create-course' | 'start-session' | 'active-session' | 'course-report' | null;

const INPUT_CLASS =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all';

export default function LecturerDashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<LecturerPayload | null>(null);
  const [courses, setCourses] = useState<CoursePayload[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<Modal>(null);
  const [selectedCourse, setSelectedCourse] = useState<CoursePayload | null>(null);
  const [activeSession, setActiveSession] = useState<SessionPayload | null>(null);
  const [qrData, setQrData] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [reportCourse, setReportCourse] = useState<CoursePayload | null>(null);
  const [reportData, setReportData] = useState<CourseReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [courseForm, setCourseForm] = useState<CreateCourseBody>({
    course_code: '',
    course_name: '',
    department: '',
    level: '',
    academic_year: '',
    semester: '',
    planned_sessions: 0,
  });
  const [courseFormError, setCourseFormError] = useState('');
  const [courseFormLoading, setCourseFormLoading] = useState(false);

  const [sessionForm, setSessionForm] = useState({
    session_name: '',
    session_type: 'Lecture',
    duration_minutes: 60,
    allowed_radius_meters: 100,
  });
  const [sessionFormError, setSessionFormError] = useState('');
  const [sessionFormLoading, setSessionFormLoading] = useState(false);

  const qrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQR = useCallback(async (sessionId: number) => {
    setQrLoading(true);
    const res = await getSessionQR(sessionId);
    if (res.success && res.qr) setQrData(res.qr.qrData);
    setQrLoading(false);
  }, []);

  useEffect(() => {
    async function load() {
      const [profileRes, coursesRes] = await Promise.all([
        getLecturerProfile(),
        getCourses(),
      ]);
      if (!profileRes.success) {
        router.push('/lecturer/login');
        return;
      }
      setProfile(profileRes.lecturer ?? null);
      setCourses(coursesRes.courses ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (modal !== 'active-session' || !activeSession) return;
    const id = activeSession.id;
    void (async () => { await fetchQR(id); })();
    qrIntervalRef.current = setInterval(() => { void fetchQR(id); }, 25_000);
    return () => {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
    };
  }, [modal, activeSession, fetchQR]);

  const handleLogout = async () => {
    await lecturerLogout();
    router.push('/lecturer/login');
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseFormError('');
    setCourseFormLoading(true);
    const res = await createCourse(courseForm);
    setCourseFormLoading(false);
    if (res.success && res.course) {
      setCourses(prev => [...prev, res.course!]);
      setModal(null);
      setCourseForm({ course_code: '', course_name: '', department: '', level: '', academic_year: '', semester: '', planned_sessions: 0 });
    } else {
      setCourseFormError(res.message ?? 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    const res = await deleteCourse(courseId);
    if (res.success) setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    setSessionFormError('');
    setSessionFormLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await createSession({
          course_id: selectedCourse!.id,
          session_name: sessionForm.session_name,
          session_type: sessionForm.session_type,
          duration_minutes: sessionForm.duration_minutes,
          classroom_lat: pos.coords.latitude,
          classroom_lng: pos.coords.longitude,
          allowed_radius_meters: sessionForm.allowed_radius_meters,
        });
        setSessionFormLoading(false);
        if (res.success && res.session) {
          setActiveSession(res.session);
          setModal('active-session');
        } else {
          setSessionFormError(res.message ?? 'Failed to start session');
        }
      },
      () => {
        setSessionFormLoading(false);
        setSessionFormError('Location access denied. Please allow location access to start a session.');
      },
    );
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    await endSession(activeSession.id);
    setModal(null);
    setActiveSession(null);
    setQrData('');
  };

  const handleViewReport = async (course: CoursePayload) => {
    setReportCourse(course);
    setReportData(null);
    setReportLoading(true);
    setModal('course-report');
    const res = await getCourseReport(course.id);
    setReportData(res);
    setReportLoading(false);
  };

  const handleDownloadCSV = () => {
    if (!reportData?.students || !reportCourse) return;
    const headers = ['Index Number', 'Full Name', 'Sessions Attended', 'Total Sessions', 'Attendance %', 'Status'];
    const rows = reportData.students.map((s: StudentReportRow) => [
      s.index_number,
      s.full_name,
      s.sessions_attended,
      s.total_sessions,
      `${s.attendance_percentage}%`,
      s.below_threshold ? 'Below Threshold' : 'OK',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportCourse.course_code}_attendance_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <p className="text-xs text-gray-500">Staff ID: {profile?.staff_id}</p>
          </div>
          <Button variant="outline_gray" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-poppins)' }}>
            Welcome, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-gray-600 mt-1">Manage your courses and attendance sessions</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
          <Button variant="primary" size="sm" onClick={() => setModal('create-course')}>
            + New Course
          </Button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No courses yet. Create your first course to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                <div>
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded mb-2">
                    {course.course_code}
                  </span>
                  <h3 className="font-semibold text-gray-900">{course.course_name}</h3>
                  <p className="text-sm text-gray-500">{course.department} &bull; Level {course.level}</p>
                  <p className="text-xs text-gray-400">{course.academic_year} &bull; Semester {course.semester}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      setSessionForm({ session_name: '', session_type: 'Lecture', duration_minutes: 60, allowed_radius_meters: 100 });
                      setSessionFormError('');
                      setModal('start-session');
                    }}
                  >
                    Start Session
                  </Button>
                  <Button variant="outline_gray" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                    Delete
                  </Button>
                  <Button variant="outline_gray" size="sm" onClick={() => handleViewReport(course)}>
                    Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Course Modal */}
      {modal === 'create-course' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">New Course</h2>
              <button onClick={() => setModal(null)} className="text-white hover:text-orange-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              {([
                { label: 'Course Code', name: 'course_code', placeholder: 'e.g. CS301' },
                { label: 'Course Name', name: 'course_name', placeholder: 'e.g. Data Structures' },
                { label: 'Department', name: 'department', placeholder: 'e.g. Computer Science' },
                { label: 'Level', name: 'level', placeholder: 'e.g. 300' },
                { label: 'Academic Year', name: 'academic_year', placeholder: 'e.g. 2025/2026' },
                { label: 'Semester', name: 'semester', placeholder: '1 or 2' },
              ] as { label: string; name: keyof CreateCourseBody; placeholder: string }[]).map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    required
                    placeholder={placeholder}
                    value={courseForm[name]}
                    onChange={e => setCourseForm(prev => ({ ...prev, [name]: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Sessions This Semester
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 40"
                  value={courseForm.planned_sessions || ''}
                  onChange={e => setCourseForm(prev => ({ ...prev, planned_sessions: Number(e.target.value) }))}
                  className={INPUT_CLASS}
                />
                {courseForm.planned_sessions > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {courseForm.planned_sessions} sessions &times; 75% = students must attend at least{' '}
                    <span className="font-semibold text-orange-600">
                      {Math.ceil(courseForm.planned_sessions * 0.75)} sessions
                    </span>{' '}
                    to write the exam
                  </p>
                )}
              </div>
              {courseFormError && <p className="text-sm text-red-600">{courseFormError}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline_gray" size="md" fullWidth onClick={() => setModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth disabled={courseFormLoading}>
                  {courseFormLoading ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Session Modal */}
      {modal === 'start-session' && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Start Session</h2>
              <button onClick={() => setModal(null)} className="text-white hover:text-orange-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleStartSession} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Course: <span className="font-semibold text-gray-900">{selectedCourse.course_code} — {selectedCourse.course_name}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Week 3 — Linked Lists"
                  value={sessionForm.session_name}
                  onChange={e => setSessionForm(prev => ({ ...prev, session_name: e.target.value }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select
                  value={sessionForm.session_type}
                  onChange={e => setSessionForm(prev => ({ ...prev, session_type: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option>Lecture</option>
                  <option>Tutorial</option>
                  <option>Lab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={sessionForm.duration_minutes}
                  onChange={e => setSessionForm(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Radius (meters)</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={sessionForm.allowed_radius_meters}
                  onChange={e => setSessionForm(prev => ({ ...prev, allowed_radius_meters: Number(e.target.value) }))}
                  className={INPUT_CLASS}
                />
              </div>
              <p className="text-xs text-gray-400">Your GPS location is captured automatically when the session starts.</p>
              {sessionFormError && <p className="text-sm text-red-600">{sessionFormError}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline_gray" size="md" fullWidth onClick={() => setModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth disabled={sessionFormLoading}>
                  {sessionFormLoading ? 'Starting...' : 'Start Session'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Report Modal */}
      {modal === 'course-report' && reportCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center rounded-t-2xl shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">{reportCourse.course_code} — Attendance Report</h2>
                <p className="text-orange-100 text-xs">{reportCourse.course_name}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-white hover:text-orange-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {reportLoading ? (
                <p className="text-center text-gray-500 py-8">Loading report...</p>
              ) : !reportData?.success ? (
                <p className="text-center text-red-500 py-8">{reportData?.message ?? 'Failed to load report'}</p>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      Sessions held: <span className="font-semibold text-gray-900">{reportData.sessions_held}</span>
                      <span className="mx-2 text-gray-300">/</span>
                      Planned: <span className="font-semibold text-gray-900">{reportData.planned_sessions}</span>
                      <span className="ml-4 text-orange-600 font-medium">
                        Min. to pass: {Math.ceil((reportData.planned_sessions ?? 0) * 0.75)} sessions (75%)
                      </span>
                    </p>
                    <Button variant="outline_gray" size="sm" onClick={handleDownloadCSV}>
                      Download CSV
                    </Button>
                  </div>

                  {reportData.students?.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No attendance records yet for this course.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
                          <th className="pb-2 pr-4">Index No.</th>
                          <th className="pb-2 pr-4">Name</th>
                          <th className="pb-2 pr-4 text-center">Attended</th>
                          <th className="pb-2 pr-4 text-center">%</th>
                          <th className="pb-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.students?.map(s => (
                          <tr key={s.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 pr-4 text-gray-600">{s.index_number}</td>
                            <td className="py-2 pr-4 font-medium text-gray-900">{s.full_name}</td>
                            <td className="py-2 pr-4 text-center text-gray-700">
                              {s.sessions_attended}/{s.total_sessions}
                            </td>
                            <td className="py-2 pr-4 text-center font-semibold text-gray-900">
                              {s.attendance_percentage}%
                            </td>
                            <td className="py-2 text-center">
                              {s.below_threshold ? (
                                <span className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  Below 75%
                                </span>
                              ) : (
                                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  OK
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Session QR Modal */}
      {modal === 'active-session' && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="bg-orange-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Live Session</h2>
              <span className="text-xs bg-green-400 text-white px-2 py-1 rounded-full font-semibold">Active</span>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="font-semibold text-gray-900">{activeSession.session_name}</p>
              <p className="text-xs text-gray-500">QR code refreshes every 30 seconds</p>
              <div className="flex justify-center">
                {qrLoading || !qrData ? (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Loading QR...</p>
                  </div>
                ) : (
                  <div className="p-3 bg-white border-2 border-gray-200 rounded-xl inline-block">
                    <QRCode value={qrData} size={180} />
                  </div>
                )}
              </div>
              <Button variant="outline_gray" size="md" fullWidth onClick={handleEndSession}>
                End Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
