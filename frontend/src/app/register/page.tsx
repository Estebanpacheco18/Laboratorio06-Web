'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

const handleRegister = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setMsg('');
  try {
    const res = await axios.post(`${apiUrl}/api/register`, { nombre, email, password });
    setMsg('Registro exitoso. Redirigiendo...');
    localStorage.setItem('nombre', res.data.user.nombre);
    setTimeout(() => router.push('/login'), 1500);
  } catch (err: any) {
    setMsg(err.response?.data?.error || 'Error al registrar');
  }
};

const handleGoogle = () => {
  window.location.href = `${apiUrl}/auth/google`;
};

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E6] text-[#4C4C3A] px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Regístrate en StockNSELL</h1>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl mb-4"
          />
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
          <button
            type="submit"
            className="w-full bg-[#6B6C4F] text-white py-3 rounded-xl hover:bg-[#4C4C3A] mb-4"
          >
            Crear cuenta
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 border py-2 rounded-xl hover:bg-gray-100"
        >
          <FcGoogle size={20} /> Registrarse con Google
        </button>
        <p className="text-center mt-4 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-[#6B6C4F] font-semibold hover:underline">
            Inicia sesión aquí
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