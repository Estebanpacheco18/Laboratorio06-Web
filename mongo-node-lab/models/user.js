const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;