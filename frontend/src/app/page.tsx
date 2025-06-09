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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nombreUrl = params.get('nombre');
    if (nombreUrl) {
      setNombre(nombreUrl);
      localStorage.setItem('nombre', nombreUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setNombre(localStorage.getItem('nombre'));
    }
  }, []);

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

  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        product.nombre.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    setNombre(null);
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F9F6F1] to-[#EAE6DF] text-[#333] font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#2E2F1B]">🛍️ StockNSELL</h1>
          <span className="text-lg text-[#555]">
            {nombre ? `Hola, ${nombre}!` : "Hola invitado!"}
          </span>
        </div>

        <div className="flex items-center bg-[#EFEDE8] px-3 py-1 rounded-full w-full md:w-1/3">
          <Search className="text-[#6B6C4F] mr-2" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <ul className="hidden md:flex gap-6 font-medium">
            <li><a href="#" className="hover:text-[#6B6C4F] transition">Inicio</a></li>
            <li><a href="#" className="hover:text-[#6B6C4F] transition">Favoritos</a></li>
            <li className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="hover:text-[#6B6C4F] flex items-center gap-1 transition"
              >
                Categorías <ChevronDown size={16} />
              </button>
              {showCategories && (
                <ul className="absolute top-full mt-2 bg-white border rounded-lg shadow-md w-40 z-50 ring-1 ring-gray-200 overflow-hidden">
                  {categories.map((cat, i) => (
                    <li
                      key={i}
                      className="px-4 py-2 hover:bg-[#F0EBE0] cursor-pointer text-sm transition"
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
            <li><a href="/account" className="hover:text-[#6B6C4F] transition">Mi Cuenta</a></li>
          </ul>

          {nombre ? (
            <button
              onClick={handleLogout}
              className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition"
            >
              Cerrar sesión
            </button>
          ) : (
            <a
              href="/login"
              className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition"
            >
              Iniciar sesión
            </a>
          )}
        </div>
      </nav>

      {/* PRODUCTOS */}
      <section className="py-12 px-6">
        <h3 className="text-2xl font-semibold mb-6 text-[#2E2F1B]">Productos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No hay productos para mostrar.</p>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition group border border-gray-200"
              >
                <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                  <span className="text-gray-400 text-sm">Imagen</span>
                </div>
                <h4 className="text-lg font-semibold text-[#333]">{product.nombre}</h4>
                <p className="text-sm text-[#6B6C4F]">{product.descripcion}</p>
                <p className="mt-2 font-bold text-[#4C4C3A]">${product.precio}</p>
                <button className="mt-4 w-full py-2 bg-[#6B6C4F] text-white rounded-full hover:bg-[#4C4C3A] transition">
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
