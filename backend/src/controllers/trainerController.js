import Trainer from '../models/Trainer.js';
import Member from '../models/Member.js';

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
export const getTrainers = async (req, res, next) => {
  try {
    const trainers = await Trainer.find().sort({ name: 1 });
    
    // Dynamically calculate assigned count from current active members database
    const trainersWithCount = await Promise.all(trainers.map(async (trainer) => {
      // Find count of members assigned to this trainer
      // Wait, we can add a trainer field or just store it. Let's make sure it's accurate.
      const assignedCount = await Member.countDocuments({ trainerId: trainer._id, activeStatus: true });
      trainer.assignedCount = assignedCount;
      await trainer.save();
      return trainer;
    }));

    res.status(200).json({ success: true, count: trainersWithCount.length, data: trainersWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new trainer
// @route   POST /api/trainers
// @access  Private
export const createTrainer = async (req, res, next) => {
  try {
    const { name, phone, specialty, schedule } = req.body;

    const trainer = await Trainer.create({
      name,
      phone,
      specialty,
      schedule
    });

    res.status(201).json({ success: true, data: trainer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trainer details
// @route   PUT /api/trainers/:id
// @access  Private
export const updateTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer record not found' });
    }

    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove trainer profile
// @route   DELETE /api/trainers/:id
// @access  Private
export const deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer record not found' });
    }

    // Unassign members assigned to this trainer
    await Member.updateMany({ trainerId: trainer._id }, { $unset: { trainerId: 1 } });

    await trainer.deleteOne();
    res.status(200).json({ success: true, message: 'Trainer profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};
