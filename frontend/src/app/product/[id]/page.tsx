'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

export default function ProductPage() {
  const [product, setProduct] = useState<any>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const params = useParams();

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

useEffect(() => {
  const productId = params.id;
  if (productId) {
    axios.get(`${apiUrl}/api/products/${productId}`)
      .then(res => setProduct(res.data))
      .catch(error => console.error('Error al cargar el producto:', error));
  }
  setNombre(localStorage.getItem('nombre'));
}, [params.id]);

  // Maneja el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    setNombre(null);
    window.location.href = '/'; // Redirige a la página principal
  };

  // Maneja la adición de un producto al carrito
  const handleAddToCart = () => {
    if (!product) return; // Asegúrate de que el producto esté cargado

    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    // Busca si el producto ya existe en el carrito
    const existingItemIndex = currentCart.findIndex((item: any) => item.productId === product._id);

    if (existingItemIndex >= 0) {
      // Si el producto ya existe, incrementa su cantidad
      currentCart[existingItemIndex].cantidad += 1;
    } else {
      // Si el producto no existe, agrégalo con cantidad 1
      currentCart.push({
        productId: product._id, // Guarda el ID del producto
        cantidad: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    // Aquí podrías mostrar un mensaje de éxito más amigable al usuario,
    // por ejemplo, un toast o una notificación. Se ha eliminado el alert().
  };

  // Muestra un mensaje de carga si el producto aún no se ha cargado
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-[#F5F0E6] text-[#4C4C3A]">Cargando...</div>;

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#4C4C3A] font-sans">
      {/* NAVBAR */}
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white shadow-md gap-4 md:gap-0 relative rounded-b-xl">
        <div className="flex items-center gap-4">
          <a href="/" className="text-2xl font-bold tracking-tight text-[#4C4C3A]">🛍️ StockNSELL</a>
          <span className="ml-4 text-lg text-[#6B6C4F]">
            {nombre ? `Hola, ${nombre}!` : "Hola invitado!"}
          </span>
        </div>
        {/* BARRA DE BÚSQUEDA */}
        <div className="flex items-center bg-[#F0EBE0] px-3 py-1 rounded-xl w-full md:w-1/3 shadow-inner">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm placeholder-gray-500"
          />
        </div>

        {nombre ? (
          <button
            onClick={handleLogout}
            className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition shadow-md"
          >
            Cerrar sesión
          </button>
        ) : (
          <a
            href="/login"
            className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition shadow-md"
          >
            Iniciar sesión
          </a>
        )}
      </nav>

      {/* CONTENIDO DEL PRODUCTO */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold mb-4 text-[#4C4C3A]">{product.nombre}</h1>
          <p className="text-gray-600 mb-4 text-lg">{product.descripcion}</p>
          <p className="text-3xl font-bold text-[#6B6C4F] mb-6">${product.precio.toFixed(2)}</p>
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#6B6C4F] text-white py-4 rounded-xl hover:bg-[#4C4C3A] transition font-bold text-lg shadow-xl"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </main>
  );
}
