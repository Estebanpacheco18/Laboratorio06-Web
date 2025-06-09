'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function StoreHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [nombre, setNombre] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const router = useRouter();

  // Cargar productos y categorías
  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      });
    axios.get('http://localhost:3001/api/categories')
      .then(res => setCategories(res.data));
    setNombre(localStorage.getItem('nombre'));
  }, []);

  // Filtrar productos por categoría y búsqueda
  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoriaId === selectedCategory);
    }
    if (search) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [search, products, selectedCategory]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    setNombre(null);
    window.location.href = '/';
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
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
        {/* LINKS */}
        <ul className="hidden md:flex gap-6 font-medium relative">
          {/* CATEGORÍAS CON DROPDOWN */}
          <li className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="hover:text-[#6B6C4F] flex items-center gap-1"
            >
              Categorías
            </button>
            {showCategories && (
              <ul className="absolute top-8 left-0 bg-white border rounded shadow-md w-40 z-50">
                {categories.map((cat: any) => (
                  <li
                    key={cat._id}
                    className="px-4 py-2 hover:bg-[#F5F0E6] cursor-pointer text-sm"
                    onClick={() => {
                      setSelectedCategory(cat._id);
                      setShowCategories(false);
                    }}
                  >
                    {cat.nombre}
                  </li>
                ))}
                <li
                  className="px-4 py-2 hover:bg-[#F5F0E6] cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedCategory(null);
                    setShowCategories(false);
                  }}
                >
                  Todas
                </li>
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
                <button
                  className="mt-3 bg-[#6B6C4F] text-white w-full py-2 rounded hover:bg-[#4C4C3A] transition"
                  onClick={() => router.push(`/product/${product._id}`)}
                >
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