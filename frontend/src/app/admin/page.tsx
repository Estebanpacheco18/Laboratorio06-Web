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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
      router.push('/');
      return;
    }
    axios.get(`${apiUrl}/api/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, [router, apiUrl]);

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

  const handleEdit = (p: Producto) => {
    setEditId(p._id);
    setEditNombre(p.nombre);
    setEditPrecio(p.precio.toString());
    setEditDescripcion(p.descripcion);
    setEditStock(p.stock.toString());
    setEditImagenUrl("");
    setEditImagenFile(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const productoOriginal = products.find((prod) => prod._id === editId);
    try {
      await axios.put(`${apiUrl}/api/admin/products/${editId}`, {
        nombre: editNombre,
        precio: editPrecio,
        descripcion: editDescripcion,
        stock: editStock,
        imagen: editImagenUrl || productoOriginal?.imagen
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    router.push('/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#DCD7C9] via-[#C5BFA5] to-[#8B8A5C] text-[#2E2F1B] font-sans p-4">
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white/90 backdrop-blur shadow-md rounded-xl mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">🛍️ StockNSELL</h1>
          <span className="ml-4 text-lg">Panel de administración</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleGoHome} className="bg-[#F0EBE0] text-[#4C4C3A] px-4 py-2 rounded-xl hover:bg-[#e0dbc7] transition border">Ir a la tienda</button>
          <button onClick={handleLogout} className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition">Cerrar sesión</button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto bg-white/90 p-8 rounded-3xl shadow-2xl ring-1 ring-gray-200 animate-fade-in overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Productos</h1>

        <form onSubmit={handleCreate} className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className="border p-2 rounded-xl" required />
          <input value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Precio" type="number" className="border p-2 rounded-xl" required />
          <input value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" type="number" className="border p-2 rounded-xl" required />
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" className="border p-2 rounded-xl col-span-2" />
          <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 rounded-xl" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-800 transition col-span-1 md:col-span-2">Crear</button>
        </form>

        {msg && <div className="mb-4 text-red-600 font-semibold text-center">{msg}</div>}

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-[#EFEDE8]">
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
                <tr key={p._id} className="text-center">
                  <td className="border px-2 py-2 w-24">
                    {editId === p._id ? (
                      <>
                        <input type="file" accept="image/*" onChange={handleEditImageChange} className="border p-1 rounded" />
                        {(editImagenUrl || p.imagen) && (
                          <img src={editImagenUrl || p.imagen} alt={p.nombre} className="h-16 w-16 object-cover rounded mt-1 mx-auto" />
                        )}
                      </>
                    ) : (
                      p.imagen && (
                        <img src={p.imagen} alt={p.nombre} className="h-16 w-16 object-cover mx-auto" />
                      )
                    )}
                  </td>
                  <td className="border px-2 py-2">
                    {editId === p._id ? (
                      <input value={editNombre} onChange={e => setEditNombre(e.target.value)} className="border p-1 rounded w-full" />
                    ) : (
                      p.nombre
                    )}
                  </td>
                  <td className="border px-2 py-2">
                    {editId === p._id ? (
                      <input value={editPrecio} onChange={e => setEditPrecio(e.target.value)} className="border p-1 rounded w-full" type="number" />
                    ) : (
                      p.precio
                    )}
                  </td>
                  <td className="border px-2 py-2">
                    {editId === p._id ? (
                      <input value={editStock} onChange={e => setEditStock(e.target.value)} className="border p-1 rounded w-full" type="number" />
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="border px-2 py-2 max-w-xs overflow-hidden text-ellipsis">
                    {editId === p._id ? (
                      <input value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} className="border p-1 rounded w-full" />
                    ) : (
                      p.descripcion
                    )}
                  </td>
                  <td className="border px-2 py-2">
                    <div className="flex flex-wrap justify-center gap-2">
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
