'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    const nombreParam = searchParams.get('nombre');
    if (nombreParam) {
      localStorage.setItem('nombre', nombreParam);
      setNombre(nombreParam);
      // Opcional: limpiar el query param de la URL
      window.history.replaceState({}, document.title, '/');
    } else {
      setNombre(localStorage.getItem('nombre'));
    }
  }, [searchParams]);

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h1>Bienvenido{nombre ? `, ${nombre}` : ''}</h1>
      <button style={{ width: '100%', marginBottom: 10 }} onClick={() => router.push('/login')}>
        Iniciar sesión
      </button>
      <button style={{ width: '100%' }} onClick={() => router.push('/register')}>
        Registrarse
      </button>
    </div>
  );
}