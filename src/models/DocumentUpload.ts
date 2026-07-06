import mongoose, { Schema, model, models } from 'mongoose';

const DocumentUploadSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  documentType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'Profile' },
  reviewedAt: { type: Date },
}, { timestamps: true });

const DocumentUpload = models.DocumentUpload || model('DocumentUpload', DocumentUploadSchema);
export default DocumentUpload;
