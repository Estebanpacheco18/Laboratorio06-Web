'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown } from "lucide-react";

export default function StoreHomePage() {
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories] = useState(['Electrónica', 'Ropa', 'Hogar', 'Deportes']);
  const [nombre, setNombre] = useState<string | null>(null);

  // Leer nombre de localStorage o de la URL (para Google OAuth)
  useEffect(() => {
    // Si viene de Google OAuth, el nombre puede estar en la URL
    const params = new URLSearchParams(window.location.search);
    const nombreUrl = params.get('nombre');
    if (nombreUrl) {
      setNombre(nombreUrl);
      localStorage.setItem('nombre', nombreUrl);
      // Limpia la URL para que no quede el parámetro
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setNombre(localStorage.getItem('nombre'));
    }
  }, []);

  // Cargar productos
  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch(() => {
        setProducts([]);
        setFilteredProducts([]);
      });
  }, []);

  // Búsqueda en tiempo real
  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        product.nombre.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products])

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    setNombre(null);
    window.location.href = '/'; // Redirigir a la página de inicio
  };

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#4C4C3A] font-sans">
      {/* NAVBAR */}
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white shadow-md gap-4 md:gap-0 relative">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">🛍️ StockNSELL</h1>
          <span className="ml-4 text-lg">
            {nombre ? `Hola, ${nombre}!` : "Hola invitado!"}
          </span>
        </div>
        {/* BARRA DE BÚSQUEDA */}
        <div className="flex items-center bg-[#F0EBE0] px-3 py-1 rounded-xl w-full md:w-1/3">
          <Search className="text-[#6B6C4F] mr-2" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
          <button className="text-sm text-[#6B6C4F] font-semibold ml-2 hover:underline">
            Buscar
          </button>
        </div>
        {/* LINKS */}
        <ul className="hidden md:flex gap-6 font-medium relative">
          <li><a href="#" className="hover:text-[#6B6C4F]">Inicio</a></li>
          <li><a href="#" className="hover:text-[#6B6C4F]">Favoritos</a></li>
          {/* CATEGORÍAS CON DROPDOWN */}
          <li className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="hover:text-[#6B6C4F] flex items-center gap-1"
            >
              Categorías <ChevronDown size={16} />
            </button>
            {showCategories && (
              <ul className="absolute top-8 left-0 bg-white border rounded shadow-md w-40 z-50">
                {categories.map((cat, i) => (
                  <li
                    key={i}
                    className="px-4 py-2 hover:bg-[#F5F0E6] cursor-pointer text-sm"
                    onClick={() => {
                      alert(`Categoría seleccionada: ${cat}`);
                      setShowCategories(false);
                    }}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li><a href="/account" className="hover:text-[#6B6C4F]">Mi Cuenta</a></li>
        </ul>
        {nombre ? (
          <button
            onClick={handleLogout}
            className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition"
          >
            Cerrar sesión
          </button>
        ) : (
          <a
            href="/login"
            className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition"
          >
            Iniciar sesión
          </a>
        )}
      </nav>

      {/* PRODUCTOS */}
      <section className="py-12 px-6">
        <h3 className="text-2xl font-semibold mb-6">Productos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No hay productos para mostrar.</p>
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition">
                <div className="h-40 bg-gray-200 rounded mb-3" />
                <h4 className="text-lg font-semibold">{product.nombre}</h4>
                <p className="text-sm text-[#6B6C4F]">{product.descripcion}</p>
                <p className="mt-2 font-bold text-[#4C4C3A]">${product.precio}</p>
                <button className="mt-3 bg-[#6B6C4F] text-white w-full py-2 rounded hover:bg-[#4C4C3A] transition">
                  Ver más
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}