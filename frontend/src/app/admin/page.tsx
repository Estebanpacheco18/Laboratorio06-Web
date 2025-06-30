'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Define el tipo de producto
type Producto = {
  _id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagen?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState('');
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editStock, setEditStock] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenUrl, setImagenUrl] = useState<string>("");
  const [editImagenFile, setEditImagenFile] = useState<File | null>(null);
  const [editImagenUrl, setEditImagenUrl] = useState<string>("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();

  // Cargar productos
  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
      router.push('/'); // Redirige si no es admin
      return;
    }
    axios.get(`${apiUrl}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [router, apiUrl]);

  // Manejar cambio de imagen al crear
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      const formData = new FormData();
      formData.append('imagen', file);
      try {
        const res = await axios.post(`${apiUrl}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setImagenUrl(res.data.url);
      } catch (err) {
        setMsg('Error al subir la imagen');
      }
    }
  };

  // Manejar cambio de imagen al editar
  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImagenFile(file);
      const formData = new FormData();
      formData.append('imagen', file);
      try {
        const res = await axios.post(`${apiUrl}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditImagenUrl(res.data.url);
      } catch (err) {
        setMsg('Error al subir la imagen');
      }
    }
  };

  // Crear producto
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${apiUrl}/api/admin/products`, {
        nombre, precio, descripcion, stock, imagen: imagenUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Producto creado');
      window.location.reload();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error');
    }
  };

  // Eliminar producto
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${apiUrl}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Producto eliminado');
      window.location.reload();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error');
    }
  };

  // Iniciar edición
  const handleEdit = (p: Producto) => {
    setEditId(p._id);
    setEditNombre(p.nombre);
    setEditPrecio(p.precio.toString());
    setEditDescripcion(p.descripcion);
    setEditStock(p.stock.toString());
    setEditImagenUrl(""); // Limpiar la imagen editada
    setEditImagenFile(null);
  };

  // Guardar edición
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    // Busca el producto original para obtener la imagen anterior si no se cambia
    const productoOriginal = products.find((prod) => prod._id === editId);
    try {
      await axios.put(`${apiUrl}/api/admin/products/${editId}`, {
        nombre: editNombre,
        precio: editPrecio,
        descripcion: editDescripcion,
        stock: editStock,
        imagen: editImagenUrl || productoOriginal?.imagen // Usa la nueva imagen si existe, si no la anterior
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Producto editado');
      setEditId(null);
      window.location.reload();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    router.push('/login');
  };

  // Ir a la tienda principal
  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#4C4C3A] font-sans">
      {/* NAVBAR */}
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white shadow-md gap-4 md:gap-0 relative">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">🛍️ StockNSELL</h1>
          <span className="ml-4 text-lg">Panel de administración</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGoHome}
            className="bg-[#F0EBE0] text-[#4C4C3A] px-4 py-2 rounded-xl hover:bg-[#e0dbc7] transition border"
          >
            Ir a la tienda
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <section className="p-8">
        <h1 className="text-2xl font-bold mb-4">Productos</h1>
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className="border p-2 rounded-xl" required />
          <input value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Precio" type="number" className="border p-2 rounded-xl" required />
          <input value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" type="number" className="border p-2 rounded-xl" required />
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className="border p-2 rounded-xl" />
          <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 rounded-xl" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-800 transition">Crear</button>
        </form>
        {msg && <div className="mb-4 text-red-600">{msg}</div>}
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-2">Imagen</th>
              <th className="border px-2 py-2">Nombre</th>
              <th className="border px-2 py-2">Precio</th>
              <th className="border px-2 py-2">Stock</th>
              <th className="border px-2 py-2">Descripción</th>
              <th className="border px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td className="border px-2 py-2">
                  {editId === p._id ? (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="border p-1 rounded"
                      />
                      {(editImagenUrl || p.imagen) && (
                        <img
                          src={editImagenUrl || p.imagen}
                          alt={p.nombre}
                          className="h-16 w-16 object-cover rounded mt-1"
                        />
                      )}
                    </>
                  ) : (
                    p.imagen && (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="h-full w-full object-contain"
                      />
                    )
                  )}
                </td>
                <td className="border px-2 py-2">
                  {editId === p._id ? (
                    <input value={editNombre} onChange={e => setEditNombre(e.target.value)} className="border p-1 rounded" />
                  ) : (
                    p.nombre
                  )}
                </td>
                <td className="border px-2 py-2">
                  {editId === p._id ? (
                    <input value={editPrecio} onChange={e => setEditPrecio(e.target.value)} className="border p-1 rounded" type="number" />
                  ) : (
                    p.precio
                  )}
                </td>
                <td className="border px-2 py-2">
                  {editId === p._id ? (
                    <input value={editStock} onChange={e => setEditStock(e.target.value)} className="border p-1 rounded" type="number" />
                  ) : (
                    p.stock
                  )}
                </td>
                <td className="border px-2 py-2">
                  {editId === p._id ? (
                    <input value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} className="border p-1 rounded" />
                  ) : (
                    p.descripcion
                  )}
                </td>
                <td className="border px-2 py-2 flex gap-2">
                  {editId === p._id ? (
                    <>
                      <button onClick={handleSaveEdit} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800 transition">Guardar</button>
                      <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-600 transition">Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700 transition">Editar</button>
                      <button onClick={() => handleDelete(p._id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800 transition">Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}