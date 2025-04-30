const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Conectado a MongoDB con Mongoose"))
  .catch(error => console.error("Error al conectar con Mongoose:", error));

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
});

const Producto = mongoose.model("Producto", ProductoSchema);

module.exports = Producto;