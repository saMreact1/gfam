const { nanoid } = require('nanoid');
const Registration = require('../models/registration');
const Coordinator = require('../models/coordinator');

// Config: rope colors + prayer slot template (example 2-hour slots)
const ROPE_COLORS = ['White','Blue','Red','Green','Yellow','Purple','Gold','Black'];

// event window from .env EVENT_START (we'll compute slots relative to that or configure)
const EVENT_START = new Date(process.env.EVENT_START);
const EVENT_HOURS = 72; // example
const SLOT_HOURS = 2;

function generateCode() {
  const prefix = `REG-${new Date().getFullYear()}`;
  return `${prefix}-${nanoid(6).toUpperCase()}`;
}

// round-robin / least used rope color
async function assignRopeColor() {
  // count per color and return least used
  const counts = await Registration.aggregate([
    { $group: { _id: "$ropeColor", count: { $sum: 1 } } }
  ]);
  const map = {};
  counts.forEach(c => map[c._id] = c.count);
  let minCount = Infinity;
  let chosen = ROPE_COLORS[0];
  ROPE_COLORS.forEach(color => {
    const cnt = map[color] || 0;
    if (cnt < minCount) {
      minCount = cnt;
      chosen = color;
    }
  });
  return chosen;
}

// build prayer slots across event window (2-hour slots) and pick least filled
function buildPrayerSlots() {
  const slots = [];
  for (let h = 0; h < EVENT_HOURS; h += SLOT_HOURS) {
    const start = new Date(EVENT_START.getTime() + h * 60*60*1000);
    const end = new Date(start.getTime() + SLOT_HOURS * 60*60*1000);
    slots.push({ id: `${start.toISOString()}`, start, end, label: `${start.toISOString()}` });
  }
  return slots;
}

// pick slot with lowest registrations
async function assignPrayerSlot() {
  const slots = buildPrayerSlots();
  // count per slot by prayerSlotId
  const counts = await Registration.aggregate([
    { $match: { prayerSlotId: { $exists: true } } },
    { $group: { _id: "$prayerSlotId", count: { $sum: 1 } } }
  ]);
  const map = {};
  counts.forEach(c => map[c._id] = c.count);
  let min = Infinity, chosen = slots[0];
  slots.forEach(s => {
    const cnt = map[s.id] || 0;
    if (cnt < min) {
      min = cnt;
      chosen = s;
    }
  });
  return chosen; // {id, start, end}
}

// find coordinator by city -> state -> default
async function findCoordinator(city, state) {
  if (!state) return null;
  // try exact city match
  let coord = await Coordinator.findOne({ cities: city });
  if (coord) return coord;
  // match by state in states array (case-insensitive)
  coord = await Coordinator.findOne({ states: { $in: [state] } });
  if (coord) return coord;
  // fallback default coordinator (first)
  return await Coordinator.findOne() || null;
}

module.exports = {
  generateCode,
  assignRopeColor,
  assignPrayerSlot,
  findCoordinator,
  buildPrayerSlots
};
