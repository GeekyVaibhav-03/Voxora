import mongoose, { Schema } from 'mongoose';

const recordingSchema = new Schema(
  {
    meetingCode: { type: String, required: true, index: true },
    teacherUsername: { type: String, required: true },
    durationSec: { type: Number, default: 0 },
    sizeBytes: { type: Number, default: 0 },
    fileName: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Recording = mongoose.model('Recording', recordingSchema);

export { Recording };
