import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true }, // e.g. "12-15" or "10"
  weight: { type: String, default: '' }, // e.g. "20kg" or "Bodyweight"
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All Days'], default: 'All Days' }
});

const WorkoutPlanSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
    unique: true
  },
  clientId: { type: String, required: true },
  memberName: { type: String, required: true },
  exercises: [ExerciseSchema],
  lastUpdatedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

export default mongoose.model('WorkoutPlan', WorkoutPlanSchema);
