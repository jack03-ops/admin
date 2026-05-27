import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  durationMonths: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

export default mongoose.model('Plan', PlanSchema);
