import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({
  title = 'Voxora Classroom AI',
  primaryLabel = 'Teacher Login',
  primaryTo = '/login/teacher',
  secondaryLabel = 'Student Login',
  secondaryTo = '/login/student',
  showLinks = true,
}) => {
  return (
    <header className='sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl'>
      <div className='mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4'>
        <Link to='/' className='font-display text-xl font-semibold tracking-tight text-slate-100'>
          {title}
        </Link>

        {showLinks && (
          <div className='flex items-center gap-3'>
            <Link
              to={secondaryTo}
              className='rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-brand-300 hover:text-white'
            >
              {secondaryLabel}
            </Link>
            <Link
              to={primaryTo}
              className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-400'
            >
              {primaryLabel}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
