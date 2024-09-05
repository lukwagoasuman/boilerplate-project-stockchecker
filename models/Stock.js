const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true, unique: true },
  likes: { type: [String], default: [] } // Store hashed IPs
});

module.exports = mongoose.model('Stock', stockSchema);