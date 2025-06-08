'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [nombre, setNombre] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setNombre(localStorage.getItem('nombre'));
    setEmail(localStorage.getItem('email'));
    setRol(localStorage.getItem('rol'));
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

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F0E6] to-[#e4d8c2] text-[#4C4C3A] font-sans">
      {/* NAVBAR */}
      <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white shadow-md gap-4 md:gap-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1
            className="text-2xl font-bold tracking-tight cursor-pointer hover:text-[#6B6C4F] transition"
            onClick={() => handleNavigate('/')}
          >
            🛍️ <span className="text-[#6B6C4F]">StockNSELL</span>
          </h1>
        </div>
        <div className="flex gap-4 flex-wrap justify-center md:justify-start">
          <button
            onClick={() => handleNavigate('/')}
            className="px-4 py-2 rounded-xl hover:bg-[#e0dbc7] transition font-medium"
          >
            Inicio
          </button>
          <button
            onClick={() => handleNavigate('/favoritos')}
            className="px-4 py-2 rounded-xl hover:bg-[#e0dbc7] transition font-medium"
          >
            Favoritos
          </button>
          <button
            onClick={() => handleNavigate('/categorias')}
            className="px-4 py-2 rounded-xl hover:bg-[#e0dbc7] transition font-medium"
          >
            Categorías
          </button>
          <button
            onClick={() => handleNavigate('/account')}
            className="px-4 py-2 rounded-xl bg-[#6B6C4F] text-white hover:bg-[#4C4C3A] transition font-medium"
          >
            Mi Cuenta
          </button>
          {rol === 'admin' && (
            <button
              onClick={handleGoAdmin}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-800 transition font-medium"
            >
              Panel Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-800 transition font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <section className="flex flex-col items-center justify-center p-8">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center border border-[#d4c8b4]">
          <h1 className="text-4xl font-bold mb-6 text-[#4C4C3A] tracking-tight">👤 Mi Cuenta</h1>
          <div className="w-full space-y-4 text-center">
            <p className="text-lg">
              <span className="font-semibold text-[#6B6C4F]">Nombre:</span> {nombre || "No disponible"}
            </p>
            <p className="text-lg">
              <span className="font-semibold text-[#6B6C4F]">Email:</span> {email || "No disponible"}
            </p>
            <p className="text-lg">
              <span className="font-semibold text-[#6B6C4F]">Rol:</span> {rol || "No disponible"}
            </p>
          </div>
          <div className="mt-8 w-full flex flex-col gap-4">
            <button
              onClick={handleLogout}
              className="bg-[#6B6C4F] text-white px-6 py-3 rounded-xl hover:bg-[#4C4C3A] transition font-semibold w-full"
            >
              Cerrar sesión
            </button>
            {rol === 'admin' && (
              <button
                onClick={handleGoAdmin}
                className="bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-800 transition font-semibold w-full"
              >
                Ir al panel de administración
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
