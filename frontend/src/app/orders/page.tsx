'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type Pedido = {
  _id: string;
  estado: string;
  fecha: string;
  total: number;
  productos: {
    productoId: { nombre: string };
    cantidad: number;
    precioUnitario: number;
  }[];
  userId?: { nombre: string; email: string };
};

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [rol, setRol] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    const storedRol = localStorage.getItem('rol');
    const storedToken = localStorage.getItem('token');
    setRol(storedRol);
    setToken(storedToken);

    if (!storedToken) {
      router.push('/login');
      return;
    }

    const endpoint =
      storedRol === 'admin'
        ? `${apiUrl}/api/admin/orders`
        : `${apiUrl}/api/myorders`;

    axios
      .get(endpoint, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then((res) => setPedidos(res.data))
      .catch(() => setPedidos([]));
  }, [apiUrl, router]);

  const handleEstado = async (id: string, estado: string) => {
    if (!token) return;
    await axios.put(
      `${apiUrl}/api/myorders/${id}`,
      { estado },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPedidos((prev) =>
      prev.map((p) => (p._id === id ? { ...p, estado } : p))
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#DCD7C9] via-[#C5BFA5] to-[#8B8A5C] p-8 text-[#2E2F1B]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-10 text-[#4C4C3A]">
          📦 Historial de Pedidos
        </h1>

        {pedidos.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-lg text-gray-700"
          >
            No hay pedidos para mostrar.
          </motion.p>
        ) : (
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ staggerChildren: 0.1 }}
          >
            {pedidos.map((pedido) => (
              <motion.div
                key={pedido._id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="text-sm md:text-base">
                    <p>
                      <span className="font-semibold">🧾 Pedido:</span>{' '}
                      {pedido._id}
                    </p>
                    <p>
                      <span className="font-semibold">📅 Fecha:</span>{' '}
                      {new Date(pedido.fecha).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">📦 Estado:</span>{' '}
                      <span className="capitalize font-medium text-green-700">
                        {pedido.estado}
                      </span>
                      {rol === 'admin' && pedido.estado !== 'finalizado' && (
                        <button
                          className="ml-3 mt-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-800 text-sm"
                          onClick={() =>
                            handleEstado(pedido._id, 'finalizado')
                          }
                        >
                          Marcar como finalizado
                        </button>
                      )}
                    </p>
                    {rol === 'admin' && pedido.userId && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">👤 Usuario:</span>{' '}
                        {pedido.userId.nombre} ({pedido.userId.email})
                      </p>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 text-lg font-semibold text-[#6B6C4F]">
                    💰 Total: ${pedido.total.toFixed(2)}
                  </div>
                </div>

                <div>
                  <span className="font-semibold">🛒 Productos:</span>
                  <ul className="list-disc list-inside mt-2 text-gray-700">
                    {pedido.productos.map((prod, idx) => (
                      <li key={idx}>
                        {prod.productoId?.nombre} x{prod.cantidad} (${prod.precioUnitario} c/u)
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
