const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  role: String,
  gender: String,
  affiliation: String,
  city: String,
  state: String,
  nursing: String,
  ropeColor: String,
  prayerTime: Date,
  prayerSlotId: String,
  code: { type: String, unique: true, index: true },
  coordinator: {
    name: String,
    phone: String,
    email: String,
    zone: String
  },
  tagAssigned: { type: Boolean, default: false },
  remindersSent: { // track reminders to avoid duplicates
    event24h: { type: Boolean, default: false },
    event1h: { type: Boolean, default: false },
    prayer1h: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
