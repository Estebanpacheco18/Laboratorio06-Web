const mongoose = require("mongoose");

const AdministradorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Administrador = mongoose.model("Administrador", AdministradorSchema);

module.exports = Administrador;