import mongoose, { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
  firebase_uid: { type: String, required: true, unique: true },
  registrationNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  branch: { type: String, required: true },
  batchYear: { type: Number, required: true },
  currentSemester: { type: Number },
  dob: { type: Date },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  parentMobile: { type: String },
  parentEmail: { type: String },
  address: { type: String },
  cgpa: { type: Number, default: 0 },
  backlogCount: { type: Number, default: 0 },
  gender: { type: String },
  photoUrl: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const Student = models.Student || model('Student', StudentSchema);

export default Student;
