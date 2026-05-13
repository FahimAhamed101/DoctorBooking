const mongoose = require('mongoose');
const { toJSON, paginate } = require("./plugins");

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  type: {
    type: String,
    enum: ['one-time', 'recurring'],
    default: 'one-time'
  },
  date: {
    type: Date,
    required: function () {
      return this.type === 'one-time';
    }
  },
  dayOfWeek: {
    type: String,
    enum: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday'
    ],
    required: function () {
      return this.type === 'recurring';
    }
  },
  startTime: {
    type: String, // 'HH:mm' in 24-hour format (e.g. '15:00')
    required: true
  },
  endTime: {
    type: String, // 'HH:mm' in 24-hour format (e.g. '20:30')
    required: true
  },
  timezone: {
    type: String, // e.g. 'Asia/Dhaka', 'America/New_York'
    required: true
  },
  repeatRule: {
    type: String, // e.g. 'weekly', 'daily', 'biweekly'
    required: function () {
      return this.type === 'recurring';
    }
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

scheduleSchema.plugin(toJSON);
scheduleSchema.plugin(paginate);

module.exports = mongoose.model('Schedule', scheduleSchema);
