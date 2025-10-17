// models/PracticeSession.js
import mongoose from "mongoose";

const PracticeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  idioma: { type: String, required: true },
  nivel: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  messages: [
    {
      sender: String,
      text: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true }); // 🔥 esto añade createdAt y updatedAt

const PracticeSession = mongoose.model("PracticeSession", PracticeSessionSchema);
export default PracticeSession;

