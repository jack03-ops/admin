import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['SMS', 'WhatsApp'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Sent', 'Failed'],
    default: 'Sent'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
