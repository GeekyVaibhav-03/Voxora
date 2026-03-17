import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ConfusionRadar = ({
  heatmap = {},
  onConfused,
  onInsight,
  insight,
  loadingInsight,
}) => {
  const chartData = useMemo(() => {
    const points = Object.entries(heatmap)
      .map(([bucket, value]) => ({
        bucket,
        label: new Date(bucket).toLocaleTimeString([], {
          minute: '2-digit',
          second: '2-digit',
        }),
        value,
      }))
      .sort((left, right) => new Date(left.bucket).getTime() - new Date(right.bucket).getTime())
      .slice(-12);

    return points;
  }, [heatmap]);

  return (
    <section className='glass-card p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Confusion Radar</p>
          <h3 className='font-display text-lg text-white'>10-Second Heatmap</h3>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={onConfused}
            className='rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400'
          >
            I&apos;m Confused
          </button>
          <button
            type='button'
            onClick={onInsight}
            disabled={loadingInsight}
            className='rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/20 disabled:opacity-60'
          >
            {loadingInsight ? 'Analyzing...' : 'AI Insight'}
          </button>
        </div>
      </div>

      <div className='h-52 rounded-xl border border-white/10 bg-slate-950/55 p-2'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' stroke='rgba(148,163,184,0.2)' />
            <XAxis dataKey='label' tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: 'rgba(148,163,184,0.12)' }}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(148,163,184,0.4)',
                borderRadius: 8,
              }}
            />
            <Bar dataKey='value' fill='#38bdf8' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className='mt-2 text-xs text-slate-400'>
        Live confusion buckets are aggregated every 10 seconds and broadcast to all participants.
      </p>

      {insight ? (
        <div className='mt-3 rounded-xl border border-brand-300/35 bg-brand-500/10 p-3 text-sm text-slate-100'>
          <p className='text-xs uppercase tracking-[0.16em] text-brand-100'>AI Insight</p>
          <p className='mt-1'>{insight}</p>
        </div>
      ) : null}
    </section>
  );
};

export default ConfusionRadar;
