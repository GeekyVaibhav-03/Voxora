import { randomUUID } from 'node:crypto';
import { Doubt } from '../models/doubt.model.js';
import { buildConfusionInsight, simplifyTranscript } from '../services/ai.service.js';
import { areDoubtsSimilar } from '../utils/similarity.js';
import { getTenSecondBucket } from '../utils/timeBucket.js';

const roomHeatmaps = {};
const roomTranscripts = {};
const roomParticipants = {};

const sampleTranscript = [
  'Today we are discussing force, mass, and acceleration.',
  'Force is equal to mass multiplied by acceleration.',
  'If mass stays same and force increases, acceleration also increases.',
].join(' ');

const normalizeRoomCode = (roomPath = '') => {
  const rawCode = String(roomPath).split(':').pop() || '';
  return rawCode.trim().toLowerCase();
};

const resolveRoomPath = (socket, payload = {}) => {
  if (payload?.path) {
    return String(payload.path);
  }

  if (payload?.roomId) {
    return `classroom:${String(payload.roomId).toLowerCase()}`;
  }

  if (payload?.roomCode) {
    return `classroom:${String(payload.roomCode).toLowerCase()}`;
  }

  return socket?.data?.path || '';
};

const emitParticipants = (io, roomPath) => {
  io.to(roomPath).emit('participants-update', roomParticipants[roomPath] || []);
};

const emitGroupedDoubts = async (io, roomPath) => {
  const meetingCode = normalizeRoomCode(roomPath);
  if (!meetingCode) return;

  const doubts = await Doubt.find({ meetingCode }).sort({ count: -1, updatedAt: -1 }).lean();
  io.to(roomPath).emit('grouped-doubts', doubts);
};

const emitHeatmap = (io, roomPath) => {
  io.to(roomPath).emit('update-heatmap', roomHeatmaps[roomPath] || {});
};

const buildRoomMonitorSnapshot = () =>
  Object.entries(roomParticipants)
    .map(([roomPath, participants]) => {
      const teachers = participants.filter((item) => item.role === 'teacher');
      const students = participants.filter((item) => item.role !== 'teacher');

      return {
        roomPath,
        roomCode: normalizeRoomCode(roomPath).toUpperCase(),
        totalCount: participants.length,
        teacherCount: teachers.length,
        studentCount: students.length,
        teacherNames: teachers.map((item) => item.name),
        studentNamesPreview: students.slice(0, 6).map((item) => item.name),
      };
    })
    .sort((left, right) => right.totalCount - left.totalCount);

const emitRoomMonitorSnapshot = (io) => {
  io.emit('room-monitor-update', buildRoomMonitorSnapshot());
};

const joinLearningRoom = async (io, socket, roomPath, participant = {}) => {
  if (!roomPath) return;

  socket.data.path = roomPath;
  socket.join(roomPath);

  const existing = roomParticipants[roomPath] || [];
  roomParticipants[roomPath] = [
    ...existing.filter((item) => item.socketId !== socket.id),
    {
      socketId: socket.id,
      name: participant.name || 'Learner',
      role: participant.role || 'student',
    },
  ];

  emitParticipants(io, roomPath);
  emitHeatmap(io, roomPath);
  emitRoomMonitorSnapshot(io);
  await emitGroupedDoubts(io, roomPath);
};

