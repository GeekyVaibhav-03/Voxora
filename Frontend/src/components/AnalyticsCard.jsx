import React from 'react';

const AnalyticsCard = ({ title, value, subtitle, trend = 'up', icon = 'AI' }) => {
  const trendColor = trend === 'up' ? 'text-emerald-300' : 'text-rose-300';
  const trendText = trend === 'up' ? 'Trending up' : 'Needs attention';

  return (
    <article className='glass-card p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>{title}</p>
        <span className='rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-slate-200'>{icon}</span>
      </div>

      <h3 className='font-display text-2xl text-slate-100'>{value}</h3>
      <p className='mt-1 text-sm text-slate-300'>{subtitle}</p>
      <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.18em] ${trendColor}`}>{trendText}</p>
    </article>
  );
};

export default AnalyticsCard;
