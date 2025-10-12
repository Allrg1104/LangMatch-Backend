import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router as chatRoutes } from './routes/chatRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import transporter from './config/mailConfig.js'; // Importación única del transporter configurado

// Cargar variables de entorno
dotenv.config();

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar configuración de OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  ADVERTENCIA: No se encontró OPENAI_API_KEY');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-gpt-app';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Verificación SMTP (usa el transporter importado)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en SMTP:', error);
  } else {
    console.log('✅ SMTP configurado correctamente');
  }
});

// Rutas
app.use('/api/chat', chatRoutes);

// Ruta de estado
app.get('/', (req, res) => {
  res.json({
    message: 'API SOMMER operativa',
    status: 'OK'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});