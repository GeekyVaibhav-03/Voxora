import React, { useEffect, useRef } from 'react';

const fallbackStudents = [
  { id: 1, name: 'Aarav', speaking: true },
  { id: 2, name: 'Sara', speaking: false },
  { id: 3, name: 'Nora', speaking: false },
  { id: 4, name: 'Dev', speaking: true },
  { id: 5, name: 'Kian', speaking: false },
  { id: 6, name: 'Mina', speaking: false },
];

const VideoGrid = ({
  teacherName = 'Professor Mira',
  sessionTitle = 'AI Powered Physics Live',
  students = fallbackStudents,
  teacherStream = null,
  studentStream = null,
  studentName = 'Learner',
  viewerRole = 'teacher',
  isCameraOn = true,
  isScreenSharing = false,
  mediaError = '',
  transcriptLines = [],
  interimTranscript = '',
  transcriptState = 'idle',
  transcriptError = '',
  isTranscriptSupported = false,
}) => {
  const teacherVideoRef = useRef(null);
  const studentVideoRef = useRef(null);

  const latestTranscript = interimTranscript || transcriptLines[transcriptLines.length - 1] || '';

  const transcriptStateMap = {
    listening: { label: 'Listening', className: 'text-emerald-300' },
    connecting: { label: 'Connecting', className: 'text-amber-300' },
    reconnecting: { label: 'Reconnecting', className: 'text-amber-300' },
    blocked: { label: 'Blocked', className: 'text-rose-300' },
    unsupported: { label: 'Unsupported', className: 'text-rose-300' },
    error: { label: 'Error', className: 'text-rose-300' },
    idle: { label: 'Paused', className: 'text-slate-300' },
  };

  const transcriptMeta = transcriptStateMap[transcriptState] || transcriptStateMap.idle;

  const transcriptText = !isTranscriptSupported
    ? 'Transcript is not supported in this browser. Use latest Chrome or Edge.'
    : transcriptError || latestTranscript || 'Start speaking to generate live transcript.';

  const waitingMainFeedMessage = viewerRole === 'student'
    ? 'Waiting for teacher video stream. Your camera is shown in student tiles.'
    : isCameraOn
      ? 'Waiting for camera stream...'
      : 'Camera is off';

  const participantTiles = studentStream
    ? [{ id: 'self', name: studentName, speaking: true, isSelf: true }, ...students.slice(0, 5)]
    : students;

  useEffect(() => {
    if (!teacherVideoRef.current) return;
    teacherVideoRef.current.srcObject = teacherStream || null;
  }, [teacherStream]);

  useEffect(() => {
    if (!studentVideoRef.current) return;
    studentVideoRef.current.srcObject = studentStream || null;
  }, [studentStream]);

  return (
    <section className='glass-card p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Main Stream</p>
          <h2 className='font-display text-xl text-slate-100'>{sessionTitle}</h2>
        </div>
        <span className='rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200'>
          Live Now
        </span>
      </div>

      <div className='grid gap-3 xl:grid-cols-3'>
        <article className='relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-5 xl:col-span-2'>
          <div className='absolute inset-0 overflow-hidden rounded-2xl'>
            {teacherStream ? (
              <video
                ref={teacherVideoRef}
                autoPlay
                playsInline
                muted
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='grid h-full place-items-center bg-slate-900/90'>
                <p className='px-5 text-center text-sm text-slate-300'>
                  {mediaError || waitingMainFeedMessage}
                </p>
              </div>
            )}
            <div className='absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-cyan-300/15' />
            <div className='absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent' />
          </div>
          <div className='relative z-10 flex h-64 flex-col justify-between sm:h-80'>
            <div className='flex items-center justify-between'>
              <p className='rounded-full border border-white/15 bg-slate-950/50 px-3 py-1 text-xs text-slate-300'>
                {isScreenSharing ? 'Screen Share' : 'Teacher Feed'}
              </p>
              <p className='text-xs text-slate-300'>
                {isScreenSharing ? 'Presenting screen to class' : `Transcript ${transcriptMeta.label}`}
              </p>
            </div>
            <div>
              <h3 className='font-display text-2xl text-white'>{teacherName}</h3>
              <p className='text-sm text-slate-300'>Explaining chapter with live annotations</p>
              <div className='mt-3 rounded-xl border border-white/20 bg-slate-950/55 p-3 backdrop-blur'>
                <div className='mb-1 flex items-center justify-between gap-2'>
                  <p className='text-[11px] uppercase tracking-[0.18em] text-slate-300'>Live Transcript</p>
                  <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${transcriptMeta.className}`}>
                    {transcriptMeta.label}
                  </p>
                </div>
                <p className='max-h-14 overflow-hidden text-sm text-slate-100'>
                  {transcriptText}
                </p>
              </div>
            </div>
          </div>
        </article>

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2'>
          {participantTiles.map((student) => {
            if (student.isSelf) {
              return (
                <article
                  key={student.id}
                  className='flex h-32 flex-col justify-between rounded-2xl border border-brand-300/30 bg-slate-900/70 p-3'
                >
                  <div className='h-12 w-12 overflow-hidden rounded-full border border-brand-300/40 bg-slate-800'>
                    {studentStream ? (
                      <video
                        ref={studentVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <div className='h-full w-full bg-gradient-to-br from-brand-400 to-cyan-300' />
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-slate-100'>{student.name} (You)</p>
                    <p className='text-xs text-brand-200'>Student Camera</p>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={student.id}
                className='flex h-32 flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-3'
              >
                <div className='h-12 w-12 rounded-full bg-gradient-to-br from-brand-400 to-cyan-300' />
                <div>
                  <p className='text-sm font-semibold text-slate-100'>{student.name}</p>
                  <p className={`text-xs ${student.speaking ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {student.speaking ? 'Speaking' : 'Listening'}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VideoGrid;
