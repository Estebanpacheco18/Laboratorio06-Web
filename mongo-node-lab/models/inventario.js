const mongoose = require("mongoose");
const Producto = require("./producto.js");
const Proveedor = require("./proveedor.js");

const InventarioSchema = new mongoose.Schema({
    productoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Producto", 
        required: true 
    },
    proveedorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Proveedor", 
        required: true 
    },
    cantidad: { type: Number, required: true },
    fecha: { type: Date, required: true },
    precio: { type: Number, required: true },
    total: { type: Number, required: true },
})
const Inventario = mongoose.model("Inventario", InventarioSchema);

module.exports = Inventario;