export const registerLearningSocketHandlers = (io, socket) => {
  socket.on('subscribe-room-monitor', () => {
    socket.emit('room-monitor-update', buildRoomMonitorSnapshot());
  });

  socket.on('join-classroom', async (payload = {}) => {
    const roomPath = resolveRoomPath(socket, payload);

    await joinLearningRoom(io, socket, roomPath, {
      name: payload?.name,
      role: payload?.role,
    });
  });

  socket.on('request-room-snapshot', async (payload = {}) => {
    const roomPath = resolveRoomPath(socket, payload);
    if (!roomPath) return;

    emitParticipants(io, roomPath);
    emitHeatmap(io, roomPath);
    await emitGroupedDoubts(io, roomPath);
  });

  socket.on('new-doubt', async (payload = {}) => {
    const roomPath = resolveRoomPath(socket, payload);
    const meetingCode = normalizeRoomCode(roomPath);
    const text = String(payload?.text || '').trim();

    if (!meetingCode || !text) {
      return;
    }

    const currentDoubts = await Doubt.find({ meetingCode }).sort({ updatedAt: -1 }).lean();
    const similarDoubt = currentDoubts.find((item) => areDoubtsSimilar(item.text, text));

    if (similarDoubt?._id) {
      await Doubt.findByIdAndUpdate(similarDoubt._id, {
        $inc: { count: 1 },
        $set: { timestamp: new Date(payload?.timestamp || Date.now()) },
      });
    } else {
      await Doubt.create({
        meetingCode,
        text,
        timestamp: new Date(payload?.timestamp || Date.now()),
        groupId: randomUUID(),
        count: 1,
      });
    }

    await emitGroupedDoubts(io, roomPath);
  });

  socket.on('confusion', (payload = {}) => {
    const roomPath = resolveRoomPath(socket, payload);
    if (!roomPath) return;

    if (!roomHeatmaps[roomPath]) {
      roomHeatmaps[roomPath] = {};
    }

    const bucket = getTenSecondBucket(payload?.timestamp || Date.now());
    roomHeatmaps[roomPath][bucket] = (roomHeatmaps[roomPath][bucket] || 0) + 1;
    emitHeatmap(io, roomPath);
  });

  socket.on('transcript-line', (payload = {}) => {
    const roomPath = resolveRoomPath(socket, payload);
    const text = String(payload?.text || '').trim();

    if (!roomPath || !text) {
      return;
    }

    if (!roomTranscripts[roomPath]) {
      roomTranscripts[roomPath] = [];
    }

    roomTranscripts[roomPath].push({
      text,
      timestamp: Number(payload?.timestamp || Date.now()),
      speaker: String(payload?.speaker || 'Teacher'),
    });

    if (roomTranscripts[roomPath].length > 300) {
      roomTranscripts[roomPath] = roomTranscripts[roomPath].slice(-300);
    }
  });

  socket.on('rewind-request', async (payload = {}) => {
    const roomPath = resolveRoomPath(socket, payload);
    if (!roomPath) return;

    const now = Number(payload?.timestamp || Date.now());
    const twoMinutesAgo = now - 2 * 60 * 1000;

    const recentLines = (roomTranscripts[roomPath] || [])
      .filter((line) => Number(line.timestamp) >= twoMinutesAgo)
      .map((line) => `${line.speaker}: ${line.text}`);

    const transcript = recentLines.length ? recentLines.join('\n') : sampleTranscript;
    const explanation = await simplifyTranscript(transcript);

    socket.emit('rewind-response', {
      explanation,
      transcript,
      at: new Date().toISOString(),
    });
  });

  socket.on('insight-request', async (payload = {}) => {
    const roomPath = resolveRoomPath(socket, payload);
    if (!roomPath) return;

    const insight = await buildConfusionInsight(roomHeatmaps[roomPath] || {});
    socket.emit('insight-response', {
      insight,
      at: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    let hasRoomChanges = false;

    Object.keys(roomParticipants).forEach((roomPath) => {
      const next = (roomParticipants[roomPath] || []).filter((item) => item.socketId !== socket.id);

      if (next.length === 0) {
        delete roomParticipants[roomPath];
        hasRoomChanges = true;
      } else {
        if (next.length !== (roomParticipants[roomPath] || []).length) {
          hasRoomChanges = true;
        }
        roomParticipants[roomPath] = next;
      }

      emitParticipants(io, roomPath);
    });

    if (hasRoomChanges) {
      emitRoomMonitorSnapshot(io);
    }
  });
};
