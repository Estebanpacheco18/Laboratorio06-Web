const { connectDB } = require("./database");

async function main() {
  const db = await connectDB();
  if (db) {
    console.log("🎯 Base de datos lista para usar.");
  }
}

async function insertProducto() {
  const db = await connectDB();
  const productos = db.collection("productos");

  const nuevoProducto = { nombre: "Laptop", precio: 1200, stock: 10 };
  const resultado = await productos.insertOne(nuevoProducto);

  console.log("Producto insertado con ID:", resultado.insertedId);
}

async function leerProductos() {
    const db = await connectDB();
    const productos = db.collection("productos");
  
    const lista = await productos.find().toArray();
    console.log("Lista de productos:", lista);
  }
  
async function actualizarProducto() {
    const db = await connectDB();
    const productos = db.collection("productos");
  
    const resultado = await productos.updateOne(
      { nombre: "Laptop" },
      { $set: { precio: 1100 } }
    );
  
    console.log("Documentos actualizados:", resultado.modifiedCount);
  }
  
async function eliminarProducto() {
    const db = await connectDB();
    const productos = db.collection("productos");
  
    const resultado = await productos.deleteOne({ nombre: "Laptop" });
  
    console.log("Producto eliminado:", resultado.deletedCount);
  }

async function consultarClientes() {
    const db = await connectDB();
    const clientes = db.collection("clientes");
  
    // Consulta: clientes mayores de 30 años con nombre y correo
    const resultado = await clientes
      .find({ edad: { $gt: 30 } }, { projection: { nombre: 1, correo: 1, _id: 0 } })
      .toArray();
  
    console.log("Clientes mayores de 30 años:", resultado);
  }  

async function insertarClientesPrueba() {
    const db = await connectDB();
    const clientes = db.collection("clientes");
  
    const datosPrueba = [
      { nombre: "Jose", correo: "jose@example.com", edad: 35, ciudad: "Bogotá" },
      { nombre: "Estrella", correo: "estrella@example.com", edad: 28, ciudad: "Bogotá" },
      { nombre: "Ernesto", correo: "ernesto@example.com", edad: 40, cuidad: "Medellín" },
    ];
  
    const resultado = await clientes.insertMany(datosPrueba);
    console.log("Clientes de prueba insertados:", resultado.insertedCount);
  }

  // updateOne
async function actualizarCiudadCliente() {
    const db = await connectDB();
    const clientes = db.collection("clientes");
  
    const resultado = await clientes.updateOne(
      { nombre: "Estrella" }, // Filtro: cliente "Jose"
      { $set: { ciudad: "Paris" } } // Actualización: cambiar a "Medellín"
    );
  
    console.log("Cliente actualizado:", resultado.modifiedCount);
  }

  // updateMany
async function actualizarCiudadClientesBogota() {
    const db = await connectDB();
    const clientes = db.collection("clientes");
  
    const resultado = await clientes.updateMany(
      { ciudad: "Bogotá" }, // Filtro: clientes de "Bogotá"
      { $set: { ciudad: "Cali" } } // Actualización: cambiar por "Cali"
    );
  
    console.log("Clientes actualizados:", resultado.modifiedCount);
  }

async function eliminarClientePorNombre(nombre) {
    const db = await connectDB();
    const clientes = db.collection("clientes");
  
    const resultado = await clientes.deleteOne({ nombre }); // Filtro: cliente con el nombre especificado
    console.log(`Cliente eliminado (${nombre}):`, resultado.deletedCount);
  }

async function eliminarClientesPorCiudad(ciudad) {
    const db = await connectDB();
    const clientes = db.collection("clientes");
  
    const resultado = await clientes.deleteMany({ ciudad }); // Filtro: clientes de la ciudad especificada
    console.log(`Clientes eliminados de la ciudad (${ciudad}):`, resultado.deletedCount);
  }

main();
//insertProducto();
//leerProductos();
//actualizarProducto();
//eliminarProducto();
//insertarClientesPrueba();
//actualizarCiudadCliente();
//actualizarCiudadClientesBogota();
//consultarClientes();
//eliminarClientePorNombre("Jose"); // Eliminar cliente por nombre
eliminarClientesPorCiudad("Cali");  // Eliminar clientes por ciudad