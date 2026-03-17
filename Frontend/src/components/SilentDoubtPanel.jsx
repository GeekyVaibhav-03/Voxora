import React from 'react';

const formatTime = (timestamp) => {
  if (!timestamp) return '--';

  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SilentDoubtPanel = ({
  doubtText,
  onDoubtTextChange,
  onSubmitDoubt,
  submitting,
  groupedDoubts = [],
}) => {
  return (
    <section className='glass-card p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Silent Doubt System</p>
          <h3 className='font-display text-lg text-white'>Anonymous Doubt Grouping</h3>
        </div>
        <span className='rounded-full border border-brand-300/35 bg-brand-500/15 px-3 py-1 text-xs text-brand-100'>
          Live Grouping
        </span>
      </div>

      <div className='space-y-2'>
        <textarea
          value={doubtText}
          onChange={(event) => onDoubtTextChange(event.target.value)}
          rows={3}
          maxLength={300}
          placeholder='Type your doubt anonymously...'
          className='w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-brand-400/50 transition focus:ring'
        />
        <button
          type='button'
          disabled={submitting || !doubtText.trim()}
          onClick={onSubmitDoubt}
          className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {submitting ? 'Sending...' : 'Send Anonymous Doubt'}
        </button>
      </div>

      <div className='mt-4 space-y-2'>
        {groupedDoubts.length === 0 ? (
          <p className='rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300'>
            No grouped doubts yet. Ask students to submit doubts anonymously.
          </p>
        ) : (
          groupedDoubts.map((item) => (
            <article
              key={item._id || item.groupId}
              className='rounded-xl border border-white/10 bg-white/5 p-3'
            >
              <p className='text-sm text-slate-100'>{item.text}</p>
              <div className='mt-2 flex items-center justify-between text-xs text-slate-400'>
                <span>Last: {formatTime(item.timestamp || item.updatedAt)}</span>
                <span className='rounded-full border border-amber-300/40 bg-amber-500/10 px-2 py-1 text-amber-200'>
                  Count: {item.count || 1}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default SilentDoubtPanel;
