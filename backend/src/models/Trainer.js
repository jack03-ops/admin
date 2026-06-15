import mongoose from 'mongoose';

const TrainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a trainer name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a trainer phone number'],
    trim: true
  },
  specialty: {
    type: String,
    default: 'General Fitness'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  schedule: {
    type: String,
    enum: ['Morning Batch', 'Evening Batch', 'Full Time'],
    default: 'Full Time'
  },
  assignedCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Trainer', TrainerSchema);
