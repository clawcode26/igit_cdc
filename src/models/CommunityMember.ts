import mongoose, { Schema, model, models } from 'mongoose';

const CommunityMemberSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  phoneNumber: { type: String, required: true },
  whatsappOptIn: { type: Boolean, default: false },
  telegramOptIn: { type: Boolean, default: false },
  onboardedAt: { type: Date },
  groupOrChannelId: { type: String },
}, { timestamps: true });

const CommunityMember = models.CommunityMember || model('CommunityMember', CommunityMemberSchema);
export default CommunityMember;
