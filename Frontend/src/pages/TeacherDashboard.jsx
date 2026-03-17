import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsCard from '../components/AnalyticsCard';
import Sidebar from '../components/Sidebar';

const sessions = [
  { id: 'alg-12', title: 'Algebra Foundations', time: '10:00 AM', students: 34, status: 'Live' },
  { id: 'phy-07', title: 'Physics Dynamics', time: '12:30 PM', students: 28, status: 'Starting Soon' },
  { id: 'bio-03', title: 'Cell Biology Revision', time: '3:00 PM', students: 22, status: 'Scheduled' },
];

const attendanceByDay = [72, 84, 80, 91, 88, 93, 89];

const lectureSummary = [
  'Momentum chapter achieved 86 percent understanding based on quiz and chat confidence.',
  'Top confusion point: relative motion examples with negative direction signs.',
  'Recommended for next class: 5 minute recap on vector decomposition using real-world examples.',
];

const TeacherDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen text-slate-100'>
      <div className='flex min-h-screen'>
        <Sidebar role='teacher' active='Overview' onCreateClass={() => navigate('/classroom/live')} />

        <main className='w-full px-5 py-6 lg:px-8'>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
            <div>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Teacher Dashboard</p>
              <h1 className='font-display text-3xl text-white'>Good afternoon, Professor Mira</h1>
            </div>
            <button
              type='button'
              onClick={() => navigate('/classroom/live')}
              className='rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-400'
            >
              Start Class
            </button>
          </div>

          <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <AnalyticsCard
              title='Engagement Score'
              value='88%'
              subtitle='Higher than last week by 7 percent'
              trend='up'
              icon='ENG'
            />
            <AnalyticsCard
              title='Attendance Today'
              value='124'
              subtitle='Total students joined across sessions'
              trend='up'
              icon='ATT'
            />
            <AnalyticsCard
              title='Questions Asked'
              value='63'
              subtitle='Most asked about chapter 6'
              trend='up'
              icon='QNA'
            />
            <AnalyticsCard
              title='AI Alerts'
              value='04'
              subtitle='Students flagged as low focus'
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
              {sessions.map((session) => (
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
              ))}
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
    </div>
  );
};

export default TeacherDashboard;
