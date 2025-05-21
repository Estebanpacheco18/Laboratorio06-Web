export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E6] text-[#4C4C3A]">
      <div className="bg-white shadow-xl rounded-2xl p-10 flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-2 text-[#6B6C4F]">404</h1>
        <p className="text-2xl mb-6">Página no encontrada</p>
        <a
          href="/"
          className="bg-[#6B6C4F] text-white px-8 py-3 rounded-xl hover:bg-[#4C4C3A] transition font-semibold"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}