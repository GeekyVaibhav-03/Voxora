import React, { useEffect, useMemo, useRef, useState } from 'react';
import io from 'socket.io-client';
import server from '../environment';

const seedChat = [
  { id: 1, sender: 'Sara', text: 'Can you repeat the formula for drag force?' },
  { id: 2, sender: 'Professor Mira', text: 'Sure, I will write it on the board in 10 seconds.' },
];

const seedAi = [
  { id: 1, sender: 'AI Tutor', text: 'Today: Newtonian motion and force balancing.' },
];

const reactions = ['Thumbs Up', 'Clap', 'Idea', 'Rocket'];

const ChatPanel = ({ roomId = 'live', username = 'Learner' }) => {
  const [tab, setTab] = useState('chat');
  const [text, setText] = useState('');
  const [raisedHand, setRaisedHand] = useState(false);
  const [chatMessages, setChatMessages] = useState(seedChat);
  const [aiMessages, setAiMessages] = useState(seedAi);
  const [connectionState, setConnectionState] = useState('connecting');
  const socketRef = useRef(null);

  useEffect(() => {
    setConnectionState('connecting');

    const socket = io(server, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionState('connected');
      socket.emit('join-call', `classroom:${roomId}`);
    });

    socket.on('disconnect', () => {
      setConnectionState('offline');
    });

    socket.on('connect_error', () => {
      setConnectionState('offline');
    });

    socket.on('chat-message', (data, sender) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          sender: sender || 'Peer',
          text: data,
        },
      ]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const messages = useMemo(
    () => (tab === 'chat' ? chatMessages : aiMessages),
    [tab, chatMessages, aiMessages],
  );

  const statusClass =
    connectionState === 'connected'
      ? 'text-emerald-300'
      : connectionState === 'connecting'
        ? 'text-amber-300'
        : 'text-rose-300';

  const statusText =
    connectionState === 'connected'
      ? 'Realtime Connected'
      : connectionState === 'connecting'
        ? 'Connecting...'
        : 'Offline Mode';

  const submitMessage = () => {
    const value = text.trim();
    if (!value) return;

    if (tab === 'chat') {
      if (socketRef.current?.connected) {
        socketRef.current.emit('chat-message', value, username);
      } else {
        setChatMessages((prev) => [...prev, { id: Date.now(), sender: username, text: value }]);
      }
    } else {
      setAiMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: username, text: value },
        {
          id: Date.now() + 1,
          sender: 'AI Tutor',
          text: 'Quick answer: focus on free-body diagram first, then solve step by step.',
        },
      ]);
    }

    setText('');
  };

  return (
    <aside className='flex h-full flex-col border-l border-white/10 bg-slate-950/60'>
      <div className='border-b border-white/10 p-4'>
        <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Collaboration Panel</p>
        <h3 className='mt-1 font-display text-lg text-slate-100'>Chat and AI Assistant</h3>
        <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass}`}>{statusText}</p>
      </div>

      <div className='grid grid-cols-2 gap-2 px-4 pt-4'>
        <button
          type='button'
          onClick={() => setTab('chat')}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            tab === 'chat' ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300'
          }`}
        >
          Chat
        </button>
        <button
          type='button'
          onClick={() => setTab('ai')}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            tab === 'ai' ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300'
          }`}
        >
          AI Tutor
        </button>
      </div>

      <div className='mt-3 flex-1 space-y-3 overflow-y-auto px-4'>
        {messages.map((message) => (
          <article key={message.id} className='rounded-xl border border-white/10 bg-white/5 p-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.14em] text-slate-400'>{message.sender}</p>
            <p className='mt-1 text-sm text-slate-200'>{message.text}</p>
          </article>
        ))}
      </div>

      <div className='border-t border-white/10 p-4'>
        <div className='mb-3 flex flex-wrap gap-2'>
          {reactions.map((reaction) => (
            <button
              key={reaction}
              type='button'
              className='rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-300 hover:text-white'
            >
              {reaction}
            </button>
          ))}
        </div>

        <button
          type='button'
          onClick={() => setRaisedHand((prev) => !prev)}
          className={`mb-3 w-full rounded-xl px-3 py-2 text-sm font-semibold ${
            raisedHand ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-100'
          }`}
        >
          {raisedHand ? 'Hand Raised' : 'Raise Hand'}
        </button>

        <div className='flex gap-2'>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submitMessage()}
            placeholder={tab === 'chat' ? 'Message class...' : 'Ask AI about this lecture...'}
            className='w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-brand-400/50 transition focus:ring'
          />
          <button
            type='button'
            onClick={submitMessage}
            className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatPanel;
