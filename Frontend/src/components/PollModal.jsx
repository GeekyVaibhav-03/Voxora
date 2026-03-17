import React, { useState } from 'react';

const initialOptions = ['', '', ''];

const PollModal = ({ open, onClose, onStart }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(initialOptions);

  if (!open) return null;

  const updateOption = (index, value) => {
    setOptions((prev) => prev.map((option, optionIndex) => (optionIndex === index ? value : option)));
  };

  const handleSubmit = () => {
    const validOptions = options.map((option) => option.trim()).filter(Boolean);
    if (!question.trim() || validOptions.length < 2) return;

    onStart({ question: question.trim(), options: validOptions });
    setQuestion('');
    setOptions(initialOptions);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4'>
      <div className='w-full max-w-lg rounded-2xl border border-white/10 bg-surface-900 p-5'>
        <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Live Poll</p>
        <h2 className='mt-1 font-display text-xl text-slate-100'>Start a Quick Class Poll</h2>

        <div className='mt-4 space-y-3'>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder='Poll question'
            className='w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-brand-400/40 focus:ring'
          />

          {options.map((option, index) => (
            <input
              key={`option-${index + 1}`}
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
              placeholder={`Option ${index + 1}`}
              className='w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-brand-400/40 focus:ring'
            />
          ))}
        </div>

        <div className='mt-5 flex justify-end gap-2'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:text-white'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
          >
            Start Poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollModal;
