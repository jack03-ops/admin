import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';

// Helper to calculate exact plan end date
const getPlanEndDate = (startDateStr, durationMonths) => {
  const date = new Date(startDateStr);
  date.setMonth(date.getMonth() + durationMonths);
  return date;
};

// @desc    Get all enrolled members (with multi-field search and parameters)
// @route   GET /api/members
// @access  Private
export const getMembers = async (req, res, next) => {
  try {
    const { search, field, status, village } = req.query;
    let query = {};

    // 1. Filter by Status
    if (status === 'active') {
      query.activeStatus = true;
    } else if (status === 'inactive') {
      query.activeStatus = false;
    } else if (status === 'pending') {
      query.paymentStatus = 'Pending';
    } else if (status === 'expiring') {
      const today = new Date();
      const fifteenDays = new Date();
      fifteenDays.setDate(today.getDate() + 15);
      query.activeStatus = true;
      query.endDate = { $gte: today, $lte: fifteenDays };
    }

    // 2. Filter by geographical village hotspots
    if (village) {
      query.village = new RegExp(village, 'i');
    }

    // 3. Multi-field text query search
    if (search) {
      const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, 'i');

      if (field && field !== 'all') {
        if (field === 'id') query.clientId = searchRegex;
        else if (field === 'name') query.fullName = searchRegex;
        else if (field === 'phone') query.phone = searchRegex;
        else if (field === 'village') query.village = searchRegex;
      } else {
        query.$or = [
          { clientId: searchRegex },
          { fullName: searchRegex },
          { phone: searchRegex },
          { village: searchRegex }
        ];
      }
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single member profile records
// @route   GET /api/members/:id
// @access  Private
export const getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member record not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll new gym member in the system
// @route   POST /api/members
// @access  Private
export const createMember = async (req, res, next) => {
  try {
    const { 
      fullName, phone, whatsapp, village, address, gender, age, 
      plan, startDate, paymentStatus, notes, profilePhoto,
      dob, height, weight, bmi, emergencyContact, email,
      purposeOfJoining, gymExperience, profession, amountPaid,
      hasMedicalCondition, medicalConditionDetails
    } = req.body;

    // 1. Generate unique sequential Client ID
    const count = await Member.countDocuments();
    const nextSeq = 1001 + count;
    const clientId = `PXM-${nextSeq}`;

    // 2. Check Plan Duration
    const planObj = await Plan.findOne({ name: plan });
    const duration = planObj ? planObj.durationMonths : 1;
    const computedEndDate = getPlanEndDate(startDate, duration);

    // 3. Create profile
    const member = await Member.create({
      clientId,
      fullName,
      phone,
      whatsapp: whatsapp || '',
      village,
      address: address || '',
      gender,
      age,
      plan,
      startDate,
      endDate: computedEndDate,
      paymentStatus,
      notes: notes || '',
      profilePhoto: profilePhoto || '',
      dob: dob || null,
      height: height || null,
      weight: weight || null,
      bmi: bmi || null,
      emergencyContact: emergencyContact || '',
      email: email || '',
      purposeOfJoining: purposeOfJoining || '',
      gymExperience: gymExperience || '',
      profession: profession || '',
      amountPaid: amountPaid || 0,
      hasMedicalCondition: hasMedicalCondition || '',
      medicalConditionDetails: medicalConditionDetails || ''
    });

    // 4. Create auto invoice transaction ledger log if Paid
    if (paymentStatus === 'Paid') {
      const price = amountPaid || (planObj ? planObj.price : 1000);
      const countTx = await Payment.countDocuments();
      const receiptId = `TXN-${101 + countTx}`;
      
      await Payment.create({
        receiptId,
        memberId: member._id,
        clientId: member.clientId,
        clientName: member.fullName,
        amount: price,
        plan: member.plan,
        method: 'UPI'
      });
    }

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc    Update active member profile details
// @route   PUT /api/members/:id
// @access  Private
export const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member record not found' });
    }

    // Auto-update EndDate if plan parameters or StartDate is modified
    if (req.body.plan || req.body.startDate) {
      const planName = req.body.plan || member.plan;
      const start = req.body.startDate || member.startDate;
      const planObj = await Plan.findOne({ name: planName });
      const duration = planObj ? planObj.durationMonths : 1;
      req.body.endDate = getPlanEndDate(start, duration);
    }

    const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete member record
// @route   DELETE /api/members/:id
// @access  Private
export const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member record not found' });
    }

    await member.deleteOne();
    res.status(200).json({ success: true, message: 'Member profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Membership manual renewal trigger
// @route   POST /api/members/:id/renew
// @access  Private
export const renewMembership = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member record not found' });
    }

    const { planName, method } = req.body;
    const planObj = await Plan.findOne({ name: planName || member.plan });
    if (!planObj) {
      return res.status(400).json({ success: false, message: 'Valid membership plan required' });
    }

    // Renew sets StartDate to old EndDate if not expired, or today if already expired
    const today = new Date();
    const currentEnd = new Date(member.endDate);
    const newStart = currentEnd > today ? currentEnd : today;
    const newEnd = getPlanEndDate(newStart, planObj.durationMonths);

    // Save member state change
    member.plan = planObj.name;
    member.startDate = newStart;
    member.endDate = newEnd;
    member.paymentStatus = 'Paid';
    member.activeStatus = true;
    await member.save();

    // Create billing transaction receipt log
    const countTx = await Payment.countDocuments();
    const receiptId = `TXN-${101 + countTx}`;
    
    const payment = await Payment.create({
      receiptId,
      memberId: member._id,
      clientId: member.clientId,
      clientName: member.fullName,
      amount: planObj.price,
      plan: planObj.name,
      method: method || 'UPI'
    });

    res.status(200).json({
      success: true,
      message: 'Subscription successfully extended',
      data: { member, payment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate membership profile
// @route   PATCH /api/members/:id/activate
// @access  Private
export const activateMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id, 
      { activeStatus: true }, 
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member record not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate membership profile
// @route   PATCH /api/members/:id/deactivate
// @access  Private
export const deactivateMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id, 
      { activeStatus: false }, 
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ success: false, message: 'Gym member record not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};
