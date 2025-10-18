import mongoose from 'mongoose';
/*Esquema usuario y admin PRUEBA DE PUSH*/

const usuariosSchema = new mongoose.Schema({
    nombre: String,
    correo: String,
    contrasena: String,
    rol: String
});

const Usuarios = mongoose.model('Usuarios', usuariosSchema);

export default Usuarios;