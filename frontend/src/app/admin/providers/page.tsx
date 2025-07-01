'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Proveedor = {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
};

export default function AdminProvidersPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [msg, setMsg] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
      router.push('/');
      return;
    }
    axios.get(`${apiUrl}/api/providers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProveedores(res.data))
      .catch(() => setProveedores([]));
  }, [router, apiUrl]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#DCD7C9] via-[#C5BFA5] to-[#8B8A5C] text-[#2E2F1B] font-sans p-4">
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white/90 backdrop-blur shadow-md rounded-xl mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">🛍️ StockNSELL</h1>
          <span className="ml-4 text-lg">Proveedores</span>
        </div>
        <button onClick={() => router.push('/admin')} className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition">Volver al panel</button>
      </nav>
      <section className="max-w-4xl mx-auto bg-white/90 p-8 rounded-3xl shadow-2xl ring-1 ring-gray-200 animate-fade-in overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Lista de Proveedores</h1>
        {msg && <div className="mb-4 text-red-600 font-semibold text-center">{msg}</div>}
        <table className="w-full border text-sm">
          <thead className="bg-[#EFEDE8]">
            <tr>
              <th className="border px-2 py-2">Nombre</th>
              <th className="border px-2 py-2">Email</th>
              <th className="border px-2 py-2">Teléfono</th>
              <th className="border px-2 py-2">Dirección</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p._id} className="text-center">
                <td className="border px-2 py-2">{p.nombre}</td>
                <td className="border px-2 py-2">{p.email}</td>
                <td className="border px-2 py-2">{p.telefono}</td>
                <td className="border px-2 py-2">{p.direccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}