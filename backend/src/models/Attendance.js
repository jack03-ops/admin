import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['QR Code', 'Manual'],
    default: 'QR Code'
  }
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);
