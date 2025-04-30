const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  descripcion: { type: String },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Categoria'
  },
  proveedorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Proveedor'
  },
  fechaCreacion: { type: Date, default: Date.now }
});

const Producto = mongoose.model('Producto', ProductoSchema);
module.exports = Producto;