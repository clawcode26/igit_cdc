import mongoose, { Schema, model, models } from 'mongoose';

const MessageDeliveryLogSchema = new Schema({
  noticeId: { type: Schema.Types.ObjectId, ref: 'Notice', required: true },
  channel: { type: String, enum: ['EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'], required: true },
  recipientStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
  recipientContact: { type: String, required: true },
  status: { type: String, enum: ['QUEUED', 'SENT', 'FAILED', 'DELIVERED'], required: true },
  errorMessage: { type: String },
  sentAt: { type: Date },
}, { timestamps: true });

const MessageDeliveryLog = models.MessageDeliveryLog || model('MessageDeliveryLog', MessageDeliveryLogSchema);
export default MessageDeliveryLog;
