'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

interface CartItem {
    _id: string; // ID del producto de la base de datos
    nombre: string;
    precio: number;
    cantidad: number; // Cantidad de este producto en el carrito
    descripcion: string;
    // Otros campos del producto que puedas necesitar mostrar (ej. imagen)
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userName, setUserName] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);

    // Efecto para cargar los ítems del carrito y el nombre de usuario al inicio
    useEffect(() => {
        setUserName(localStorage.getItem('nombre'));
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');

        const fetchProductDetails = async () => {
            // Promesa.all para obtener los detalles de todos los productos en paralelo
            const itemsWithDetails = await Promise.all(
                storedCart.map(async (cartItem: { productId: string; cantidad: number }) => {
                    try {
                        // Utiliza 'cartItem.productId' para obtener el ID del producto correctamente
                        const response = await axios.get(`http://localhost:3001/api/products/${cartItem.productId}`);
                        // Combina los detalles del producto con la cantidad guardada en localStorage
                        return {
                            ...response.data, // Contiene _id, nombre, precio, descripción, etc.
                            cantidad: cartItem.cantidad // Asigna la cantidad correcta del carrito
                        };
                    } catch (error) {
                        console.error(`Error al obtener detalles del producto con ID ${cartItem.productId}:`, error);
                        return null; // Retorna null para filtrar los productos que no se pudieron cargar
                    }
                })
            );

            // Filtra los productos que se cargaron correctamente
            const validItems = itemsWithDetails.filter((item) => item !== null) as CartItem[];
            setCartItems(validItems);
        };

        fetchProductDetails();
    }, []); // Se ejecuta solo una vez al montar el componente

    // Efecto para recalcular el total cada vez que 'cartItems' cambia
    useEffect(() => {
        const newTotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        setTotal(newTotal);
    }, [cartItems]); // Se ejecuta cada vez que 'cartItems' cambia

    // Maneja el cambio de cantidad de un producto en el carrito
    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return; // Evita cantidades negativas o cero

        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item._id === productId
                    ? { ...item, cantidad: newQuantity }
                    : item
            );

            // Actualiza localStorage con las nuevas cantidades
            const cartForLocalStorage = updatedItems.map(item => ({
                productId: item._id,
                cantidad: item.cantidad
            }));
            localStorage.setItem('cart', JSON.stringify(cartForLocalStorage));
            return updatedItems;
        });
    };

    // Maneja la eliminación de un producto del carrito
    const handleRemoveItem = (productId: string) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.filter(item => item._id !== productId);

            // Actualiza localStorage después de eliminar el producto
            const cartForLocalStorage = updatedItems.map(item => ({
                productId: item._id,
                cantidad: item.cantidad
            }));
            localStorage.setItem('cart', JSON.stringify(cartForLocalStorage));
            return updatedItems;
        });
    };

    // Maneja la acción de proceder al pago
    const handleCheckout = () => {
        // Guarda el total en localStorage para usarlo en la página de pago
        localStorage.setItem('totalAmount', total.toString());
        window.location.href = '/payment'; // Redirige a la página de pago
    };

    // Maneja el cierre de sesión
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nombre');
        window.location.href = '/'; // Redirige a la página principal
    };

    return (
        <main className="min-h-screen bg-[#F5F0E6] text-[#4C4C3A] font-sans">
            {/* NAVBAR */}
            <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white shadow-md gap-4 md:gap-0 rounded-b-xl">
                <div className="flex items-center gap-4">
                    <a href="/" className="text-2xl font-bold tracking-tight text-[#4C4C3A]">🛍️ StockNSELL</a>
                    <span className="ml-4 text-lg text-[#6B6C4F]">
                        {userName ? `Hola, ${userName}!` : "Hola invitado!"}
                    </span>
                </div>

                <div className="flex items-center bg-[#F0EBE0] px-3 py-1 rounded-xl w-full md:w-1/3 shadow-inner">
                    <Search className="text-[#6B6C4F] mr-2" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm placeholder-gray-500"
                    />
                </div>

                {userName ? (
                    <button
                        onClick={handleLogout}
                        className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition shadow-md"
                    >
                        Cerrar sesión
                    </button>
                ) : (
                    <a
                        href="/login"
                        className="bg-[#6B6C4F] text-white px-4 py-2 rounded-xl hover:bg-[#4C4C3A] transition shadow-md"
                    >
                        Iniciar sesión
                    </a>
                )}
            </nav>

            {/* CONTENIDO DEL CARRITO */}
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8 text-center text-[#4C4C3A]">Carrito de Compras</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl shadow-md">
                        <p className="text-xl text-gray-600 mb-4">Tu carrito está vacío</p>
                        <a
                            href="/"
                            className="inline-block mt-4 bg-[#6B6C4F] text-white px-6 py-3 rounded-xl hover:bg-[#4C4C3A] transition font-medium shadow-lg"
                        >
                            Continuar comprando
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {cartItems.map((item: CartItem) => (
                            <div
                                key={item._id}
                                className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-4 border border-gray-200"
                            >
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-semibold text-[#4C4C3A]">{item.nombre}</h3>
                                    <p className="text-sm text-gray-600">{item.descripcion}</p>
                                    <p className="text-[#6B6C4F] font-bold mt-2 text-xl">${item.precio.toFixed(2)}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleQuantityChange(item._id, item.cantidad - 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-[#F0EBE0] text-[#6B6C4F] rounded-full text-lg font-bold hover:bg-[#E0DBCF] transition"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-semibold text-lg text-[#4C4C3A]">{item.cantidad}</span>
                                    <button
                                        onClick={() => handleQuantityChange(item._id, item.cantidad + 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-[#F0EBE0] text-[#6B6C4F] rounded-full text-lg font-bold hover:bg-[#E0DBCF] transition"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleRemoveItem(item._id)}
                                    className="text-red-500 hover:text-red-700 transition font-medium text-sm md:ml-4"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}

                        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-semibold text-[#4C4C3A]">Total:</span>
                                <span className="text-3xl font-bold text-[#6B6C4F]">${total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-[#6B6C4F] text-white py-4 rounded-xl hover:bg-[#4C4C3A] transition font-bold text-lg shadow-xl"
                            >
                                Proceder al pago
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
