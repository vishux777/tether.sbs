const mongoose = require('mongoose');

const safetySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['ALERT', 'CHECKIN', 'LOCATION'], required: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
    },
    message: { type: String },
  },
  { timestamps: true }
);

const Safety = mongoose.models.Safety || mongoose.model('Safety', safetySchema);

module.exports = Safety;


