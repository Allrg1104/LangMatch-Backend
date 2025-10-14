import mongoose from "mongoose";

const PracticeSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuarios", required: true },
  idioma: { type: String, required: true },
  nivel: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }
  ]
});

export default mongoose.model("PracticeSession", PracticeSessionSchema);
