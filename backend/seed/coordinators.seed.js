require('dotenv').config();
const mongoose = require('mongoose');
const Coordinator = require('../models/coordinator');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Coordinator.deleteMany({});
  const docs = [
    { name: 'Pastor Ayo', phone: '08011111111', email: 'ayo@church.org', zone: 'West', states: ['Lagos'], cities: ['Lagos'] },
    { name: 'Pastor Ngozi', phone: '08022222222', email: 'ngozi@church.org', zone: 'North', states: ['Abuja','FCT'], cities: ['Abuja'] },
    { name: 'Default Coord', phone: '08033333333', email: 'info@church.org', zone: 'General', states: [] }
  ];
  await Coordinator.insertMany(docs);
  console.log('Coordinators seeded');
  process.exit(0);
}

seed().catch(e => {
  console.error(e); process.exit(1);
});
