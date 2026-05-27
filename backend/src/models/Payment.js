import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  receiptId: {
    type: String,
    required: true,
    unique: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['UPI', 'Cash', 'Card', 'Net Banking'],
    default: 'UPI'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
