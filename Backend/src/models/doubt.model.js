import mongoose, { Schema } from 'mongoose';

const doubtSchema = new Schema(
  {
    meetingCode: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    groupId: { type: String, required: true, index: true },
    count: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true },
);

const Doubt = mongoose.model('Doubt', doubtSchema);

export { Doubt };
