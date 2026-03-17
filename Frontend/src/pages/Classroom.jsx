import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AnalyticsCard from '../components/AnalyticsCard';
import ChatPanel from '../components/ChatPanel';
import ConfusionRadar from '../components/ConfusionRadar';
import Leaderboard from '../components/Leaderboard';
import Navbar from '../components/Navbar';
import PollModal from '../components/PollModal';
import RewindAssistant from '../components/RewindAssistant';
import SilentDoubtPanel from '../components/SilentDoubtPanel';
import VideoGrid from '../components/VideoGrid';
import { AuthContext } from '../context/AuthContext';
import server from '../environment';
import io from 'socket.io-client';

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
  const {
    addToUserHistory,
    addRecordingMeta,
    getRecordingsByMeetingCode,
    userData,
  } = useContext(AuthContext);
  const userRole = localStorage.getItem('role') || '';
  const studentRoomAccess = sessionStorage.getItem('student-room-access') || '';
  const teacherRoomAccess = sessionStorage.getItem('teacher-room-access') || '';
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';
  const normalizedClassId = normalizeRoomCode(id);
  const hasClassroomAccess = isStudent
    ? normalizeRoomCode(studentRoomAccess) === normalizedClassId
    : isTeacher
      ? normalizeRoomCode(teacherRoomAccess) === normalizedClassId
      : true;
  const trackedRoomsRef = useRef(new Set());
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const manualRecognitionStopRef = useRef(false);
  const micOnRef = useRef(true);
  const mediaReadyRef = useRef(false);
  const socketRef = useRef(null);
  const recordingStartRef = useRef(0);

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
  const [participants, setParticipants] = useState([]);
  const [groupedDoubts, setGroupedDoubts] = useState([]);
  const [doubtText, setDoubtText] = useState('');
  const [sendingDoubt, setSendingDoubt] = useState(false);
  const [heatmap, setHeatmap] = useState({});
  const [rewindLoading, setRewindLoading] = useState(false);
  const [rewindExplanation, setRewindExplanation] = useState('');
  const [rewindTranscript, setRewindTranscript] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMessage, setRecordingMessage] = useState('');
  const [recordings, setRecordings] = useState([]);
  const [activeTeachingStep, setActiveTeachingStep] = useState(0);

  const stopTracks = (stream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    if (hasClassroomAccess) {
      return;
    }

    navigate(isTeacher ? '/teacher' : '/student', { replace: true });
  }, [navigate, hasClassroomAccess, isTeacher]);

  useEffect(() => {
    if (!hasClassroomAccess) {
      return;
    }

    if (!id || trackedRoomsRef.current.has(id)) {
      return;
    }

    trackedRoomsRef.current.add(id);
    addToUserHistory(id).catch(() => {
      // Keep classroom flow available even if activity API is unavailable.
    });

    getRecordingsByMeetingCode(id)
      .then((response) => {
        setRecordings(Array.isArray(response) ? response : []);
      })
      .catch(() => {
        setRecordings([]);
      });
  }, [id, addToUserHistory, hasClassroomAccess]);

  useEffect(() => {
    if (!hasClassroomAccess) {
      return undefined;
    }

    const socket = io(server, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-classroom', {
        roomCode: id,
        roomId: id,
        path: `classroom:${id}`,
        role: isTeacher ? 'teacher' : 'student',
        name: userData?.username || localStorage.getItem('username') || (isTeacher ? 'Teacher' : 'Student'),
      });

      socket.emit('request-room-snapshot', {
        roomCode: id,
        roomId: id,
        path: `classroom:${id}`,
      });
    });

    socket.on('participants-update', (payload = []) => {
      setParticipants(Array.isArray(payload) ? payload : []);
    });

    socket.on('grouped-doubts', (payload = []) => {
      setGroupedDoubts(Array.isArray(payload) ? payload : []);
    });

    socket.on('update-heatmap', (payload = {}) => {
      setHeatmap(payload || {});
    });

    socket.on('rewind-response', (payload = {}) => {
      setRewindLoading(false);
      setRewindExplanation(payload?.explanation || 'No explanation received');
      setRewindTranscript(payload?.transcript || '');
    });

    socket.on('insight-response', (payload = {}) => {
      setInsightLoading(false);
      setInsight(payload?.insight || 'No insight generated yet.');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [hasClassroomAccess, id, isTeacher, userData?.username]);

  useEffect(() => {
    if (!isTeacher || teachingFlowSteps.length === 0) {
      return undefined;
    }

    setActiveTeachingStep((previous) => previous % teachingFlowSteps.length);

    const intervalId = setInterval(() => {
      setActiveTeachingStep((previous) => (previous + 1) % teachingFlowSteps.length);
    }, 3800);

    return () => clearInterval(intervalId);
  }, [isTeacher, teachingFlowSteps.length]);

  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  useEffect(() => {
    mediaReadyRef.current = mediaReady;
  }, [mediaReady]);

  useEffect(() => {
    if (!hasClassroomAccess) {
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
  }, [hasClassroomAccess]);

  useEffect(() => {
    if (!hasClassroomAccess) {
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

        if (socketRef.current?.connected) {
          finalSegments.forEach((line) => {
            socketRef.current.emit('transcript-line', {
              roomCode: id,
              roomId: id,
              path: `classroom:${id}`,
              text: line,
              speaker: userData?.username || (isTeacher ? 'Teacher' : 'Student'),
              timestamp: Date.now(),
            });
          });
        }
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
  }, [hasClassroomAccess]);

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
  const activeStudents = participants.filter((item) => item.role === 'student').length;
  const inactiveStudents = Math.max(0, 30 - activeStudents);

  const teachingFlowSteps = useMemo(() => {
    const currentTopic = latestPoll?.question
      || transcriptLines[transcriptLines.length - 1]
      || `Core concept from session ${(id || 'live-room').toUpperCase()}`;

    const strongestDoubt = groupedDoubts[0]
      ? `${groupedDoubts[0].text} (${groupedDoubts[0].count || 1} students)`
      : 'No high-volume doubt cluster yet. Trigger quick checks for understanding.';

    const transcriptSnippet = transcriptLines.slice(-2).join(' ').trim()
      || 'No finalized transcript segment yet. Speak short checkpoints and ask students to paraphrase.';

    const insightPreview = insight
      ? insight.slice(0, 180)
      : 'Request confusion insight after a few student responses to target weak areas.';

    return [
      {
        title: 'Topic Warmup',
        detail: `Start with this focus topic: ${currentTopic}`,
      },
      {
        title: 'Address Top Doubt',
        detail: `Resolve the strongest confusion point: ${strongestDoubt}`,
      },
      {
        title: 'Guided Explanation',
        detail: `Build the explanation around this recent context: ${transcriptSnippet}`,
      },
      {
        title: 'AI Insight Recap',
        detail: `Close with adaptive recap based on radar insight: ${insightPreview}`,
      },
    ];
  }, [id, latestPoll?.question, groupedDoubts, transcriptLines, insight]);

  const submitDoubt = () => {
    if (!isStudent) {
      return;
    }

    const text = doubtText.trim();
    if (!text || !socketRef.current?.connected) {
      return;
    }

    setSendingDoubt(true);
    socketRef.current.emit('new-doubt', {
      roomCode: id,
      roomId: id,
      path: `classroom:${id}`,
      text,
      timestamp: Date.now(),
    });

    setDoubtText('');
    setTimeout(() => {
      setSendingDoubt(false);
    }, 300);
  };

  const emitConfusion = () => {
    if (!isStudent) {
      return;
    }

    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('confusion', {
      roomCode: id,
      roomId: id,
      path: `classroom:${id}`,
      timestamp: Date.now(),
    });
  };

  const requestRewind = () => {
    if (!isStudent) {
      return;
    }

    if (!socketRef.current?.connected) {
      return;
    }

    setRewindLoading(true);
    socketRef.current.emit('rewind-request', {
      roomCode: id,
      roomId: id,
      path: `classroom:${id}`,
      timestamp: Date.now(),
    });
  };

  const requestInsight = () => {
    if (!isStudent) {
      return;
    }

    if (!socketRef.current?.connected) {
      return;
    }

    setInsightLoading(true);
    socketRef.current.emit('insight-request', {
      roomCode: id,
      roomId: id,
      path: `classroom:${id}`,
    });
  };

  const toggleRecording = async () => {
    if (!isTeacher) {
      setRecordingMessage('Only teachers can record this classroom.');
      return;
    }

    if (!isRecording) {
      recordingStartRef.current = Date.now();
      setIsRecording(true);
      setRecordingMessage('Recording started. This is metadata capture prototype mode.');
      return;
    }

    const durationSec = Math.max(1, Math.floor((Date.now() - recordingStartRef.current) / 1000));
    const fakeSizeBytes = durationSec * 42000;
    const fileName = `recording-${id}-${Date.now()}.webm`;

    try {
      await addRecordingMeta({
        meetingCode: id,
        durationSec,
        sizeBytes: fakeSizeBytes,
        fileName,
      });

      const latest = await getRecordingsByMeetingCode(id);
      setRecordings(Array.isArray(latest) ? latest : []);
      setRecordingMessage('Recording stopped and metadata saved.');
    } catch {
      setRecordingMessage('Could not save recording metadata right now.');
    } finally {
      setIsRecording(false);
      recordingStartRef.current = 0;
    }
  };

  const handleLeaveClass = () => {
    if (isStudent) {
      sessionStorage.removeItem('student-room-access');
      navigate('/student');
      return;
    }

    if (isTeacher) {
      sessionStorage.removeItem('teacher-room-access');
      navigate('/teacher');
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
            teacherName={isTeacher ? (userData?.username || localStorage.getItem('username') || 'Teacher') : 'Teacher'}
            teacherStream={isTeacher ? (shareOn && screenStream ? screenStream : camOn ? localStream : null) : null}
            studentStream={!isTeacher && camOn ? localStream : null}
            studentName={userData?.username || localStorage.getItem('username') || 'Student'}
            viewerRole={isTeacher ? 'teacher' : 'student'}
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

          {isStudent ? (
            <section className='grid gap-4 xl:grid-cols-2'>
              <SilentDoubtPanel
                doubtText={doubtText}
                onDoubtTextChange={setDoubtText}
                onSubmitDoubt={submitDoubt}
                submitting={sendingDoubt}
                groupedDoubts={groupedDoubts}
              />

              <div className='space-y-4'>
                <ConfusionRadar
                  heatmap={heatmap}
                  onConfused={emitConfusion}
                  onInsight={requestInsight}
                  insight={insight}
                  loadingInsight={insightLoading}
                />
                <RewindAssistant
                  onExplain={requestRewind}
                  loading={rewindLoading}
                  explanation={rewindExplanation}
                  transcript={rewindTranscript}
                />
              </div>
            </section>
          ) : null}

          {isTeacher ? (
            <section className='glass-card p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <div>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Teaching Assistant</p>
                  <h3 className='font-display text-lg text-white'>Animated Explanation Flow</h3>
                </div>
                <span className='rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-100'>
                  Live Guidance
                </span>
              </div>

              <div className='space-y-3'>
                {teachingFlowSteps.map((step, index) => {
                  const isActiveStep = index === activeTeachingStep;

                  return (
                    <article
                      key={step.title}
                      className={`rounded-xl border p-3 transition-all duration-500 ${
                        isActiveStep
                          ? 'border-brand-300/40 bg-brand-500/10 shadow-soft'
                          : 'border-white/10 bg-white/5 opacity-80'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            isActiveStep
                              ? 'bg-brand-500 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <h4 className='font-semibold text-slate-100'>{step.title}</h4>
                      </div>
                      <p className='mt-2 text-sm text-slate-300'>{step.detail}</p>
                      <div className='mt-2 h-1 overflow-hidden rounded-full bg-slate-800'>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r from-brand-400 to-cyan-300 transition-all duration-700 ${
                            isActiveStep ? 'w-full' : 'w-0'
                          }`}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {isTeacher ? (
            <section className='glass-card p-4'>
            <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
              <div>
                <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Classroom Recording</p>
                <h3 className='font-display text-lg text-white'>Teacher Recording Controls</h3>
              </div>
              <button
                type='button'
                onClick={toggleRecording}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  isRecording ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-brand-500 text-white hover:bg-brand-400'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>

            {recordingMessage ? (
              <p className='mb-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100'>
                {recordingMessage}
              </p>
            ) : null}

            <div className='space-y-2'>
              {recordings.length === 0 ? (
                <p className='rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300'>
                  No recording metadata found for this classroom yet.
                </p>
              ) : (
                recordings.slice(0, 5).map((recording) => (
                  <div
                    key={recording._id}
                    className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200'
                  >
                    <span>{recording.fileName || 'session-recording.webm'}</span>
                    <span className='text-xs text-slate-400'>
                      {recording.durationSec}s | {(Number(recording.sizeBytes || 0) / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))
              )}
            </div>
            </section>
          ) : null}

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
          {isTeacher ? (
            <button
              type='button'
              onClick={() => setPollOpen(true)}
              className='rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400'
            >
              Start Poll
            </button>
          ) : null}
          {isStudent ? (
            <button
              type='button'
              onClick={emitConfusion}
              className='rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400'
            >
              I&apos;m Confused
            </button>
          ) : null}
          {isStudent ? (
            <button
              type='button'
              onClick={requestRewind}
              className='rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/20'
            >
              Explain Last 2 Minutes
            </button>
          ) : null}
          {isTeacher ? (
            <button
              type='button'
              onClick={toggleRecording}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                isRecording ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Record Class'}
            </button>
          ) : null}
          <button
            type='button'
            onClick={handleLeaveClass}
            className='rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400'
          >
            Leave Class
          </button>
        </div>
      </footer>

      {isTeacher ? (
        <PollModal open={pollOpen} onClose={() => setPollOpen(false)} onStart={setLatestPoll} />
      ) : null}
    </div>
  );
};

export default Classroom;
