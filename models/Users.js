const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  profileType: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfileType' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
