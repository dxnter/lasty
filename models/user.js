import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  lastFM: String,
  userID: String,
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
