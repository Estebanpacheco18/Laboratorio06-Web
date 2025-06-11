'use client'

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

export default function PaymentPage() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [userName, setUserName] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const amount = parseFloat(localStorage.getItem('totalAmount') || '0');
    setTotalAmount(amount);
    setUserName(localStorage.getItem("nombre"))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("nombre")
    window.location.href = "/"
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 16) {
      setCardNumber(value)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 4) value = value.slice(0, 4)
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2)
    setExpiryDate(value)
  }

  const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo letras y espacios, máximo 30 caracteres
    let value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");
    if (value.length > 30) value = value.slice(0, 30);
    setCardHolder(value);
  }

  const handleCancel = () => {
    window.location.href = "/"
  }

  // Validación del nombre del titular
  const isValidCardHolder = (name: string) => {
    // Solo letras y espacios, no vacío, no muy largo
    return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]{1,30}$/.test(name.trim());
  }

  // Lógica para el pago
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    if (cardNumber.length !== 16) {
      setError("El número de tarjeta debe tener 16 dígitos.");
      return;
    }
    if (!isValidCardHolder(cardHolder)) {
      setError("El nombre del titular solo puede contener letras y espacios, y no debe ser muy largo.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setError("La fecha de expiración debe tener el formato MM/AA.");
      return;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      setError("El CVV debe tener 3 o 4 dígitos.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    alert("¡Pago realizado con éxito!");
    localStorage.removeItem('cart');
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F9F6F1] to-[#EAE6DF] text-[#333] font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <a href="/" className="text-2xl font-bold text-[#2E2F1B] hover:text-[#6B6C4F] transition">
            🛍️ StockNSELL
          </a>
          <span className="text-lg text-[#555]">{userName ? `Hola, ${userName}!` : "Hola invitado!"}</span>
        </div>

        <div className="flex items-center bg-[#EFEDE8] px-3 py-1 rounded-full w-full md:w-1/3">
          <Search className="text-[#6B6C4F] mr-2" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-[#2E2F1B]"
          />
        </div>

        <div className="flex items-center gap-4">
          <ul className="hidden md:flex gap-6 font-medium text-[#2E2F1B]">
            <li>
              <a href="/favorites" className="hover:text-[#6B6C4F] transition">Favoritos</a>
            </li>
            <li>
              <a href="/account" className="hover:text-[#6B6C4F] transition">Mi Cuenta</a>
            </li>
          </ul>

          {userName ? (
            <button
              onClick={handleLogout}
              className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition"
            >
              Cerrar sesión
            </button>
          ) : (
            <a
              href="/login"
              className="bg-[#6B6C4F] text-white px-4 py-2 rounded-full hover:bg-[#4C4C3A] transition"
            >
              Iniciar sesión
            </a>
          )}
        </div>
      </nav>

      {/* PAGO */}
      <section className="flex flex-col items-center justify-center py-16 px-4">
        <h2 className="text-3xl font-bold text-[#2E2F1B] mb-8">Método de Pago</h2>
        <div className="text-xl font-semibold mb-8">Total a pagar: ${totalAmount.toFixed(2)}</div>

        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6">
          {/* Simulación de tarjeta */}
          <div className="bg-gradient-to-tr from-[#6B6C4F] to-[#4C4C3A] text-white rounded-lg p-5 shadow-md">
            <div className="text-sm mb-2 tracking-widest">Número de tarjeta</div>
            <div className="text-xl font-mono tracking-widest mb-4">
              {cardNumber.padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim()}
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <div className="uppercase text-xs">Titular</div>
                <div className="tracking-wide">{cardHolder || "NOMBRE COMPLETO"}</div>
              </div>
              <div>
                <div className="uppercase text-xs">Expira</div>
                <div className="tracking-wide">{expiryDate || "MM/AA"}</div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form className="space-y-4" onSubmit={handlePayment}>
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Número de tarjeta</label>
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={16}
                placeholder="1234 5678 9012 3456"
                className="w-full border px-4 py-2 rounded-md outline-none focus:ring-2 ring-[#6B6C4F] text-[#2E2F1B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Titular de la tarjeta</label>
              <input
                type="text"
                value={cardHolder}
                onChange={handleCardHolderChange}
                placeholder="Nombre completo"
                className="w-full border px-4 py-2 rounded-md outline-none focus:ring-2 ring-[#6B6C4F] text-[#2E2F1B]"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#333] mb-1">Expira</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  placeholder="MM/AA"
                  className="w-full border px-4 py-2 rounded-md outline-none focus:ring-2 ring-[#6B6C4F] text-[#2E2F1B]"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-[#333] mb-1">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 4) setCvv(value)
                  }}
                  placeholder="123"
                  maxLength={4}
                  className="w-full border px-4 py-2 rounded-md outline-none focus:ring-2 ring-[#6B6C4F] text-[#2E2F1B]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-[#6B6C4F] text-white py-2 rounded-md hover:bg-[#4C4C3A] transition"
            >
              Pagar ahora
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="w-full mt-2 bg-red-100 text-red-700 py-2 rounded-md hover:bg-red-200 transition"
            >
              Cancelar pago
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}