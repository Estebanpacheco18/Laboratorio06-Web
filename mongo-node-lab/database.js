require("dotenv").config();
const { MongoClient, Admin } = require("mongodb");
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB");
    return client.db();
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
  }
}

// Conectar con Mongoose
async function connectMongoose() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Conectado a MongoDB con Mongoose");
    return mongoose.connection;
  } catch (error) {
    console.error("Error al conectar con Mongoose:", error);
    throw error;
  }
}

// Cargar todos los modelos
const Producto = require('./models/producto');
const User = require('./models/user');
const Categoria = require('./models/categoria');
const Proveedor = require('./models/proveedor');
const Pedido = require('./models/pedido');
const Inventario = require('./models/inventario');
const Administrador = require('./models/administrador');

module.exports = { 
  connectDB, 
  connectMongoose,
  client,
  models: {
    Producto,
    User,
    Categoria,
    Proveedor,
    Pedido,
    Inventario,
    Administrador
  }
};
