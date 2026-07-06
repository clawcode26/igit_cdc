import mongoose, { Schema, model, models } from 'mongoose';

const NoticeTargetSchema = new Schema({
  noticeId: { type: Schema.Types.ObjectId, ref: 'Notice', required: true },
  targetType: { 
    type: String, 
    enum: ['ALL', 'BATCH', 'BRANCH', 'SINGLE_STUDENT', 'RANDOM_GROUP'],
    required: true
  },
  batchYear: { type: Number },
  branch: { type: String },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  studentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
}, { timestamps: true });

const NoticeTarget = models.NoticeTarget || model('NoticeTarget', NoticeTargetSchema);
export default NoticeTarget;
