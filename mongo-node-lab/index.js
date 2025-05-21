const { connectMongoose, models } = require("./database");
const bycrypt = require("bcryptjs");

async function main() {
  try {
    await connectMongoose();

    const { Categoria, Proveedor, Producto, User, Pedido, Inventario, Administrador } = models;
    
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('admin123', 10);
const admin = await Administrador.create({
  nombre: 'Admin Pacheco',
  email: 'adminesteban@gmail.com',
  password: hashedPassword
});

    console.log("✅ Datos insertados correctamente");
    //console.log("✅ Datos observados correctamente");
    //console.log("✅ Se elimino correctamente");
  } catch (error) {
    console.error("❌ Error al insertar datos:", error);
    //console.error("❌ Error al leer datos:", error);
    //console.error("❌ Error en la eliminacion:", error);
  }
}

main();