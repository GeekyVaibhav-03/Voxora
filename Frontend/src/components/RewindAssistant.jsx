import React from 'react';

const RewindAssistant = ({
  onExplain,
  loading,
  explanation,
  transcript,
}) => {
  return (
    <section className='glass-card p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>AI Rewind</p>
          <h3 className='font-display text-lg text-white'>Smart Explanation (Last 2 Minutes)</h3>
        </div>
        <button
          type='button'
          onClick={onExplain}
          disabled={loading}
          className='rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-400 disabled:opacity-60'
        >
          {loading ? 'Generating...' : 'Explain Last 2 Minutes'}
        </button>
      </div>

      {explanation ? (
        <div className='space-y-3'>
          <article className='rounded-xl border border-emerald-300/35 bg-emerald-500/10 p-3'>
            <p className='text-xs uppercase tracking-[0.16em] text-emerald-200'>Simple Explanation</p>
            <p className='mt-1 text-sm text-slate-100'>{explanation}</p>
          </article>

          <details className='rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200'>
            <summary className='cursor-pointer font-semibold text-slate-100'>Transcript used for explanation</summary>
            <p className='mt-2 whitespace-pre-wrap text-xs text-slate-300'>
              {transcript || 'Transcript not available'}
            </p>
          </details>
        </div>
      ) : (
        <p className='text-sm text-slate-300'>
          Click the button to get a beginner-friendly explanation of the most recent lecture segment.
        </p>
      )}
    </section>
  );
};

export default RewindAssistant;
