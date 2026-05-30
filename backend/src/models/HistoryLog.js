import mongoose from 'mongoose';

const historyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: ['bullet_rewrite', 'summary_rewrite', 'experience_enhancement', 'ats_optimization'],
    },
    originalContent: {
      type: String,
      required: true,
    },
    generatedContent: {
      type: String,
      required: true,
    },
    promptType: {
      type: String,
      required: true,
    },
    promptVersion: {
      type: String,
      default: 'v1.0.0',
    },
    tokensUsed: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'rolled_back'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for rapid performance metrics and rollback tracking
historyLogSchema.index({ userId: 1, resumeId: 1 });
historyLogSchema.index({ status: 1 });

const HistoryLog = mongoose.model('HistoryLog', historyLogSchema);
export default HistoryLog;
