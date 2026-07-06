import mongoose, { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
  actorType: { type: String, required: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);
export default AuditLog;
