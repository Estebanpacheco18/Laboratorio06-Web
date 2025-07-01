'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface CartItem {
    _id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    descripcion: string;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [userName, setUserName] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        setUserName(localStorage.getItem('nombre'));
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');

        const fetchProductDetails = async () => {
            const itemsWithDetails = await Promise.all(
                storedCart.map(async (cartItem: { productId: string; cantidad: number }) => {
                    try {
                        const response = await axios.get(`${apiUrl}/api/products/${cartItem.productId}`);
                        return {
                            ...response.data,
                            cantidad: cartItem.cantidad
                        };
                    } catch {
                        return null;
                    }
                })
            );

            const validItems = itemsWithDetails.filter((item) => item !== null) as CartItem[];

            const aggregatedItemsMap = new Map<string, CartItem>();
            validItems.forEach(item => {
                if (aggregatedItemsMap.has(item._id)) {
                    const existingItem = aggregatedItemsMap.get(item._id)!;
                    existingItem.cantidad += item.cantidad;
                    aggregatedItemsMap.set(item._id, existingItem);
                } else {
                    aggregatedItemsMap.set(item._id, { ...item });
                }
            });

            setCartItems(Array.from(aggregatedItemsMap.values()));
        };

        fetchProductDetails();
    }, []);

    useEffect(() => {
        const newTotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        setTotal(newTotal);
    }, [cartItems]);

    const handleQuantityChange = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        // Obtener el stock actual del producto desde el backend
        let stock = 0;
        try {
            const res = await axios.get(`${apiUrl}/api/products/${productId}`);
            stock = res.data.stock;
        } catch {
            return;
        }

        if (newQuantity > stock) {
            alert("No hay suficiente stock disponible.");
            return;
        }

        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item =>
                item._id === productId ? { ...item, cantidad: newQuantity } : item
            );
            const cartForLocalStorage = updatedItems.map(item => ({
                productId: item._id,
                cantidad: item.cantidad
            }));
            localStorage.setItem('cart', JSON.stringify(cartForLocalStorage));
            return updatedItems;
        });
    };

    const handleRemoveItem = (productId: string) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.filter(item => item._id !== productId);
            const cartForLocalStorage = updatedItems.map(item => ({
                productId: item._id,
                cantidad: item.cantidad
            }));
            localStorage.setItem('cart', JSON.stringify(cartForLocalStorage));
            return updatedItems;
        });
    };

    const handleCheckout = () => {
        localStorage.setItem('totalAmount', total.toString());
        window.location.href = '/payment';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nombre');
        window.location.href = '/';
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#DCD7C9] via-[#C5BFA5] to-[#8B8A5C] text-[#2E2F1B] font-sans">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <a href="/" className="text-2xl font-bold text-[#2E2F1B] cursor-pointer">
                        🛍️ StockNSELL
                    </a>
                    <span className="text-lg text-[#555]">
                        {userName ? `Hola, ${userName}!` : "Hola invitado!"}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <ul className="hidden md:flex gap-6 font-medium">
                        <li>
                            <a href="/favorites" className="hover:text-[#6B6C4F] transition">
                                Favoritos
                            </a>
                        </li>
                        <li>
                            <a href="/account" className="hover:text-[#6B6C4F] transition">
                                Mi Cuenta
                            </a>
                        </li>
                        <li className="relative">
                            <a href="/cart" className="hover:text-[#6B6C4F] transition flex items-center cursor-pointer">
                                🛒
                                {cartItems.length > 0 && (
                                    <span className="ml-1 bg-[#6B6C4F] text-white rounded-full px-2 text-xs">
                                        {cartItems.length}
                                    </span>
                                )}
                            </a>
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

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto py-8 px-4"
            >
                <h1 className="text-3xl font-bold mb-8 text-center text-[#4C4C3A]">Carrito de Compras</h1>

                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-8 bg-white rounded-xl shadow-md"
                    >
                        <p className="text-xl text-gray-600 mb-4">Tu carrito está vacío</p>
                        <a
                            href="/"
                            className="inline-block mt-4 bg-[#6B6C4F] text-white px-6 py-3 rounded-xl hover:bg-[#4C4C3A] transition font-medium shadow-lg"
                        >
                            Continuar comprando
                        </a>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {cartItems.map((item: CartItem) => (
                            <motion.div
                                key={item._id}
                                whileHover={{ scale: 1.02 }}
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
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                        >
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
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </main>
    );
}