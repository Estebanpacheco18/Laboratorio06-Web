const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    rol: { type: String, enum: ['user', 'admin'], default: 'user' },
    google: { type: Boolean, default: false } // <-- nuevo campo para Google
});

const User = mongoose.model("User", UserSchema);

module.exports = User;