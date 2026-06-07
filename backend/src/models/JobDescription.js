import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      default: 'Unknown Role',
    },
    company: {
      type: String,
      default: 'Unknown Company',
    },
    hash: {
      type: String,
      index: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    analysis: {
      requiredKeywords: [{ type: String }],
      preferredKeywords: [{ type: String }],
      softSkills: [{ type: String }],
      technologies: [{ type: String }],
      certifications: [{ type: String }],
      keywordImportance: {
        type: Map,
        of: Number,
        default: () => new Map(),
      },
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index to optimize user-based lookups
jobDescriptionSchema.index({ userId: 1 });

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);
export default JobDescription;
