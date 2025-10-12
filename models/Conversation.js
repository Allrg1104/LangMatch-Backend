import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
