import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  {
    title: 'AI Teaching Assistant',
    description:
      'Real-time hints, instant concept summaries, and adaptive explanations based on student questions.',
    label: 'AI',
  },
  {
    title: 'Engagement Analytics',
    description:
      'Track who is active, who needs support, and which lecture moments need a recap.',
    label: 'Data',
  },
  {
    title: 'Gamified Learning',
    description:
      'Points, streaks, and challenge badges that keep your class energetic and consistent.',
    label: 'XP',
  },
];

const Landing = () => {
  return (
    <div className='min-h-screen text-slate-100'>
      <Navbar />

      <main className='mx-auto w-full max-w-7xl px-5 pb-16 pt-12 sm:pt-16'>
        <section className='grid items-center gap-8 lg:grid-cols-2'>
          <div className='animate-fade-up'>
            <p className='mb-3 inline-flex items-center rounded-full border border-brand-300/40 bg-brand-500/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-brand-200'>
              AI Powered Interactive Classroom
            </p>
            <h1 className='font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl'>
              Where Every Voice Becomes a Classroom.
            </h1>
            <p className='mt-5 max-w-xl text-base text-slate-300 sm:text-lg'>
              Voxora turns any live session into an intelligent classroom — AI listens, students engage, and teachers lead with real-time insights at their fingertips.
            </p>

            <div className='mt-8 flex flex-wrap gap-3'>
              <Link
                to='/login/teacher'
                className='rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-400'
              >
                I&apos;m a Teacher
              </Link>
              <Link
                to='/login/student'
                className='rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-brand-300 hover:bg-white/5'
              >
                I&apos;m a Student
              </Link>
            </div>
          </div>

          <div className='glass-card animate-fade-up p-5 [animation-delay:120ms]'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:col-span-2'>
                <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Live Snapshot</p>
                <h3 className='mt-2 font-display text-xl text-white'>Class 8A Physics</h3>
                <p className='mt-2 text-sm text-slate-300'>
                  32 students online, AI generated summary in progress, 91 percent attention score.
                </p>
              </div>
              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                <p className='text-xs text-slate-400'>Questions asked</p>
                <h4 className='mt-1 font-display text-3xl text-emerald-300'>47</h4>
              </div>
              <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                <p className='text-xs text-slate-400'>Avg engagement</p>
                <h4 className='mt-1 font-display text-3xl text-brand-200'>88%</h4>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className='glass-card animate-fade-up p-5'
              style={{ animationDelay: `${200 + index * 120}ms` }}
            >
              <span className='inline-flex rounded-lg bg-brand-500/20 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100'>
                {feature.label}
              </span>
              <h2 className='mt-3 font-display text-xl text-white'>{feature.title}</h2>
              <p className='mt-2 text-sm text-slate-300'>{feature.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Landing;
