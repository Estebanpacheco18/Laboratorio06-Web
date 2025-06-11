'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay sesión activa
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMsg('');
    try {
      const res = await axios.post('http://localhost:3001/api/login', { email, password });
      setMsg('Login exitoso. Redirigiendo...');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('nombre', res.data.user.nombre);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('rol', res.data.user.rol);
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const handleGoogle = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E6] text-[#4C4C3A] px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Inicia sesión en StockNSELL</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl mb-4"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl mb-4"
          />
          {/* Renderizar el botón solo si no hay sesión activa */}
          {!isLoggedIn && (
            <button
              type="submit"
              className="w-full bg-[#6B6C4F] text-white py-3 rounded-xl hover:bg-[#4C4C3A] mb-4"
            >
              Iniciar sesión
            </button>
          )}
        </form>
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 border py-2 rounded-xl hover:bg-gray-100"
        >
          <FcGoogle size={20} /> Iniciar con Google
        </button>
        <p className="text-center mt-4 text-sm">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#6B6C4F] font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
        {msg && (
          <div className="mt-4 text-center text-sm" style={{ color: msg.includes('exitoso') ? 'green' : 'red' }}>
            {msg}
          </div>
        )}
      </div>
    </main>
  );
}