'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Search, ChevronDown, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function StoreHomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories] = useState(['Electrónica', 'Ropa', 'Hogar', 'Deportes']);
  const [nombre, setNombre] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${apiUrl}/api/products`)
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .catch(() => {
        setProducts([]);
        setFilteredProducts([]);
      })
      .finally(() => setTimeout(() => setLoading(false), 500));
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter(product =>
        product.nombre.toLowerCase().includes(search.toLowerCase()) &&
        (!selectedCategory || product.categoria === selectedCategory)
      )
    );
  }, [search, selectedCategory, products]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nombreUrl = params.get("nombre");
    if (nombreUrl) {
      setNombre(nombreUrl);
      localStorage.setItem("nombre", nombreUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setNombre(localStorage.getItem("nombre"));
    }
  }, []);

  const addToCart = (product) => {
    const updatedCart = [...cart];
    const index = updatedCart.findIndex(item => item.productId === product._id);
    if (index !== -1) {
      updatedCart[index].cantidad += 1;
    } else {
      updatedCart.push({ productId: product._id, cantidad: 1 });
    }
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const toggleFavorite = (product) => {
    let updated = [...favorites];
    if (updated.includes(product._id)) {
      updated = updated.filter(id => id !== product._id);
    } else {
      updated.push(product._id);
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.clear();
    setNombre(null);
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F0ECE3] via-[#E4E0D0] to-[#CFCABB] text-[#2E2F1B] font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#2E2F1B]">🛍️ StockNSELL</Link>
          <span className="text-lg text-[#6B6C4F] font-medium">{nombre ? `Hola, ${nombre}!` : "Hola invitado!"}</span>
        </div>

        <div className="flex items-center bg-[#E6E3DB] px-4 py-2 rounded-full shadow-inner w-full md:w-1/3">
          <Search className="text-[#6B6C4F] mr-2" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-[#2E2F1B] placeholder:text-[#888]"
          />
        </div>

        <div className="flex items-center gap-4">
          <ul className="hidden md:flex gap-6 font-medium">
            <li><Link href="/favorites" className="hover:text-[#6B6C4F] transition">Favoritos</Link></li>
            <li className="relative">
              <button onClick={() => setShowCategories(!showCategories)} className="hover:text-[#6B6C4F] flex items-center gap-1 transition">
                Categorías <ChevronDown size={16} />
              </button>
              {showCategories && (
                <ul className="absolute top-full mt-2 bg-white border rounded-lg shadow-md w-40 z-50">
                  <li onClick={() => { setSelectedCategory(null); setShowCategories(false); }} className="px-4 py-2 text-sm hover:bg-[#F0EBE0] cursor-pointer">
                    Todas las categorías
                  </li>
                  {categories.map((cat, i) => (
                    <li key={i} onClick={() => { setSelectedCategory(cat); setShowCategories(false); }} className="px-4 py-2 text-sm hover:bg-[#F0EBE0] cursor-pointer">
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li><Link href="/account" className="hover:text-[#6B6C4F] transition">Mi Cuenta</Link></li>
            <li className="relative">
              <Link href="/cart" className="hover:text-[#6B6C4F] transition flex items-center">
                🛒{cart.length > 0 && <span className="ml-1 bg-[#6B6C4F] text-white rounded-full px-2 text-xs">{cart.length}</span>}
              </Link>
            </li>
          </ul>

          {nombre ? (
            <button onClick={handleLogout} className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition">
              Cerrar sesión
            </button>
          ) : (
            <Link href="/login" className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition">
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>

      <section className="py-12 px-6 min-h-[40vh] flex flex-col items-center justify-center">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-10 h-10 border-4 border-[#6B6C4F] border-t-transparent rounded-full"
          />
        ) : (
          <>
            <h3 className="text-3xl font-bold mb-8 text-[#2E2F1B] tracking-tight">
              Productos {selectedCategory && <span className="text-base text-[#6B6C4F]">/ {selectedCategory}</span>}
            </h3>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || 'all'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10"
              >
                {filteredProducts.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500">No hay productos para mostrar.</p>
                ) : (
                  filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-[#F7F6F2] via-[#EFEDE8] to-[#E1DED6] rounded-2xl p-5 shadow-lg hover:shadow-xl transition border border-[#DDDAD3]"
                    >
                      <div className="h-40 bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                        {product.imagen ? (
                          <img src={product.imagen} alt={product.nombre} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-gray-400 text-sm">Imagen</span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-[#2E2F1B] truncate">{product.nombre}</h4>
                      <p className="text-sm text-[#6B6C4F] mt-1">{product.descripcion}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[#4C4C3A] font-bold text-lg">${product.precio}</span>
                        <Heart
                          size={20}
                          fill={favorites.includes(product._id) ? "currentColor" : "none"}
                          className={`cursor-pointer transition ${favorites.includes(product._id) ? "text-red-500" : "text-[#6B6C4F] hover:text-red-500"}`}
                          onClick={() => toggleFavorite(product)}
                        />
                      </div>
                      <button
                        className="mt-4 w-full py-2 bg-[#2E2F1B] text-white rounded-full hover:bg-[#6B6C4F] transition font-semibold"
                        onClick={() => addToCart(product)}
                      >
                        Añadir al carrito
                      </button>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </section>
    </main>
  );
}
