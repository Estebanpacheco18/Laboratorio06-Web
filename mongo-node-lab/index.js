const { connectMongoose, models } = require("./database");

async function main() {
  try {
    await connectMongoose();

    const { Categoria, Proveedor, Producto, User, Pedido, Inventario } = models;
    
    // Insertar una categoría
    const categoria = await Categoria.create({
      nombre: 'Ropa',
      descripcion: 'Prendas de vestir para toda la familia'
    });

    // Insertar un proveedor
    const proveedor = await Proveedor.create({
      nombre: 'Textil Plus',
      email: 'textilplus@gmail.com',
      telefono: '987654321',
      direccion: 'Calle Moda 456'
    });

    // Insertar un producto
    const producto = await Producto.create({
      nombre: 'Camiseta',
      precio: 45,
      stock: 5,
      descripcion: 'Camiseta de algodón premium',
      categoriaId: categoria._id,
      proveedorId: proveedor._id
    });

    // Insertar un usuario
    const user = await User.create({
      nombre: 'María López',
      email: 'marialopez@gmail.com',
      password: 'miPassword'
    });

    // Insertar un pedido
    const pedido = await Pedido.create({
      userId: user._id,
      total: producto.precio * 2,
      productos: [
        {
          productoId: producto._id,
          cantidad: 2,
          precioUnitario: producto.precio
        }
      ]
    });

    // Insertar registro en inventario
    await Inventario.create({
      productoId: producto._id,
      proveedorId: proveedor._id,
      cantidad: 10,
      fecha: new Date(),
      precio: 1400,
      total: 14000
    });

    /*
    // Leer y mostrar los datos
    console.log("📦 Categorías:");
    console.log(await Categoria.find().lean());

    console.log("\n🏢 Proveedores:");
    console.log(await Proveedor.find().lean());

    console.log("\n💻 Productos:");
    console.log(await Producto.find().populate('categoriaId').populate('proveedorId').lean());

    console.log("\n👤 Usuarios:");
    console.log(await User.find().lean());

    console.log("\n🧾 Pedidos:");
    console.log(await Pedido.find().populate('userId').populate('productos.productoId').lean());

    console.log("\n📊 Inventario:");
    console.log(await Inventario.find().populate('productoId').populate('proveedorId').lean());
    */


    /*
    //Eliminaciones
    await Categoria.deleteOne({ nombre: 'Electrónica' });
    await Producto.deleteMany({ stock: { $lte: 0 } });
    await Pedido.findOneAndDelete({ estado: 'cancelado' });
    */

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