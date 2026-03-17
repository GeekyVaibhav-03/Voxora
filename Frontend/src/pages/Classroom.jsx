import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AnalyticsCard from '../components/AnalyticsCard';
import ChatPanel from '../components/ChatPanel';
import Leaderboard from '../components/Leaderboard';
import Navbar from '../components/Navbar';
import PollModal from '../components/PollModal';
import VideoGrid from '../components/VideoGrid';
import { AuthContext } from '../context/AuthContext';

const attendanceTrend = [68, 74, 80, 84, 81, 88, 92, 89];

const faq = [
  'What is the fastest way to identify a net force direction?',
  'How should we approach vector components under exam pressure?',
  'When to use conservation laws vs direct force equations?',
  'Can we derive acceleration from momentum change in this case?',
];

const normalizeRoomCode = (value = '') => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

const Classroom = () => {
  const navigate = useNavigate();
  const { id = 'live' } = useParams();
  const { addToUserHistory, userData } = useContext(AuthContext);
  const userRole = localStorage.getItem('role') || '';
  const studentRoomAccess = sessionStorage.getItem('student-room-access') || '';
  const studentAccessAllowed = userRole !== 'student' || normalizeRoomCode(studentRoomAccess) === normalizeRoomCode(id);
  const trackedRoomsRef = useRef(new Set());
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const manualRecognitionStopRef = useRef(false);
  const micOnRef = useRef(true);
  const mediaReadyRef = useRef(false);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [shareOn, setShareOn] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [latestPoll, setLatestPoll] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [mediaError, setMediaError] = useState('');
  const [mediaReady, setMediaReady] = useState(false);
  const [isTranscriptSupported, setIsTranscriptSupported] = useState(false);
  const [transcriptState, setTranscriptState] = useState('idle');
  const [transcriptError, setTranscriptError] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [transcriptLines, setTranscriptLines] = useState([]);

  const stopTracks = (stream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    if (studentAccessAllowed) {
      return;
    }

    navigate('/student', { replace: true });
  }, [navigate, studentAccessAllowed]);

  useEffect(() => {
    if (!studentAccessAllowed) {
      return;
    }

    if (!id || trackedRoomsRef.current.has(id)) {
      return;
    }

    trackedRoomsRef.current.add(id);
    addToUserHistory(id).catch(() => {
      // Keep classroom flow available even if activity API is unavailable.
    });
  }, [id, addToUserHistory, studentAccessAllowed]);

  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    mediaReadyRef.current = mediaReady;
  }, [mediaReady]);

  useEffect(() => {
    if (!studentAccessAllowed) {
      return undefined;
    }

    let mounted = true;

    const applyLocalStream = (stream) => {
      localStreamRef.current = stream;
      setLocalStream(stream);
      setMediaReady(true);
    };

    const initializeMedia = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not supported in this browser.');
        }

        let stream = null;
        let audioAvailable = true;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch {
          // If mic permission is blocked, continue with camera-only mode.
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          audioAvailable = false;
        }

        if (!mounted) {
          stopTracks(stream);
          return;
        }

        applyLocalStream(stream);

        if (!audioAvailable) {
          setMicOn(false);
          setMediaError('Microphone permission is blocked. Camera is active in video-only mode.');
          return;
        }

        setMediaError('');
      } catch (error) {
        if (!mounted) return;

        setMediaReady(false);
        setCamOn(false);
        setMicOn(false);
        setMediaError(error?.message || 'Unable to access camera and microphone.');
      }
    };

    initializeMedia();

    return () => {
      mounted = false;
      stopTracks(screenStreamRef.current);
      stopTracks(localStreamRef.current);
      screenStreamRef.current = null;
      localStreamRef.current = null;
    };
  }, [studentAccessAllowed]);

  useEffect(() => {
    if (!studentAccessAllowed) {
      return undefined;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsTranscriptSupported(false);
      setTranscriptState('unsupported');
      setTranscriptError('Live transcript is not supported in this browser.');
      return undefined;
    }

    setIsTranscriptSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionRunningRef.current = true;
      setTranscriptState('listening');
      setTranscriptError('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      const finalSegments = [];

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0]?.transcript?.trim();
        if (!text) continue;

        if (event.results[index].isFinal) {
          finalSegments.push(text);
        } else {
          interim = `${interim} ${text}`.trim();
        }
      }

      if (finalSegments.length > 0) {
        setTranscriptLines((previous) => [...previous, ...finalSegments].slice(-12));
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        manualRecognitionStopRef.current = true;
        setTranscriptState('blocked');
        setTranscriptError('Microphone permission is blocked for transcript generation.');
        return;
      }

      setTranscriptState('error');
      setTranscriptError(`Transcript error: ${event.error}`);
    };

    recognition.onend = () => {
      recognitionRunningRef.current = false;

      if (!manualRecognitionStopRef.current && micOnRef.current && mediaReadyRef.current) {
        setTranscriptState('reconnecting');
        try {
          recognition.start();
          return;
        } catch {
          setTranscriptState('error');
          setTranscriptError('Unable to restart transcript engine.');
        }
      }

      setTranscriptState('idle');
    };

    speechRecognitionRef.current = recognition;

    return () => {
      manualRecognitionStopRef.current = true;
      try {
        recognition.stop();
      } catch {
        // Speech recognition may already be stopped.
      }
      speechRecognitionRef.current = null;
      recognitionRunningRef.current = false;
    };
  }, [studentAccessAllowed]);

  useEffect(() => {
    if (!isTranscriptSupported || !speechRecognitionRef.current) {
      return;
    }

    const recognition = speechRecognitionRef.current;

    if (micOn && mediaReady) {
      manualRecognitionStopRef.current = false;

      if (!recognitionRunningRef.current) {
        setTranscriptState('connecting');
        try {
          recognition.start();
        } catch {
          // Recognition may already be in start transition.
        }
      }
      return;
    }

    manualRecognitionStopRef.current = true;
    setInterimTranscript('');

    if (recognitionRunningRef.current) {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }
    } else {
      setTranscriptState('idle');
    }
  }, [micOn, mediaReady, isTranscriptSupported]);

  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = micOn;
      });
  }, [micOn]);

  useEffect(() => {
    if (!localStreamRef.current) return;
    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = camOn;
      });
  }, [camOn]);

  const toggleScreenShare = async () => {
    if (shareOn) {
      stopTracks(screenStreamRef.current);
      screenStreamRef.current = null;
      setScreenStream(null);
      setShareOn(false);
      return;
    }

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser.');
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      screenStreamRef.current = displayStream;
      setScreenStream(displayStream);
      setShareOn(true);
      setMediaError('');

      const [screenTrack] = displayStream.getVideoTracks();
      if (screenTrack) {
        screenTrack.onended = () => {
          stopTracks(screenStreamRef.current);
          screenStreamRef.current = null;
          setScreenStream(null);
          setShareOn(false);
        };
      }
    } catch (error) {
      setMediaError(error?.message || 'Unable to start screen share.');
    }
  };

  const engagement = 84;
  const activeStudents = 24;
  const inactiveStudents = 6;
  const handleLeaveClass = () => {
    if (userRole === 'student') {
      sessionStorage.removeItem('student-room-access');
      navigate('/student');
      return;
    }

    navigate('/teacher');
  };

  return (
    <div className='min-h-screen text-slate-100'>
      <Navbar title={`Voxora Live | ${id}`} showLinks={false} />

      <div className='flex min-h-[calc(100vh-72px)] flex-col lg:flex-row'>
        <main className='w-full flex-1 space-y-4 p-4'>
          <VideoGrid
            sessionTitle={`Classroom ${id.toUpperCase()}`}
            teacherName={userData?.username || localStorage.getItem('username') || 'Teacher'}
            teacherStream={shareOn && screenStream ? screenStream : camOn ? localStream : null}
            isScreenSharing={shareOn}
            isCameraOn={camOn}
            mediaError={mediaError}
            transcriptLines={transcriptLines}
            interimTranscript={interimTranscript}
            transcriptState={transcriptState}
            transcriptError={transcriptError}
            isTranscriptSupported={isTranscriptSupported}
          />

          {!mediaReady && !mediaError ? (
            <p className='rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200'>
              Initializing camera and microphone...
            </p>
          ) : null}

          {mediaError ? (
            <p className='rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100'>
              {mediaError}
            </p>
          ) : null}

          <section className='glass-card p-4'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Analytics Panel</p>
                <h2 className='font-display text-xl text-white'>Live Engagement Analytics</h2>
              </div>
              <span className='rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-100'>
                Updated every 5s
              </span>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <AnalyticsCard
                title='Engagement Meter'
                value={`${engagement}%`}
                subtitle='Overall class focus and participation'
                trend='up'
                icon='ENG'
              />
              <AnalyticsCard
                title='Active Students'
                value={activeStudents}
                subtitle='Interacting through chat and reactions'
                trend='up'
                icon='ACT'
              />
              <AnalyticsCard
                title='Inactive Students'
                value={inactiveStudents}
                subtitle='Needs teacher follow-up cue'
                trend='down'
                icon='INA'
              />
            </div>

            <div className='mt-4 rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='mb-2 flex justify-between text-sm text-slate-300'>
                <span>Engagement Meter</span>
                <span>{engagement}%</span>
              </div>
              <div className='h-3 overflow-hidden rounded-full bg-slate-800'>
                <div className='h-full rounded-full bg-gradient-to-r from-cyan-300 to-brand-400' style={{ width: `${engagement}%` }} />
              </div>
            </div>

            <div className='mt-4 grid gap-4 xl:grid-cols-2'>
              <article className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Most Asked Questions</p>
                <div className='mt-3 space-y-2'>
                  {faq.map((question) => (
                    <p key={question} className='rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-200'>
                      {question}
                    </p>
                  ))}
                </div>
              </article>

              <article className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Attendance Graph</p>
                <div className='mt-4 flex h-40 items-end gap-2'>
                  {attendanceTrend.map((value, index) => (
                    <div key={`att-${index + 1}`} className='flex flex-1 flex-col items-center gap-2'>
                      <div
                        className='w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-cyan-300/80'
                        style={{ height: `${value}%` }}
                      />
                      <span className='text-[10px] text-slate-400'>{index + 1}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <Leaderboard title='Class Participation Rankings' />

          {latestPoll && (
            <section className='glass-card p-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Latest Poll</p>
              <h3 className='mt-1 font-display text-lg text-slate-100'>{latestPoll.question}</h3>
              <div className='mt-3 flex flex-wrap gap-2'>
                {latestPoll.options.map((option) => (
                  <span key={option} className='rounded-full border border-brand-300/40 bg-brand-500/10 px-3 py-1 text-xs text-brand-100'>
                    {option}
                  </span>
                ))}
              </div>
            </section>
          )}
        </main>

        <div className='h-[560px] w-full lg:h-auto lg:w-[360px] xl:w-[380px]'>
          <ChatPanel
            roomId={id}
            username={userData?.username || localStorage.getItem('username') || 'Learner'}
          />
        </div>
      </div>

      <footer className='sticky bottom-0 z-30 border-t border-white/10 bg-slate-950/95 p-3 backdrop-blur-xl'>
        <div className='mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-2 sm:gap-3'>
          <button
            type='button'
            onClick={() => setMicOn((prev) => !prev)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${micOn ? 'bg-white/10 text-slate-100' : 'bg-rose-500 text-white'}`}
          >
            {micOn ? 'Mic On' : 'Mic Off'}
          </button>
          <button
            type='button'
            onClick={() => setCamOn((prev) => !prev)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${camOn ? 'bg-white/10 text-slate-100' : 'bg-rose-500 text-white'}`}
          >
            {camOn ? 'Camera On' : 'Camera Off'}
          </button>
          <button
            type='button'
            onClick={toggleScreenShare}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${shareOn ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-100'}`}
          >
            {shareOn ? 'Sharing Screen' : 'Share Screen'}
          </button>
          <button
            type='button'
            onClick={() => setPollOpen(true)}
            className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
          >
            Start Poll
          </button>
          <button
            type='button'
            onClick={handleLeaveClass}
            className='rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400'
          >
            Leave Class
          </button>
        </div>
      </footer>

      <PollModal open={pollOpen} onClose={() => setPollOpen(false)} onStart={setLatestPoll} />
    </div>
  );
};

export default Classroom;
