import mongoose, { Schema, model, models } from 'mongoose';

const InternshipLetterSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  currentSemester: { type: Number, required: true },
  dob: { type: Date, required: true },
  recipientDesignation: { type: String, required: true },
  recipientAddress: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  generatedPdfUrl: { type: String, required: true },
  refNo: { type: String, required: true, unique: true },
}, { timestamps: true });

const InternshipLetter = models.InternshipLetter || model('InternshipLetter', InternshipLetterSchema);
export default InternshipLetter;
