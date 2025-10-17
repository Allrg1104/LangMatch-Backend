import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false, // ✅ Ahora no se cae si el frontend no envía userId
    default: "anonimo",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;