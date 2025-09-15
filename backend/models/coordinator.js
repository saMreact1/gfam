const mongoose = require('mongoose');

const CoordinatorSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  zone: String,
  states: [String], // e.g. ["Lagos", "Oyo"]
  cities: [String]  // optional specific city assignments
});

module.exports = mongoose.model('Coordinator', CoordinatorSchema);
