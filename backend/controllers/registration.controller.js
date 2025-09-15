const Attendee = require('../models/registration'); // your mongoose schema
const { sendConfirmationEmail } = require('../services/emailService');
const { sendConfirmationSms } = require('../services/smsService');
const crypto = require('crypto');

// registration.controller.js (top of file)
const EVENT_START = new Date(process.env.EVENT_START);

if (isNaN(EVENT_START)) {
  throw new Error(`Invalid EVENT_START date: ${process.env.EVENT_START}`);
}


// Simple rope colors pool
const ROPE_COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'White', 'Purple'];

// Zonal coordinators map (state/city → coordinator)
const COORDINATORS = {
  lagos: { name: 'Pastor John Doe', phone: '+2348012345678' },
  abuja: { name: 'Sister Mary Ann', phone: '+2348098765432' },
  ibadan: { name: 'Brother Samuel', phone: '+2348076543210' },
  // add more mappings...
};

/**
 * Generate a unique registration code
 */
function generateCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g., A4F9C2
}

/**
 * Assign a prayer slot dynamically.
 * Example: each person gets 15 min slots starting from EVENT_START.
 */
function assignPrayerTime(index) {
  const EVENT_START = new Date(process.env.EVENT_START);
  if (isNaN(EVENT_START)) {
    throw new Error(`Invalid EVENT_START date: ${process.env.EVENT_START}`);
  }
  return new Date(EVENT_START.getTime() + index * 15 * 60000);
}

/**
 * Pick a rope color in round-robin fashion
 */
function assignRopeColor(index) {
  return ROPE_COLORS[index % ROPE_COLORS.length];
}

/**
 * Map state/city to coordinator
 */
function getCoordinator(stateOrCity) {
  const key = stateOrCity?.toLowerCase();
  return COORDINATORS[key] || { name: 'General Coordinator', phone: '+2347000000000' };
}

exports.registerAttendee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, state, city } = req.body;

    // Get total count so far to assign slot + rope
    const count = await Attendee.countDocuments();

    // Generate unique code
    const code = generateCode();

    // Assign prayer time
    const prayerTime = assignPrayerTime(count, process.env.EVENT_START);

    // Assign rope color
    const ropeColor = assignRopeColor(count);

    // Map coordinator
    const coordinator = getCoordinator(city || state);

    // Create attendee
    const att = await Attendee.create({
      firstName,
      lastName,
      email,
      phone,
      state,
      city,
      code,
      prayerTime,
      ropeColor,
      coordinator
    });

    // Send confirmations
    await sendConfirmationEmail(att, code);
    await sendConfirmationSms(att, code);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: att
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
