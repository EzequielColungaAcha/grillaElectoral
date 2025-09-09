import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['error', 'warn', 'info', 'debug'],
      default: 'info',
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      index: true,
    },
    user: {
      id: String,
      username: String,
      name: String,
      role: String,
    },
    target: {
      type: String,
      id: String,
      identifier: String,
      number: Number,
      tableNumber: Number,
      order: Number,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
logSchema.index({ timestamp: -1, action: 1 });
logSchema.index({ 'user.id': 1, timestamp: -1 });
logSchema.index({ action: 1, timestamp: -1 });

export default mongoose.model('Log', logSchema);
