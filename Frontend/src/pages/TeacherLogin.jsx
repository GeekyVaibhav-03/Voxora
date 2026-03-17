import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const TeacherLogin = () => {
  const { handleLogin, handleRegister } = useContext(AuthContext);

  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const switchTab = (next) => {
    setTab(next);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await handleLogin(username, password, '/teacher', 'teacher');
      } else {
        const msg = await handleRegister(name, username, password);
        setSuccess(msg || 'Account created! You can now sign in.');
        setTab('login');
        setName('');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-950 px-4 py-12'>
      {/* Background glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full bg-brand-700/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-96 w-96 rounded-full bg-violet-700/8 blur-3xl' />
      </div>

      <div className='relative w-full max-w-md animate-fade-up'>
        {/* Brand */}
        <div className='mb-8 text-center'>
          <Link to='/' className='inline-block'>
            <span className='font-display text-3xl font-bold text-white'>Voxora</span>
          </Link>
          <p className='mt-1 text-xs uppercase tracking-[0.22em] text-slate-400'>
            Where Every Voice Becomes a Classroom.
          </p>
        </div>

        {/* Card */}
        <div className='glass-card p-8'>
          {/* Role badge */}
          <div className='mb-6 flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/20 text-sm font-bold text-brand-300'>
              T
            </div>
            <div>
              <p className='text-xs uppercase tracking-[0.18em] text-slate-400'>Teacher Portal</p>
              <h1 className='font-display text-xl text-white'>
                {tab === 'login' ? 'Welcome back, Professor' : 'Join as a Teacher'}
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className='mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1'>
            <button
              type='button'
              onClick={() => switchTab('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                tab === 'login' ? 'bg-brand-500 text-white shadow-soft' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type='button'
              onClick={() => switchTab('register')}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                tab === 'register' ? 'bg-brand-500 text-white shadow-soft' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {tab === 'register' && (
              <div>
                <label className='mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Your full name'
                  required
                  className='w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30'
                />
              </div>
            )}

            <div>
              <label className='mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400'>
                Username
              </label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Enter your username'
                required
                autoComplete='username'
                className='w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30'
              />
            </div>

            <div>
              <label className='mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-slate-400'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className='w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400/30'
              />
            </div>

            {error && (
              <div className='rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200'>
                {error}
              </div>
            )}

            {success && (
              <div className='rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'>
                {success}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading
                ? 'Please wait...'
                : tab === 'login'
                  ? 'Sign In as Teacher'
                  : 'Create Teacher Account'}
            </button>
          </form>

          <div className='mt-6 border-t border-white/10 pt-5 text-center'>
            <p className='text-sm text-slate-400'>
              Are you a student?{' '}
              <Link to='/login/student' className='font-semibold text-brand-300 hover:text-brand-200'>
                Student portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
