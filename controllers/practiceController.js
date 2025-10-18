import PracticeSession from "../models/PracticeSession.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 🔹 Iniciar una nueva práctica
 */
export const startPractice = async (req, res) => {
  try {
    const { userId, idioma, nivel } = req.body;

    if (!userId || !idioma || !nivel) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos: userId, idioma o nivel",
      });
    }

    // Crear una nueva sesión
    const session = new PracticeSession({
      userId,
      idioma,
      nivel,
      messages: [],
      startTime: new Date(),
    });

    await session.save();

    // 🔹 Generar mensaje inicial con OpenAI
    const prompt = `Eres un profesor amigable. Da una bienvenida breve al estudiante en ${idioma}, 
    indicando que esta es una práctica de nivel ${nivel}. 
    Anima al estudiante a comenzar con una frase corta.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente educativo multilenguaje llamado 'Thot'. Sé amable, claro y pedagógico.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const initialResponse = completion.choices[0].message.content;

    // Guardar el mensaje inicial en la sesión
    session.messages.push({
      role: "assistant",
      content: initialResponse,
      timestamp: new Date(),
    });
    await session.save();

    // 🔹 Enviar respuesta al frontend
    res.status(201).json({
      success: true,
      message: "Sesión de práctica iniciada",
      sessionId: session._id,
      initialResponse,
    });
  } catch (error) {
    console.error("❌ Error al iniciar práctica:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al iniciar práctica",
    });
  }
};

/**
 * 🔹 Guardar mensaje durante la práctica
 */
export const saveMessage = async (req, res) => {
  try {
    console.log("📌 Historial que se envía a OpenAI:");
    console.log(JSON.stringify(chatHistory, null, 2));

    const { sessionId, role, content } = req.body;

    if (!sessionId || !role || !content) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos: sessionId, role o content",
      });
    }

    const session = await PracticeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión de práctica no encontrada",
      });
    }

    // Guardar mensaje del usuario en la sesión
    session.messages.push({ role, content, timestamp: new Date() });
    await session.save();

    // 🔥 Reconstruir historial para la IA
    const chatHistory = [
      { role: "system", content: `Eres 'Eloy', un tutor de idiomas. El usuario está practicando ${session.idioma} a nivel ${session.nivel}. Sé amable, claro y corrige errores si es necesario.` },
      ...session.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Llamada a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatHistory,
    });

    const botResponse = completion.choices[0].message.content;

    // Guardar respuesta de la IA en la sesión
    session.messages.push({
      role: "assistant",
      content: botResponse,
      timestamp: new Date(),
    });
    await session.save();

    res.status(200).json({
      success: true,
      userMessage: content,
      botResponse,
      messages: session.messages,
    });
  } catch (error) {
    console.error("❌ Error en saveMessage:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al guardar mensaje",
    });
  }
};

/**
 * 🔹 Finalizar práctica
 */
export const endPractice = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Falta el ID de la sesión",
      });
    }

    const session = await PracticeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada",
      });
    }

    session.endTime = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: "Práctica finalizada correctamente",
    });
  } catch (error) {
    console.error("❌ Error al finalizar práctica:", error);
    res.status(500).json({
      success: false,
      message: "Error al finalizar práctica",
    });
  }
};

/**
 * 🔹 Obtener resumen de la práctica
 */
export const getPracticeSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await PracticeSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión no encontrada",
      });
    }

    const totalMessages = session.messages.length;
    const duration = session.endTime
      ? Math.round((session.endTime - session.startTime) / 60000)
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        idioma: session.idioma,
        nivel: session.nivel,
        totalMessages,
        duration,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen de la práctica",
    });
  }
};

/**
 * 🔹 Eliminar práctica
 */
export const deletePractice = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PracticeSession.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Práctica no encontrada" });
    }

    res.json({ success: true, message: "Práctica eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar práctica:", error);
    res.status(500).json({ success: false, message: "Error al eliminar práctica" });
  }
};

/**
 * 🔹 Obtener todas las prácticas de un usuario
 */
export const getPracticesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Falta el ID del usuario",
      });
    }

    const sessions = await PracticeSession.find({ userId }).sort({
      startTime: -1,
    });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("❌ Error al obtener prácticas por usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener las prácticas",
    });
  }
};

