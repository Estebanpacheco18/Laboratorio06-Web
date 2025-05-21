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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E6] text-[#4C4C3A]">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Mi Cuenta</h1>
        <p className="mb-2"><b>Nombre:</b> {nombre || "No disponible"}</p>
        <p className="mb-2"><b>Email:</b> {email || "No disponible"}</p>
        <p className="mb-6"><b>Rol:</b> {rol || "No disponible"}</p>
        <button
          onClick={handleLogout}
          className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition mb-2"
        >
          Cerrar sesión
        </button>
        {rol === 'admin' && (
          <button
            onClick={handleGoAdmin}
            className="bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-800 transition"
          >
            Ir al panel de administración
          </button>
        )}
      </div>
    </main>
  );
}