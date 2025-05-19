'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await axios.post('http://localhost:3001/api/login', { email, password });
      setMsg('Login exitoso. Redirigiendo...');
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('nombre', res.data.user.nombre);
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  const handleGoogle = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ display: 'block', marginBottom: 10, width: '100%' }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ display: 'block', marginBottom: 10, width: '100%' }}
      />
      <button type="submit" style={{ width: '100%', marginBottom: 10 }}>Entrar</button>
      <button type="button" onClick={handleGoogle} style={{ width: '100%', background: '#4285F4', color: 'white' }}>
        Iniciar sesión con Google
      </button>
      <p>{msg}</p>
    </form>
  );
}