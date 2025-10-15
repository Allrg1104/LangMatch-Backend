import express from 'express';
import {loginUser, createUser, getUsuario, generateChatResponse,getConversationHistory, logoutUser,startPractice, getPracticeSummary} from "../controllers/chatController.js";
import { getPracticesByUser } from "../controllers/chatController.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/usuarios', createUser);
router.get('/usuarios', getUsuario);
router.post('/logout', logoutUser);
router.post('/', generateChatResponse);
router.get('/history/:userId', getConversationHistory);
router.post("/practice/start", startPractice);
router.get("/practice/:userId", getPracticesByUser);
router.get("/practice/summary/:sessionId", getPracticeSummary);

export { router };
