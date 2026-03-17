import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsCard from '../components/AnalyticsCard';
import Leaderboard from '../components/Leaderboard';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const rewardBadges = [
  { title: 'Curious Mind', detail: 'Asked 10 quality questions', unlocked: true },
  { title: 'Team Player', detail: 'Supported peers in chat', unlocked: true },
  { title: 'Consistency Pro', detail: 'Attend 7 sessions in a row', unlocked: false },
];

const normalizeRoomCode = (value = '') => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

const toRouteRoomCode = (value = '') => {
  const compact = value.trim().replace(/\s+/g, '');
  return compact.toLowerCase();
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const {
    getHistoryOfUser,
    addToUserHistory,
    validateMeetingRoom,
    userData,
    logout,
  } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [selectedClassCode, setSelectedClassCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
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

        setError(err?.response?.data?.message || 'Unable to load classes from API.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [refreshSeed]);

  const availableClasses = useMemo(() => {
    const uniqueCodes = [];
    const seen = new Set();

    meetings.forEach((meeting) => {
      if (!meeting?.meetingCode || seen.has(meeting.meetingCode)) {
        return;
      }

      seen.add(meeting.meetingCode);
      uniqueCodes.push(meeting);
    });

    return uniqueCodes.slice(0, 8).map((meeting, index) => ({
      id: meeting.meetingCode,
      title: `Live Class ${meeting.meetingCode.toUpperCase()}`,
      teacher: `Instructor ${index + 1}`,
      time: new Date(meeting.date).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }, [meetings]);

  const participationPoints = 1000 + meetings.length * 35;
  const focusScore = Math.min(96, 76 + meetings.length * 2);

  const openJoinModal = (classId = '') => {
    setSelectedClassCode(classId);
    setJoinCode('');
    setJoinError('');
    setJoinModalOpen(true);
  };

  const joinClass = async (roomCode) => {
    const routeRoomCode = toRouteRoomCode(roomCode);

    if (!routeRoomCode) {
      setJoinError('Please enter a valid room code.');
      return;
    }

    sessionStorage.setItem('student-room-access', routeRoomCode);

    try {
      await addToUserHistory(routeRoomCode);
      navigate(`/classroom/${routeRoomCode}`);
    } catch {
      navigate(`/classroom/${routeRoomCode}`);
    }
  };

  const submitJoinRoom = async (e) => {
    e.preventDefault();
    const entered = normalizeRoomCode(joinCode);
    const expected = normalizeRoomCode(selectedClassCode);
    const roomToJoin = joinCode || selectedClassCode;
    const routeRoomCode = toRouteRoomCode(roomToJoin);

    if (!entered) {
      setJoinError('Room code is required.');
      return;
    }

    if (expected && entered !== expected) {
      setJoinError('Room code does not match this class. Please check and try again.');
      return;
    }

    setJoinError('');
    setJoining(true);

    try {
      const roomExists = await validateMeetingRoom(routeRoomCode);
      if (!roomExists) {
        setJoinError('Room code not found. Ask your teacher to share the active code.');
        return;
      }

      await joinClass(roomToJoin);
      setJoinModalOpen(false);
    } catch (err) {
      if (err?.response?.status === 404) {
        setJoinError('Room code not found. Ask your teacher to share the active code.');
        return;
      }

      if (err?.response?.status === 401) {
        logout();
        return;
      }

      setJoinError(err?.response?.data?.message || 'Unable to verify room code right now.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className='min-h-screen text-slate-100'>
      <div className='flex min-h-screen'>
        <Sidebar role='student' active='My Classes' />

        <main className='w-full px-5 py-6 lg:px-8'>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
            <div>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Student Dashboard</p>
              <h1 className='font-display text-3xl text-white'>Welcome back, {userData?.username || 'Learner'}</h1>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => openJoinModal()}
                className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
              >
                Join with Room Code
              </button>
              <button
                type='button'
                onClick={logout}
                className='rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-rose-300 hover:text-white'
              >
                Logout
              </button>
            </div>
          </div>

          <section className='grid gap-4 md:grid-cols-3'>
            <AnalyticsCard
              title='Participation Points'
              value={`${participationPoints}`}
              subtitle='Calculated from your class activity logs'
              trend='up'
              icon='PTS'
            />
            <AnalyticsCard
              title='Classes Attended'
              value={`${meetings.length}`}
              subtitle='Total classes recorded by backend'
              trend='up'
              icon='CLS'
            />
            <AnalyticsCard
              title='Focus Score'
              value={`${focusScore}%`}
              subtitle='Estimated using participation frequency'
              trend='up'
              icon='FOC'
            />
          </section>

          <section className='mt-6 grid gap-4 xl:grid-cols-3'>
            <article id='join-room' className='glass-card p-5 xl:col-span-2'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='font-display text-xl text-white'>Available Classes</h2>
                <p className='text-sm text-slate-400'>Join by entering the room code</p>
              </div>

              <div className='space-y-3'>
                {loading ? <p className='text-sm text-slate-300'>Loading classes from API...</p> : null}

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

                {!loading && !error && availableClasses.length === 0 ? (
                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300'>
                    No classes found yet. Ask your teacher to start a class first.
                  </div>
                ) : null}

                {!loading && !error
                  ? availableClasses.map((item) => (
                      <div
                        key={item.id}
                        className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4'
                      >
                        <div>
                          <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>{item.time}</p>
                          <h3 className='text-base font-semibold text-slate-100'>{item.title}</h3>
                          <p className='text-sm text-slate-300'>{item.teacher}</p>
                        </div>
                        <button
                          type='button'
                          onClick={() => openJoinModal(item.id)}
                          className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
                        >
                          Join Class
                        </button>
                      </div>
                    ))
                  : null}
              </div>
            </article>

            <Leaderboard />
          </section>

          <section id='rewards' className='mt-6 glass-card p-5'>
            <div className='mb-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Rewards and Points</p>
              <h2 className='font-display text-xl text-white'>Your Learning Progress</h2>
            </div>

            <div className='mb-5 rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='mb-2 flex items-center justify-between text-sm text-slate-300'>
                <span>Level 7</span>
                <span>1280 / 1500 XP</span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-slate-800'>
                <div className='h-full w-[85%] rounded-full bg-gradient-to-r from-emerald-300 to-brand-400' />
              </div>
            </div>

            <div className='grid gap-3 md:grid-cols-3'>
              {rewardBadges.map((badge) => (
                <article key={badge.title} className='rounded-xl border border-white/10 bg-slate-900/70 p-3'>
                  <h3 className='font-semibold text-slate-100'>{badge.title}</h3>
                  <p className='mt-1 text-sm text-slate-300'>{badge.detail}</p>
                  <p
                    className={`mt-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      badge.unlocked ? 'text-emerald-300' : 'text-amber-300'
                    }`}
                  >
                    {badge.unlocked ? 'Unlocked' : 'In Progress'}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      {joinModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-6 shadow-2xl'>
            <p className='text-xs uppercase tracking-[0.2em] text-brand-200'>Join Meeting Room</p>
            <h3 className='mt-2 font-display text-2xl text-white'>Enter Room Code</h3>

            {selectedClassCode ? (
              <p className='mt-2 text-sm text-slate-300'>
                Type this code to join: <span className='font-semibold text-brand-100'>{selectedClassCode.toUpperCase()}</span>
              </p>
            ) : (
              <p className='mt-2 text-sm text-slate-300'>Ask your teacher for the meeting room code.</p>
            )}

            <form className='mt-4 space-y-3' onSubmit={submitJoinRoom}>
              <input
                type='text'
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder='e.g. ABC-123-XYZ'
                autoFocus
                className='w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.14em] text-slate-100 placeholder:normal-case placeholder:tracking-normal placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30'
              />

              {joinError ? (
                <p className='rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200'>
                  {joinError}
                </p>
              ) : null}

              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => setJoinModalOpen(false)}
                  className='flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-brand-300'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={joining}
                  className='flex-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  {joining ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentDashboard;
