'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AccountPage() {
  const [nombre, setNombre] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nombreUrl = params.get('nombre');
      const emailUrl = params.get('email');
      const rolUrl = params.get('rol');
      const tokenUrl = params.get('token');
      if (nombreUrl && emailUrl && rolUrl && tokenUrl) {
        localStorage.setItem('nombre', nombreUrl);
        localStorage.setItem('email', emailUrl);
        localStorage.setItem('rol', rolUrl);
        localStorage.setItem('token', tokenUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setNombre(localStorage.getItem('nombre'));
      setEmail(localStorage.getItem('email'));
      setRol(localStorage.getItem('rol'));
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      } else {
        setCart([]);
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('email');
    localStorage.removeItem('rol');
    router.push('/login');
  };

  const handleGoAdmin = () => {
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#DCD7C9] via-[#C5BFA5] to-[#8B8A5C] text-[#2E2F1B] font-sans">
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white/80 backdrop-blur shadow-md gap-4 md:gap-0 sticky top-0 z-10 rounded-b-2xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-[#2E2F1B] cursor-pointer hover:text-[#6B6C4F] transition">
            🛍️ StockNSELL
          </Link>
        </div>
        <div className="flex gap-4 flex-wrap justify-center md:justify-start items-center">
          <Link href="/favorites" className="px-4 py-2 rounded-xl hover:bg-[#e0dbc7] transition font-medium">
            Favoritos
          </Link>
          <Link href="/account" className="px-4 py-2 rounded-xl bg-[#6B6C4F] text-white hover:bg-[#4C4C3A] transition font-medium">
            Mi Cuenta
          </Link>
          {rol === 'admin' && (
            <button onClick={handleGoAdmin} className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-800 transition font-medium">
              Panel Admin
            </button>
          )}
          <Link href="/cart" className="relative flex items-center">
            <span className="text-2xl cursor-pointer" title="Carrito">🛒</span>
            {cart.length > 0 && (
              <span className="ml-1 bg-[#6B6C4F] text-white rounded-full px-2 text-xs absolute -top-2 -right-3">{cart.length}</span>
            )}
          </Link>
          {nombre ? (
            <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-800 transition font-medium">
              Cerrar sesión
            </button>
          ) : (
            <button onClick={() => router.push('/login')} className="px-4 py-2 rounded-xl bg-[#6B6C4F] text-white hover:bg-[#4C4C3A] transition font-medium">
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center border border-[#d4c8b4]"
        >
          <h1 className="text-4xl font-bold mb-6 text-[#4C4C3A] tracking-tight">👤 Mi Cuenta</h1>
          <div className="w-full space-y-4 text-center">
            <p className="text-lg"><span className="font-semibold text-[#6B6C4F]">Nombre:</span> {nombre || "No disponible"}</p>
            <p className="text-lg"><span className="font-semibold text-[#6B6C4F]">Email:</span> {email || "No disponible"}</p>
            <p className="text-lg"><span className="font-semibold text-[#6B6C4F]">Rol:</span> {rol || "No disponible"}</p>
          </div>
          <div className="mt-8 w-full flex flex-col gap-4">
            {nombre ? (
              <button onClick={handleLogout} className="bg-[#6B6C4F] text-white px-6 py-3 rounded-xl hover:bg-[#4C4C3A] transition font-semibold w-full">
                Cerrar sesión
              </button>
            ) : (
              <button onClick={() => router.push('/login')} className="bg-[#6B6C4F] text-white px-6 py-3 rounded-xl hover:bg-[#4C4C3A] transition font-semibold w-full">
                Iniciar sesión
              </button>
            )}
            {rol === 'admin' && (
              <button onClick={handleGoAdmin} className="bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-800 transition font-semibold w-full">
                Ir al panel de administración
              </button>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
