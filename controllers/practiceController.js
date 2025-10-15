import PracticeSession from "../models/PracticeSession.js";

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

    res.status(201).json({
      success: true,
      message: "Sesión de práctica iniciada",
      sessionId: session._id,
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

    session.messages.push({
      role,
      content,
      timestamp: new Date(),
    });

    await session.save();

    res.status(200).json({ success: true, message: "Mensaje guardado" });
  } catch (error) {
    console.error("❌ Error al guardar mensaje:", error);
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
