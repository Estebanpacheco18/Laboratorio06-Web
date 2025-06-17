'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Search, ChevronDown, Heart } from "lucide-react";


export default function StoreHomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories] = useState(['Electrónica', 'Ropa', 'Hogar', 'Deportes']);
  const [nombre, setNombre] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const storedFavs = localStorage.getItem('favorites');
      return storedFavs ? JSON.parse(storedFavs) : [];
    }
    return [];
  });

  // Leer favoritos y carrito al cargar la página
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) setCart(JSON.parse(storedCart));
    const storedFavs = localStorage.getItem('favorites');
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
  }, []);

  // Sincronizar carrito y favoritos si cambia en otra pestaña o al volver a la página
  useEffect(() => {
    const handleStorage = () => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) setCart(JSON.parse(storedCart));
      else setCart([]);
      const storedFavs = localStorage.getItem('favorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      else setFavorites([]);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  // Guardar carrito y favoritos cada vez que cambien
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (product: any) => {
    setCart(prev => {
      // Busca si el producto ya está en el carrito
      const existing = prev.find((item: any) => item.productId === product._id);
      let updatedCart;
      if (existing) {
        // Si existe, suma la cantidad
        updatedCart = prev.map((item: any) =>
          item.productId === product._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si no existe, lo agrega
        updatedCart = [...prev, { productId: product._id, cantidad: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const toggleFavorite = (product: any) => {
    setFavorites(prev => {
      let updated;
      if (prev.includes(product._id)) {
        updated = prev.filter(id => id !== product._id);
      } else {
        updated = [...prev, product._id];
      }
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // GUARDAR TODOS LOS DATOS DE LA URL EN LOCALSTORAGE SI EXISTEN
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nombreUrl = params.get('nombre');
    const emailUrl = params.get('email');
    const rolUrl = params.get('rol');
    const tokenUrl = params.get('token');
    let hasParams = false;
    if (nombreUrl) {
      setNombre(nombreUrl);
      localStorage.setItem('nombre', nombreUrl);
      hasParams = true;
    } else {
      setNombre(localStorage.getItem('nombre'));
    }
    if (emailUrl) {
      localStorage.setItem('email', emailUrl);
      hasParams = true;
    }
    if (rolUrl) {
      localStorage.setItem('rol', rolUrl);
      hasParams = true;
    }
    if (tokenUrl) {
      localStorage.setItem('token', tokenUrl);
      hasParams = true;
    }
    if (hasParams) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

useEffect(() => {
  axios.get(`${apiUrl}/api/products`)
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
        product.nombre.toLowerCase().includes(search.toLowerCase()) &&
        (!selectedCategory || (product.categoria === selectedCategory))
      )
    );
  }, [search, products, selectedCategory]);

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
          <Link
            href="/cart"
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
            placeholder="Buscar productos..."
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

      {/* PRODUCTOS */}
      <section className="py-12 px-6">
        <h3 className="text-2xl font-semibold mb-6 text-[#2E2F1B]">
          Productos {selectedCategory && <span className="text-base text-[#6B6C4F]">/ {selectedCategory}</span>}
        </h3>
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
                  {product.imagen ? (
<img
  src={`${process.env.NEXT_PUBLIC_API_URL}${product.imagen}`}
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
                    fill={favorites.includes(product._id) ? "currentColor" : "none"}
                    className={`ml-2 cursor-pointer transition ${
                      favorites.includes(product._id)
                        ? "text-red-500"
                        : "text-[#6B6C4F] hover:text-red-500"
                    }`}
                    onClick={() => toggleFavorite(product)}
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