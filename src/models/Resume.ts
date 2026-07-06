import mongoose, { Schema, model, models } from 'mongoose';

const ResumeSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  education: [{ type: Schema.Types.Mixed }],
  experience: [{ type: Schema.Types.Mixed }],
  projects: [{ type: Schema.Types.Mixed }],
  skills: [{ type: String }],
  positionsOfResponsibility: [{ type: Schema.Types.Mixed }],
  achievements: [{ type: Schema.Types.Mixed }],
  generatedPdfUrl: { type: String },
}, { timestamps: true });

const Resume = models.Resume || model('Resume', ResumeSchema);
export default Resume;
