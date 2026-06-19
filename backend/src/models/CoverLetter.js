import mongoose from 'mongoose';

const coverLetterSchema = new mongoose.Schema(
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
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to optimize user-based lookups
coverLetterSchema.index({ userId: 1 });

const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
export default CoverLetter;
