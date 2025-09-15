require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');


console.log("EVENT_START:", process.env.EVENT_START);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🚀 MongoDB connected successfully!');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🌍 Gfam API running on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('❌ MongoDB Error:', err));
