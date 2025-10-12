import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transporter.sendMail({
  from: `"Sommer" <${process.env.MAIL_USER}>`,
  to: 'oscar.98.rc@gmail.com',
  subject: 'Prueba SMTP desde Sommer',
  text: 'Hola! Este es un correo de prueba desde tu backend.'
}).then(() => {
  console.log('✅ Correo enviado correctamente');
}).catch(err => {
  console.error('❌ Error al enviar:', err);
});
