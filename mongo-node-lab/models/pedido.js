const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  fecha: { type: Date, default: Date.now },
  estado: { 
    type: String, 
    enum: ['pendiente', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  total: { type: Number, required: true },
  productos: [
    {
      productoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Producto',
        required: true
      },
      cantidad: { type: Number, required: true },
      precioUnitario: { type: Number, required: true }
    }
  ]
});

const Pedido = mongoose.model('Pedido', PedidoSchema);
module.exports = Pedido;