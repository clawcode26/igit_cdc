import mongoose, { Schema, model, models } from 'mongoose';

const CalendarEventSchema = new Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['ACADEMIC', 'HOLIDAY', 'WORKSHOP', 'TRAINING', 'PLACEMENT_DRIVE', 'APTITUDE_CLASS'],
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
  isPastEvent: { type: Boolean, default: false },
  galleryImageUrls: [{ type: String }],
}, { timestamps: true });

const CalendarEvent = models.CalendarEvent || model('CalendarEvent', CalendarEventSchema);
export default CalendarEvent;
