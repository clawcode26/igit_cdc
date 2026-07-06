import mongoose, { Schema, model, models } from 'mongoose';

const NoticeSchema = new Schema({
  refNo: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true }, // Rich text
  forTo: { type: String, required: true },
  dateIssued: { type: Date, required: true },
  undersigned: { type: String, required: true },
  linkUrl: { type: String },
  nbNote: { type: String },
  attachmentUrl: { type: String },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Profile' },
}, { timestamps: true });

const Notice = models.Notice || model('Notice', NoticeSchema);
export default Notice;
