import WorkoutPlan from '../models/WorkoutPlan.js';
import DietPlan from '../models/DietPlan.js';
import Member from '../models/Member.js';

// @desc    Get member's active workout sheet
// @route   GET /api/workout/:clientId
// @access  Private
export const getWorkoutPlan = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    let plan = await WorkoutPlan.findOne({ clientId });
    
    if (!plan) {
      const member = await Member.findOne({ clientId });
      if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      // Return empty configuration structure to avoid errors
      return res.status(200).json({
        success: true,
        data: {
          clientId,
          memberName: member.fullName,
          exercises: []
        }
      });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update member's workout sheet
// @route   POST /api/workout/:clientId
// @access  Private
export const saveWorkoutPlan = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { exercises } = req.body;

    const member = await Member.findOne({ clientId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    let plan = await WorkoutPlan.findOne({ clientId });
    if (plan) {
      plan.exercises = exercises;
      plan.lastUpdatedBy = req.admin ? req.admin.username : 'Admin';
      await plan.save();
    } else {
      plan = await WorkoutPlan.create({
        memberId: member._id,
        clientId,
        memberName: member.fullName,
        exercises,
        lastUpdatedBy: req.admin ? req.admin.username : 'Admin'
      });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Get member's active diet sheet
// @route   GET /api/diet/:clientId
// @access  Private
export const getDietPlan = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    let plan = await DietPlan.findOne({ clientId });
    
    if (!plan) {
      const member = await Member.findOne({ clientId });
      if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      return res.status(200).json({
        success: true,
        data: {
          clientId,
          memberName: member.fullName,
          meals: [],
          waterTargetLiters: 3.5
        }
      });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update member's diet sheet
// @route   POST /api/diet/:clientId
// @access  Private
export const saveDietPlan = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { meals, waterTargetLiters } = req.body;

    const member = await Member.findOne({ clientId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    let plan = await DietPlan.findOne({ clientId });
    if (plan) {
      plan.meals = meals;
      if (waterTargetLiters) plan.waterTargetLiters = waterTargetLiters;
      plan.lastUpdatedBy = req.admin ? req.admin.username : 'Admin';
      await plan.save();
    } else {
      plan = await DietPlan.create({
        memberId: member._id,
        clientId,
        memberName: member.fullName,
        meals,
        waterTargetLiters: waterTargetLiters || 3.5,
        lastUpdatedBy: req.admin ? req.admin.username : 'Admin'
      });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};
