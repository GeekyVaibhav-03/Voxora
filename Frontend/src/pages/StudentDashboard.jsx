import React from 'react';
import { Link } from 'react-router-dom';
import AnalyticsCard from '../components/AnalyticsCard';
import Leaderboard from '../components/Leaderboard';
import Sidebar from '../components/Sidebar';

const availableClasses = [
  { id: 'physics-live', title: 'Physics Live Doubt Session', teacher: 'Professor Mira', time: 'Now' },
  { id: 'algebra-advanced', title: 'Advanced Algebra Workshop', teacher: 'Dr. Rey', time: '2:00 PM' },
  { id: 'chem-lab', title: 'Chemistry Virtual Lab', teacher: 'Ms. Sia', time: '4:15 PM' },
];

const rewardBadges = [
  { title: 'Curious Mind', detail: 'Asked 10 quality questions', unlocked: true },
  { title: 'Team Player', detail: 'Supported peers in chat', unlocked: true },
  { title: 'Consistency Pro', detail: 'Attend 7 sessions in a row', unlocked: false },
];

const StudentDashboard = () => {
  return (
    <div className='min-h-screen text-slate-100'>
      <div className='flex min-h-screen'>
        <Sidebar role='student' active='My Classes' />

        <main className='w-full px-5 py-6 lg:px-8'>
          <div className='mb-6'>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Student Dashboard</p>
            <h1 className='font-display text-3xl text-white'>Welcome back, Aarav</h1>
          </div>

          <section className='grid gap-4 md:grid-cols-3'>
            <AnalyticsCard
              title='Participation Points'
              value='1280'
              subtitle='You are +120 this week'
              trend='up'
              icon='PTS'
            />
            <AnalyticsCard
              title='Classes Attended'
              value='21'
              subtitle='92 percent attendance this month'
              trend='up'
              icon='CLS'
            />
            <AnalyticsCard
              title='Focus Score'
              value='87%'
              subtitle='AI says your concentration is strong'
              trend='up'
              icon='FOC'
            />
          </section>

          <section className='mt-6 grid gap-4 xl:grid-cols-3'>
            <article className='glass-card p-5 xl:col-span-2'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='font-display text-xl text-white'>Available Classes</h2>
                <p className='text-sm text-slate-400'>Join a class in one click</p>
              </div>

              <div className='space-y-3'>
                {availableClasses.map((item) => (
                  <div
                    key={item.id}
                    className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4'
                  >
                    <div>
                      <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>{item.time}</p>
                      <h3 className='text-base font-semibold text-slate-100'>{item.title}</h3>
                      <p className='text-sm text-slate-300'>{item.teacher}</p>
                    </div>
                    <Link
                      to={`/classroom/${item.id}`}
                      className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
                    >
                      Join Class
                    </Link>
                  </div>
                ))}
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
    </div>
  );
};

export default StudentDashboard;
