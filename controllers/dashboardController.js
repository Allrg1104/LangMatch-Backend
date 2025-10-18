import Usuarios from "../models/Usuarios.js";
import Conversation from "../models/Conversation.js";
import PracticeSession from "../models/PracticeSession.js";
import mongoose from "mongoose";

// ------------------------------------------------------
// 🔹 Obtener estadísticas generales del dashboard
// ------------------------------------------------------
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsuarios = await Usuarios.countDocuments();
        const totalConversaciones = await Conversation.countDocuments();
        const totalPracticas = await PracticeSession.countDocuments();

        const practicasPorIdioma = await PracticeSession.aggregate([
            { $group: { _id: "$idioma", total: { $sum: 1 } } },
        ]);

        const ultimasPracticas = await PracticeSession.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("idioma nivel startTime endTime userId");

        res.json({
            success: true,
            data: {
                totalUsuarios,
                totalConversaciones,
                totalPracticas,
                practicasPorIdioma,
                ultimasPracticas,
            },
        });
    } catch (error) {
        console.error("❌ Error al obtener estadísticas:", error);
        res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
    }
};

// ------------------------------------------------------
// 🔹 Obtener usuarios activos (últimos 7 días)
// ------------------------------------------------------
export const getUsuariosActivos = async (req, res) => {
    try {
        const hace7dias = new Date();
        hace7dias.setDate(hace7dias.getDate() - 7);

        const usuariosActivos = await PracticeSession.aggregate([
            { $match: { createdAt: { $gte: hace7dias } } },
            { $group: { _id: "$userId", total: { $sum: 1 } } },
            { $count: "activos" },
        ]);

        res.json({
            success: true,
            data: { usuariosActivos: usuariosActivos[0]?.activos || 0 },
        });
    } catch (error) {
        console.error("❌ Error al obtener usuarios activos:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios activos" });
    }
};

// ------------------------------------------------------
// 🔹 Idiomas más practicados
// ------------------------------------------------------
export const getTopIdiomas = async (req, res) => {
    try {
        const idiomas = await PracticeSession.aggregate([
            { $group: { _id: "$idioma", total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 5 },
        ]);

        res.json({ success: true, data: idiomas });
    } catch (error) {
        console.error("❌ Error al obtener top de idiomas:", error);
        res.status(500).json({ success: false, message: "Error al obtener top de idiomas" });
    }
};

// ------------------------------------------------------
// 🔹 Prácticas por día (últimos 7 días)
// ------------------------------------------------------
export const getPracticasPorDia = async (req, res) => {
    try {
        const hace7dias = new Date();
        hace7dias.setDate(hace7dias.getDate() - 7);

        const practicas = await PracticeSession.aggregate([
            { $match: { createdAt: { $gte: hace7dias } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ success: true, data: practicas });
    } catch (error) {
        console.error("❌ Error al obtener prácticas por día:", error);
        res.status(500).json({ success: false, message: "Error al obtener prácticas por día" });
    }
};

// ------------------------------------------------------
// 🔹 Promedio de duración de prácticas
// ------------------------------------------------------
export const getPromedioDuracionPractica = async (req, res) => {
    try {
        const practicas = await PracticeSession.aggregate([
            {
                $project: {
                    duracion: {
                        $divide: [{ $subtract: ["$endTime", "$startTime"] }, 60000], // minutos
                    },
                },
            },
            { $group: { _id: null, promedio: { $avg: "$duracion" } } },
        ]);

        res.json({
            success: true,
            data: { promedioMinutos: practicas[0]?.promedio?.toFixed(1) || 0 },
        });
    } catch (error) {
        console.error("❌ Error al obtener promedio de duración:", error);
        res.status(500).json({ success: false, message: "Error al obtener promedio de duración" });
    }
};
