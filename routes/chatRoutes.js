import express from 'express';
import {loginUser,createUser,generateChatResponse,getUsuario,getConversationHistory,logoutUser} from '../controllers/chatController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/usuarios', createUser);
router.get('/usuarios', getUsuario);
router.post('/logout', logoutUser);
router.post('/', generateChatResponse);
router.get('/history/:userId', getConversationHistory);

export { router };
