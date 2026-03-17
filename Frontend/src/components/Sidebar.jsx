import React from 'react';
import { Link } from 'react-router-dom';

const teacherItems = [
  { label: 'Overview', to: '/teacher' },
  { label: 'Live Classroom', to: '/classroom/live' },
  { label: 'Sessions', to: '/teacher#sessions' },
  { label: 'AI Summary', to: '/teacher#summary' },
  { label: 'Analytics', to: '/teacher#analytics' },
];

const studentItems = [
  { label: 'My Classes', to: '/student' },
  { label: 'Join Live', to: '/classroom/live' },
  { label: 'Leaderboard', to: '/student#leaderboard' },
  { label: 'Rewards', to: '/student#rewards' },
];

const Sidebar = ({ role = 'teacher', active = 'Overview', onCreateClass }) => {
  const items = role === 'teacher' ? teacherItems : studentItems;

  return (
    <aside className='hidden w-72 border-r border-white/10 bg-slate-950/60 p-5 lg:block'>
      <p className='mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400'>
        {role === 'teacher' ? 'Teacher Workspace' : 'Student Workspace'}
      </p>

      {role === 'teacher' && (
        <button
          type='button'
          onClick={onCreateClass}
          className='mb-6 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400'
        >
          Create or Start Class
        </button>
      )}

      <nav className='space-y-2'>
        {items.map((item) => {
          const isActive = item.label === active;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-brand-500/20 text-brand-100'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
