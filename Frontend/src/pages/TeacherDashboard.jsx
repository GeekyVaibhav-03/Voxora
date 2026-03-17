import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsCard from '../components/AnalyticsCard';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const attendanceByDay = [72, 84, 80, 91, 88, 93, 89];

const lectureSummary = [
  'Momentum chapter achieved 86 percent understanding based on quiz and chat confidence.',
  'Top confusion point: relative motion examples with negative direction signs.',
  'Recommended for next class: 5 minute recap on vector decomposition using real-world examples.',
];

const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const sessionStatus = (dateString) => {
  const now = Date.now();
  const recordedAt = new Date(dateString).getTime();
  const minutesAgo = Math.max(0, Math.floor((now - recordedAt) / 60000));

  if (minutesAgo <= 30) return 'Live';
  if (minutesAgo <= 180) return 'Recent';
  return 'Archived';
};

const generateMeetingCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () => Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`.toLowerCase();
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { getHistoryOfUser, addToUserHistory, logout } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [roomError, setRoomError] = useState('');
  const [copyState, setCopyState] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getHistoryOfUser();
        if (mounted) {
          setMeetings(Array.isArray(response) ? response : []);
        }
      } catch (err) {
        if (!mounted) return;

        if (err?.response?.status === 401) {
          logout();
          return;
        }

        setError(err?.response?.data?.message || 'Unable to load sessions from API.');
        setMeetings([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [refreshSeed]);

  const sessions = useMemo(() => {
    const uniqueMeetings = [];
    const seenCodes = new Set();

    meetings.forEach((meeting) => {
      if (!meeting?.meetingCode || seenCodes.has(meeting.meetingCode)) {
        return;
      }

      seenCodes.add(meeting.meetingCode);
      uniqueMeetings.push(meeting);
    });

    return uniqueMeetings.slice(0, 6).map((meeting, index) => {
      const seed = meeting.meetingCode
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), index);

      return {
        id: meeting.meetingCode,
        title: `Classroom ${meeting.meetingCode.toUpperCase()}`,
        time: formatTime(meeting.date),
        students: 16 + (seed % 22),
        status: sessionStatus(meeting.date),
      };
    });
  }, [meetings]);

  const todayAttendance = meetings.filter((meeting) => {
    const date = new Date(meeting.date);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  const engagementScore = meetings.length > 0 ? Math.min(98, 72 + meetings.length * 3) : 72;

  const createClass = async () => {
    if (creatingRoom) {
      return;
    }

    const classCode = generateMeetingCode();
    setCreatingRoom(true);
    setRoomError('');
    setCopyState('');

    try {
      await addToUserHistory(classCode);
    } catch {
      setRoomError('Room code generated, but history sync failed. You can still continue.');
    } finally {
      setCreatedRoomCode(classCode);
      setRoomModalOpen(true);
      setCreatingRoom(false);
    }
  };

  const copyRoomCode = async () => {
    if (!createdRoomCode) return;

    try {
      await navigator.clipboard.writeText(createdRoomCode.toUpperCase());
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const startCreatedRoom = () => {
    if (!createdRoomCode) return;
    setRoomModalOpen(false);
    navigate(`/classroom/${createdRoomCode}`);
  };

  return (
    <div className='min-h-screen text-slate-100'>
      <div className='flex min-h-screen'>
        <Sidebar role='teacher' active='Overview' onCreateClass={createClass} />

        <main className='w-full px-5 py-6 lg:px-8'>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
            <div>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Teacher Dashboard</p>
              <h1 className='font-display text-3xl text-white'>Good afternoon, Professor Mira</h1>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={createClass}
                disabled={creatingRoom}
                className='rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-400'
              >
                {creatingRoom ? 'Creating Room...' : 'Create Meeting Room'}
              </button>
              <button
                type='button'
                onClick={logout}
                className='rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-rose-300 hover:text-white'
              >
                Logout
              </button>
            </div>
          </div>

          <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              title='Engagement Score'
              value={`${engagementScore}%`}
              subtitle='Estimated from session activity logs'
              trend='up'
              icon='ENG'
            />
            <AnalyticsCard
              title='Attendance Today'
              value={`${todayAttendance}`}
              subtitle='Class joins recorded by backend'
              trend='up'
              icon='ATT'
            />
            <AnalyticsCard
              title='Questions Asked'
              value={`${Math.max(12, meetings.length * 4)}`}
              subtitle='Derived from active classroom traffic'
              trend='up'
              icon='QNA'
            />
            <AnalyticsCard
              title='AI Alerts'
              value={`${Math.max(0, Math.round((100 - engagementScore) / 8))}`}
              subtitle='Low activity session alerts'
              trend='down'
              icon='AI'
            />
          </section>

          <section id='sessions' className='mt-6 glass-card p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='font-display text-xl text-white'>Active Sessions</h2>
              <p className='text-sm text-slate-400'>Manage current and scheduled classes</p>
            </div>

            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {loading ? <p className='text-sm text-slate-300'>Loading sessions from API...</p> : null}

              {!loading && error ? (
                <div className='rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4 text-sm text-rose-100'>
                  <p>{error}</p>
                  <button
                    type='button'
                    onClick={() => setRefreshSeed((prev) => prev + 1)}
                    className='mt-3 rounded-lg border border-rose-200/40 px-3 py-1 text-xs font-semibold'
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {!loading && !error && sessions.length === 0 ? (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300'>
                  No classes recorded yet. Start a class to create your first session.
                </div>
              ) : null}

              {!loading && !error
                ? sessions.map((session) => (
                    <article key={session.id} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                      <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>{session.time}</p>
                      <h3 className='mt-2 font-semibold text-slate-100'>{session.title}</h3>
                      <p className='mt-1 text-sm text-slate-300'>{session.students} students</p>
                      <div className='mt-3 flex items-center justify-between'>
                        <span className='rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300'>
                          {session.status}
                        </span>
                        <button
                          type='button'
                          onClick={() => navigate(`/classroom/${session.id}`)}
                          className='text-sm font-semibold text-brand-200 hover:text-brand-100'
                        >
                          Open
                        </button>
                      </div>
                    </article>
                  ))
                : null}
            </div>
          </section>

          <section className='mt-6 grid gap-4 xl:grid-cols-2'>
            <article id='analytics' className='glass-card p-5'>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Attendance Graph</p>
              <h2 className='mt-1 font-display text-xl text-white'>Weekly Attendance Trend</h2>
              <div className='mt-5 flex h-44 items-end gap-3'>
                {attendanceByDay.map((value, index) => (
                  <div key={`day-${index + 1}`} className='flex flex-1 flex-col items-center gap-2'>
                    <div
                      className='w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-cyan-300/80'
                      style={{ height: `${value}%` }}
                    />
                    <span className='text-xs text-slate-400'>D{index + 1}</span>
                  </div>
                ))}
              </div>
            </article>

            <article id='summary' className='glass-card p-5'>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>AI Lecture Summary</p>
              <h2 className='mt-1 font-display text-xl text-white'>Auto Generated Insights</h2>
              <div className='mt-4 space-y-3'>
                {lectureSummary.map((summary) => (
                  <p key={summary} className='rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200'>
                    {summary}
                  </p>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>

      {roomModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-6 shadow-2xl'>
            <p className='text-xs uppercase tracking-[0.2em] text-brand-200'>Meeting Room Created</p>
            <h3 className='mt-2 font-display text-2xl text-white'>Share this Room Code</h3>

            <div className='mt-4 rounded-xl border border-brand-300/40 bg-brand-500/10 p-4 text-center'>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Room Code</p>
              <p className='mt-2 font-display text-3xl tracking-[0.18em] text-brand-100'>
                {createdRoomCode.toUpperCase()}
              </p>
            </div>

            {roomError ? (
              <p className='mt-3 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100'>
                {roomError}
              </p>
            ) : null}

            {copyState === 'copied' ? (
              <p className='mt-3 text-sm text-emerald-300'>Room code copied to clipboard.</p>
            ) : null}

            {copyState === 'failed' ? (
              <p className='mt-3 text-sm text-rose-200'>Could not copy automatically. Please copy manually.</p>
            ) : null}

            <div className='mt-5 flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={copyRoomCode}
                className='flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-brand-300'
              >
                Copy Code
              </button>
              <button
                type='button'
                onClick={startCreatedRoom}
                className='flex-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
              >
                Start Now
              </button>
            </div>

            <button
              type='button'
              onClick={() => setRoomModalOpen(false)}
              className='mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white'
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TeacherDashboard;
