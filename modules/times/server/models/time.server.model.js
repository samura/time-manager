'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Time Schema
 */
var TimeSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  hours: {
    type: Number,
    required: 'Hours cannot be blank',
    min: [0, 'Worked hours must be 0 or higher.']
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
  
});

mongoose.model('Time', TimeSchema);
