import mongoose, { Schema, model, models } from 'mongoose';

const AlumniSchema = new Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  batchYear: { type: Number, required: true },
  photoUrl: { type: String },
  email: { type: String },
  linkedinUrl: { type: String },
  currentCompany: { type: String },
  companyLogoUrl: { type: String },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

const Alumni = models.Alumni || model('Alumni', AlumniSchema);
export default Alumni;
