'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
    const storedRol = localStorage.getItem("rol");
    const storedToken = localStorage.getItem("token");
    setRol(storedRol);
    setToken(storedToken);

    if (!storedToken) {
      router.push("/login");
      return;
    }

    // Admin ve todos los pedidos, usuario solo los suyos
    const endpoint =
      storedRol === "admin"
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
    <main className="min-h-screen bg-[#F5F0E6] text-[#4C4C3A] p-8">
      <h1 className="text-3xl font-bold mb-6">Pedidos</h1>
      {pedidos.length === 0 ? (
        <p>No hay pedidos para mostrar.</p>
      ) : (
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div
              key={pedido._id}
              className="bg-white rounded-xl shadow p-6 border"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                <div>
                  <span className="font-semibold">Pedido:</span> {pedido._id}
                  <br />
                  <span className="font-semibold">Fecha:</span>{" "}
                  {new Date(pedido.fecha).toLocaleString()}
                  <br />
                  <span className="font-semibold">Estado:</span>{" "}
                  <span className="capitalize">{pedido.estado}</span>
                  {rol === "admin" && pedido.estado !== "finalizado" && (
                    <button
                      className="ml-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-800"
                      onClick={() => handleEstado(pedido._id, "finalizado")}
                    >
                      Marcar como finalizado
                    </button>
                  )}
                  {rol === "admin" && pedido.userId && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Usuario:</span>{" "}
                      {pedido.userId.nombre} ({pedido.userId.email})
                    </div>
                  )}
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="font-semibold">Total:</span> ${pedido.total}
                </div>
              </div>
              <div>
                <span className="font-semibold">Productos:</span>
                <ul className="list-disc ml-6">
                  {pedido.productos.map((prod, idx) => (
                    <li key={idx}>
                      {prod.productoId?.nombre} x{prod.cantidad} (${prod.precioUnitario} c/u)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}