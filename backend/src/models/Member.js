import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^(\+91\s?)?\d{10}$/, 'Please add a valid 10-digit Indian phone number (optionally prefixed with +91)']
  },
  whatsapp: {
    type: String,
    default: ''
  },
  village: {
    type: String,
    required: [true, 'Please add a village name']
  },
  address: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  age: {
    type: Number,
    required: [true, 'Please add an age'],
    min: [12, 'Age must be at least 12'],
    max: [100, 'Age cannot exceed 100']
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  plan: {
    type: String,
    required: [true, 'Please choose a membership plan']
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please specify end date']
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  activeStatus: {
    type: Boolean,
    default: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    default: null
  },
  dob: {
    type: Date,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  weight: {
    type: Number,
    default: null
  },
  bmi: {
    type: Number,
    default: null
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  purposeOfJoining: {
    type: String,
    enum: ['Gain Weight', 'Lose Weight', 'Fitness', 'Become Professional', ''],
    default: ''
  },
  gymExperience: {
    type: String,
    enum: ['Yes', 'No', ''],
    default: ''
  },
  profession: {
    type: String,
    default: ''
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  hasMedicalCondition: {
    type: String,
    enum: ['Yes', 'No', ''],
    default: ''
  },
  medicalConditionDetails: {
    type: String,
    default: ''
  },
  personalTrainerOption: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Member', MemberSchema);
