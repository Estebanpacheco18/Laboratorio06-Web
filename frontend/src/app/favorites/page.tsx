'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Search, ChevronDown, Heart } from "lucide-react";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [nombre, setNombre] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [categories] = useState(['Electrónica', 'Ropa', 'Hogar', 'Deportes']);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Cargar favoritos, carrito y nombre al iniciar
  useEffect(() => {
    const storedFavs = localStorage.getItem('favorites');
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
    const storedCart = localStorage.getItem('cart');
    if (storedCart) setCart(JSON.parse(storedCart));
    setNombre(localStorage.getItem('nombre'));
  }, []);

  // Sincronizar favoritos y carrito si cambian en otra pestaña o al volver
  useEffect(() => {
    const handleStorage = () => {
      const storedFavs = localStorage.getItem('favorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      else setFavorites([]);
      const storedCart = localStorage.getItem('cart');
      if (storedCart) setCart(JSON.parse(storedCart));
      else setCart([]);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  // Cargar todos los productos para filtrar los favoritos
  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  // Filtrar productos favoritos
  const favoriteProducts = products.filter(p => favorites.includes(p._id));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    setNombre(null);
    window.location.href = '/';
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productId === product._id);
    let updated;
    if (existing) {
      updated = cart.map(item =>
        item.productId === product._id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      );
    } else {
      updated = [...cart, { productId: product._id, cantidad: 1 }];
    }
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F9F6F1] to-[#EAE6DF] text-[#333] font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-2xl font-bold text-[#2E2F1B] cursor-pointer"
          >
            🛍️ StockNSELL
          </Link>
          <span className="text-lg text-[#555]">
            {nombre ? `Hola, ${nombre}!` : "Hola invitado!"}
          </span>
        </div>

        <div className="flex items-center bg-[#EFEDE8] px-3 py-1 rounded-full w-full md:w-1/3">
          <Search className="text-[#6B6C4F] mr-2" size={20} />
          <input
            type="text"
            placeholder="Buscar productos favoritos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <ul className="hidden md:flex gap-6 font-medium">
            <li>
              <Link href="/favorites" className="hover:text-[#6B6C4F] transition">
                Favoritos
              </Link>
            </li>
            <li className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="hover:text-[#6B6C4F] flex items-center gap-1 transition"
              >
                Categorías <ChevronDown size={16} />
              </button>
              {showCategories && (
                <ul className="absolute top-full mt-2 bg-white border rounded-lg shadow-md w-40 z-50 ring-1 ring-gray-200 overflow-hidden">
                  <li
                    className={`px-4 py-2 hover:bg-[#F0EBE0] cursor-pointer text-sm transition ${selectedCategory === null ? 'font-bold text-[#6B6C4F]' : ''}`}
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowCategories(false);
                    }}
                  >
                    Todas las categorías
                  </li>
                  {categories.map((cat, i) => (
                    <li
                      key={i}
                      className={`px-4 py-2 hover:bg-[#F0EBE0] cursor-pointer text-sm transition ${selectedCategory === cat ? 'font-bold text-[#6B6C4F]' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategories(false);
                      }}
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li><Link href="/account" className="hover:text-[#6B6C4F] transition">Mi Cuenta</Link></li>
            <li className="relative">
              <Link href="/cart" className="hover:text-[#6B6C4F] transition flex items-center cursor-pointer">
                🛒
                {cart.length > 0 && (
                  <span className="ml-1 bg-[#6B6C4F] text-white rounded-full px-2 text-xs">{cart.length}</span>
                )}
              </Link>
            </li>
          </ul>

          {nombre ? (
            <button
              onClick={handleLogout}
              className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>

      {/* FAVORITOS */}
      <section className="py-12 px-6">
        <h2 className="text-3xl font-bold text-[#2E2F1B] mb-8 text-center">Mis Favoritos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {favoriteProducts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No tienes productos favoritos.</p>
          ) : (
            favoriteProducts
              .filter(product =>
                product.nombre.toLowerCase().includes(search.toLowerCase()) &&
                (!selectedCategory || (product.categoria === selectedCategory))
              )
              .map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition group border border-gray-200"
                >
                  <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                    {product.imagen ? (
                      <img
                        src={`http://localhost:3001${product.imagen}`}
                        alt={product.nombre}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Imagen</span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-[#333]">{product.nombre}</h4>
                  <p className="text-sm text-[#6B6C4F]">{product.descripcion}</p>
                  <p className="mt-2 font-bold text-[#4C4C3A] flex items-center justify-between">
                    ${product.precio}
                    <Heart
                      size={20}
                      fill="currentColor"
                      className="ml-2 text-red-500 cursor-pointer transition"
                      onClick={() => {
                        if (window.confirm("¿Estás seguro de eliminar este producto de tus favoritos?")) {
                          const updated = favorites.filter(id => id !== product._id);
                          setFavorites(updated);
                          localStorage.setItem('favorites', JSON.stringify(updated));
                        }
                      }}
                    />
                  </p>
                  <button
                    className="mt-4 w-full py-2 bg-[#2E2F1B] text-white rounded-full hover:bg-[#6B6C4F] transition"
                    onClick={() => addToCart(product)}
                  >
                    Añadir al carrito
                  </button>
                </div>
              ))
          )}
        </div>
      </section>
    </main>
  );
}