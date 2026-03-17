import React from 'react';

const fallbackStudents = [
  { id: 1, name: 'Aarav', speaking: true },
  { id: 2, name: 'Sara', speaking: false },
  { id: 3, name: 'Nora', speaking: false },
  { id: 4, name: 'Dev', speaking: true },
  { id: 5, name: 'Kian', speaking: false },
  { id: 6, name: 'Mina', speaking: false },
];

const VideoGrid = ({
  teacherName = 'Professor Mira',
  sessionTitle = 'AI Powered Physics Live',
  students = fallbackStudents,
}) => {
  return (
    <section className='glass-card p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Main Stream</p>
          <h2 className='font-display text-xl text-slate-100'>{sessionTitle}</h2>
        </div>
        <span className='rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200'>
          Live Now
        </span>
      </div>

      <div className='grid gap-3 xl:grid-cols-3'>
        <article className='relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-5 xl:col-span-2'>
          <div className='absolute inset-0 bg-gradient-to-br from-brand-500/15 via-transparent to-cyan-300/10' />
          <div className='relative z-10 flex h-64 flex-col justify-between sm:h-80'>
            <div className='flex items-center justify-between'>
              <p className='rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300'>Teacher Cam</p>
              <p className='text-xs text-slate-400'>AI transcript enabled</p>
            </div>
            <div>
              <h3 className='font-display text-2xl text-white'>{teacherName}</h3>
              <p className='text-sm text-slate-300'>Explaining chapter with live annotations</p>
            </div>
          </div>
        </article>

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2'>
          {students.map((student) => (
            <article
              key={student.id}
              className='flex h-32 flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3'
            >
              <div className='h-12 w-12 rounded-full bg-gradient-to-br from-brand-400 to-cyan-300' />
              <div>
                <p className='text-sm font-semibold text-slate-100'>{student.name}</p>
                <p className={`text-xs ${student.speaking ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {student.speaking ? 'Speaking' : 'Listening'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoGrid;
