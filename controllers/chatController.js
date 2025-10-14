import OpenAI from "openai";
import Usuarios from "../models/Usuarios.js";
import Conversation from "../models/Conversation.js";
import PracticeSession from "../models/PracticeSession.js";
import transporter from "../config/mailConfig.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/* ------------------------ LOGIN DE USUARIO ------------------------ */
export const loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const validateUser = await Usuarios.findOne({ correo, contrasena });
    if (!validateUser) {
      return res
        .status(400)
        .json({ success: false, message: "El usuario o contraseña no son correctos" });
    }

    console.log("✅ Login exitoso para:", correo);
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        _id: validateUser._id,
        correo: validateUser.correo,
        nombre: validateUser.nombre,
        rol: validateUser.rol,
      },
    });
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

/* ------------------------ CREAR USUARIO ------------------------ */
export const createUser = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res
        .status(400)
        .json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const usuarioExistente = await Usuarios.findOne({ correo });
    if (usuarioExistente) {
      return res
        .status(400)
        .json({ success: false, message: "El correo ya está registrado" });
    }

    const nuevoUsuario = new Usuarios({ nombre, correo, contrasena, rol });
    await nuevoUsuario.save();

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("❌ Error en createUser:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

/* ------------------------ OBTENER USUARIOS ------------------------ */
export const getUsuario = async (req, res) => {
  try {
    const usuarios = await Usuarios.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

/* ------------------------ CONFIGURACIÓN OPENAI ------------------------ */
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY no definida");
  openai = new OpenAI({ apiKey });
  console.log("✅ OpenAI configurado correctamente");
} catch (error) {
  console.error("❌ Error al inicializar OpenAI:", error);
}

/* ------------------------ GENERAR RESPUESTA DEL CHATBOT ------------------------ */
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt) return res.status(400).json({ error: "El prompt es requerido" });

    const conversations = await Conversation.find().sort({ createdAt: -1 }).limit(10);
    const context = conversations.flatMap(conv => [
      { role: "user", content: conv.prompt },
      { role: "assistant", content: conv.response },
    ]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres una asistente de rumbas llamada 'Sommer', de 32 años, alegre, espontánea y con acento caleño. " +
            "Los usuarios te preguntarán qué hacer en Cali los fines de semana. Sugiere tres planes de rumba con amigos, " +
            "responde breve, directa, entusiasta, con informalidad moderada y sin groserías ni consejos médicos.",
        },
        ...context,
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    const newConversation = new Conversation({ prompt, response, userId });
    await newConversation.save();

    res.json({ response });
  } catch (error) {
    console.error("❌ Error al generar respuesta:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

/* ------------------------ HISTORIAL DE CONVERSACIONES ------------------------ */
export const getConversationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId requerido" });

    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const resumen = conversations.map(conv => ({
      prompt: conv.prompt,
      resumen: conv.response.slice(0, 100) + "...",
    }));

    res.json(resumen);
  } catch (error) {
    console.error("❌ Error al obtener historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};

/* ------------------------ INICIAR SESIÓN DE PRÁCTICA ------------------------ */
export const startPractice = async (req, res) => {
  try {
    const { userId, idioma, nivel } = req.body;
    if (!userId || !idioma || !nivel) {
      return res
        .status(400)
        .json({ success: false, message: "Faltan datos: userId, idioma o nivel" });
    }

    const newSession = new PracticeSession({ userId, idioma, nivel });
    await newSession.save();

    res.status(201).json({
      success: true,
      message: "Sesión de práctica iniciada correctamente",
      sessionId: newSession._id,
    });
  } catch (error) {
    console.error("❌ Error en startPractice:", error);
    res.status(500).json({ success: false, message: "Error al iniciar práctica" });
  }
};

/* ------------------------ OBTENER RESUMEN DE PRÁCTICA ------------------------ */
export const getPracticeSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await PracticeSession.findById(sessionId);

    if (!session)
      return res.status(404).json({ success: false, message: "Sesión no encontrada" });

    const totalTime =
      (session.endTime || new Date()).getTime() - session.startTime.getTime();
    const minutes = Math.floor(totalTime / 60000);

    const temas = session.messages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .slice(-3);

    res.json({
      success: true,
      idioma: session.idioma,
      nivel: session.nivel,
      duracion: `${minutes} minutos`,
      totalMensajes: session.messages.length,
      temas,
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen:", error);
    res.status(500).json({ success: false, message: "Error al generar resumen" });
  }
};

/* ------------------------ CERRAR SESIÓN ------------------------ */
export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, message: "Falta userId" });

    console.log(`👋 Usuario ${userId} cerró sesión`);
    const summarySent = await generateAndSendSummary(userId, process.env.PORT);

    res.json({
      success: true,
      message: summarySent
        ? "Sesión cerrada y resumen enviado por correo"
        : "Sesión cerrada (sin envío de resumen)",
    });
  } catch (error) {
    console.error("❌ Error en logoutUser:", error);
    res.status(500).json({ success: false, message: "Error al cerrar sesión" });
  }
};

/* ------------------------ RESUMEN Y ENVÍO DE CORREO ------------------------ */
export const generateAndSendSummary = async (userId, PORT) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const conversations = await Conversation.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const resumen =
      conversations
        .map(conv => `🗨️ ${conv.prompt}\n💬 ${conv.response}`)
        .join("\n\n") || "No hubo conversación registrada hoy.";

    const { data: users } = await axios.get(`http://localhost:${PORT}/api/chat/usuarios`);
    const user = users.find(
      u => u._id === userId || u._id?.toString() === userId || u.correo === userId
    );

    if (user && user.correo) {
      await sendSummaryEmail(user.correo, resumen);
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Error generando o enviando resumen:", error);
    return false;
  }
};

export const sendSummaryEmail = async (to, resumen) => {
  try {
    await transporter.sendMail({
      from: `"Sommer IA" <${process.env.MAIL_USER}>`,
      to,
      subject: "Resumen de tu práctica con Sommer",
      text: resumen,
    });
    console.log(`📧 Resumen enviado a ${to}`);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw error;
  }
};
