import React from 'react';

const defaultStudents = [
  { id: 1, name: 'Aarav', points: 1280, streak: 9 },
  { id: 2, name: 'Sara', points: 1175, streak: 8 },
  { id: 3, name: 'Mina', points: 1110, streak: 6 },
  { id: 4, name: 'Dev', points: 980, streak: 5 },
  { id: 5, name: 'Kian', points: 940, streak: 4 },
];

const Leaderboard = ({ students = defaultStudents, title = 'Participation Leaderboard' }) => {
  return (
    <section className='glass-card p-4'>
      <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Leaderboard</p>
      <h3 className='mt-1 font-display text-lg text-slate-100'>{title}</h3>

      <div className='mt-4 space-y-2'>
        {students.map((student, index) => (
          <article key={student.id} className='flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3'>
            <div className='flex items-center gap-3'>
              <span className='grid h-8 w-8 place-items-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-100'>
                {index + 1}
              </span>
              <div>
                <p className='text-sm font-semibold text-slate-100'>{student.name}</p>
                <p className='text-xs text-slate-400'>Streak {student.streak} days</p>
              </div>
            </div>

            <p className='text-sm font-semibold text-emerald-300'>{student.points} pts</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Leaderboard;
