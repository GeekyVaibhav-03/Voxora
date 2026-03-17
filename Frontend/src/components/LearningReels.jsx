import React, { useMemo, useState } from 'react';

const defaultReels = [
  {
    id: 'r1',
    title: 'Force vs Acceleration in 30s',
    topic: 'Physics',
    summary: 'Quick trick: if mass stays same, more force means more acceleration. Use shopping cart examples.',
  },
  {
    id: 'r2',
    title: 'Why Fractions Feel Hard',
    topic: 'Math',
    summary: 'Think of fractions as pizza slices. Equivalent fractions are same pizza, different slice cuts.',
  },
  {
    id: 'r3',
    title: 'Photosynthesis Memory Hack',
    topic: 'Biology',
    summary: 'Plants use light + water + carbon dioxide to make food and oxygen. Remember: light kitchen for plants.',
  },
  {
    id: 'r4',
    title: 'History Timeline Shortcuts',
    topic: 'History',
    summary: 'Anchor events around major wars and revolutions, then fill side events between anchors.',
  },
];

const LearningReels = ({ reels = defaultReels }) => {
  const [index, setIndex] = useState(0);
  const [likedIds, setLikedIds] = useState([]);

  const activeReel = useMemo(() => reels[index] || reels[0], [reels, index]);

  const nextReel = () => {
    setIndex((prev) => (prev + 1) % reels.length);
  };

  const previousReel = () => {
    setIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  const toggleLike = () => {
    if (!activeReel) return;

    setLikedIds((prev) =>
      prev.includes(activeReel.id)
        ? prev.filter((item) => item !== activeReel.id)
        : [...prev, activeReel.id],
    );
  };

  if (!activeReel) {
    return null;
  }

  const isLiked = likedIds.includes(activeReel.id);

  return (
    <section className='glass-card p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Learning Reels</p>
          <h2 className='font-display text-xl text-white'>Interactive Micro Lessons</h2>
        </div>
        <span className='rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-slate-300'>
          Reel {index + 1} / {reels.length}
        </span>
      </div>

      <article className='rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
        <p className='text-xs uppercase tracking-[0.16em] text-brand-200'>{activeReel.topic}</p>
        <h3 className='mt-2 text-lg font-semibold text-white'>{activeReel.title}</h3>
        <p className='mt-2 text-sm text-slate-300'>{activeReel.summary}</p>

        <div className='mt-4 flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={previousReel}
            className='rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 hover:border-brand-300'
          >
            Previous
          </button>
          <button
            type='button'
            onClick={nextReel}
            className='rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-400'
          >
            Next Reel
          </button>
          <button
            type='button'
            onClick={toggleLike}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              isLiked ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-100'
            }`}
          >
            {isLiked ? 'Liked' : 'Like'}
          </button>
        </div>
      </article>
    </section>
  );
};

export default LearningReels;
