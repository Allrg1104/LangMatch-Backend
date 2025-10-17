import express from "express";

// 🧩 Controladores del Chat General (usuarios, login, respuestas)
import {
  loginUser,
  createUser,
  getUsuario,
  generateChatResponse,
  logoutUser,
  getConversationHistory,
} from "../controllers/chatController.js";

// 🧩 Controladores de Prácticas (iniciar, guardar, finalizar, eliminar)
import {
  startPractice,
  saveMessage,
  endPractice,
  getPracticeSummary,
  getPracticesByUser,
  deletePractice,
} from "../controllers/practiceController.js";

const router = express.Router();

/* ---------------------- RUTAS DE USUARIOS Y LOGIN ---------------------- */
router.post("/login", loginUser);
router.post("/usuarios", createUser);
router.get("/usuarios", getUsuario);
router.post("/logout", logoutUser);

/* ---------------------- CHAT GENERAL ---------------------- */
router.post("/chatbot", generateChatResponse);
router.get("/history/:userId", getConversationHistory);

/* ---------------------- PRÁCTICAS (idioma y nivel) ---------------------- */
router.post("/practice/start", startPractice);        // Iniciar práctica (GPT responde)
router.post("/practice/message", saveMessage);        // Guardar mensaje manualmente
router.post("/practice/end", endPractice);            // Finalizar práctica y guardar endTime
router.get("/practice/summary/:sessionId", getPracticeSummary); // Obtener resumen
router.get("/practice/:userId", getPracticesByUser);  // Historial por usuario
router.delete("/practice/:id", deletePractice);       // Eliminar práctica

export default router;