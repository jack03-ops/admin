import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
  mealTime: { type: String, required: true }, // e.g. "Breakfast", "Pre-workout", "Lunch", "Evening Snack", "Dinner"
  items: { type: String, required: true }, // e.g. "Oats, 4 Egg whites, 1 Banana"
  calories: { type: Number, default: 0 }
});

const DietPlanSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
    unique: true
  },
  clientId: { type: String, required: true },
  memberName: { type: String, required: true },
  meals: [MealSchema],
  waterTargetLiters: {
    type: Number,
    default: 3.5
  },
  lastUpdatedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

export default mongoose.model('DietPlan', DietPlanSchema);
