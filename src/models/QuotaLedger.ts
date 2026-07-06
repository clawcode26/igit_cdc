import mongoose, { Schema, model, models } from 'mongoose';

const QuotaLedgerSchema = new Schema({
  channel: { type: String, enum: ['SMS', 'EMAIL'], required: true },
  packageSize: { type: Number, required: true },
  consumed: { type: Number, default: 0 },
  purchaseOrderRef: { type: String },
  poValidFrom: { type: Date },
  poValidTo: { type: Date },
}, { timestamps: true });

const QuotaLedger = models.QuotaLedger || model('QuotaLedger', QuotaLedgerSchema);
export default QuotaLedger;
