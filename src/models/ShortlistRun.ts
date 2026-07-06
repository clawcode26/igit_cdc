import mongoose, { Schema, model, models } from 'mongoose';

const ShortlistRunSchema = new Schema({
  driveTitle: { type: String, required: true },
  criteria: {
    branch: [{ type: String }],
    minPercentage: { type: Number },
    maxAge: { type: Number },
    minCgpa: { type: Number },
    maxBacklogs: { type: Number }
  },
  resultStudentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'Profile' },
}, { timestamps: true });

const ShortlistRun = models.ShortlistRun || model('ShortlistRun', ShortlistRunSchema);
export default ShortlistRun;
