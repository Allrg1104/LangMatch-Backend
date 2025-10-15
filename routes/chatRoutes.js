import express from "express";
import {
  loginUser,
  createUser,
  getUsuario,
  generateChatResponse,
  getConversationHistory,
  logoutUser,
  getPracticesByUser,
} from "../controllers/chatController.js";

import {
  startPractice,
  saveMessage,
  endPractice,
  getPracticeSummary,
} from "../controllers/practiceController.js";

const router = express.Router();

// 🔹 Usuarios y autenticación
router.post("/login", loginUser);
router.post("/usuarios", createUser);
router.get("/usuarios", getUsuario);
router.post("/logout", logoutUser);

// 🔹 Chat general
router.post("/", generateChatResponse);
router.get("/history/:userId", getConversationHistory);

// 🔹 Prácticas (idioma y nivel)
router.post("/practice/start", startPractice);
router.post("/practice/message", saveMessage);
router.post("/practice/end", endPractice);
router.get("/practice/summary/:sessionId", getPracticeSummary);
router.get("/practice/:userId", getPracticesByUser);

export { router };
