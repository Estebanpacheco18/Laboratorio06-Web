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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Efecto para cargar los ítems del carrito y el nombre de usuario al inicio
    useEffect(() => {
        setUserName(localStorage.getItem('nombre'));
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('--- Carga Inicial del Carrito ---');
        console.log('Carrito guardado en localStorage:', storedCart);

        const fetchProductDetails = async () => {
            // Promesa.all para obtener los detalles de todos los productos en paralelo
            const itemsWithDetails = await Promise.all(
                storedCart.map(async (cartItem: { productId: string; cantidad: number }) => {
                    try {
                        // Utiliza 'cartItem.productId' para obtener el ID del producto correctamente
                        const response = await axios.get(`${apiUrl}/api/products/${cartItem.productId}`);
                        console.log(`Detalles obtenidos para el ID de producto ${cartItem.productId}:`, response.data);
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

            // Agrupar productos duplicados y sumar sus cantidades
            const aggregatedItemsMap = new Map<string, CartItem>();
            validItems.forEach(item => {
                if (aggregatedItemsMap.has(item._id)) {
                    // Si el producto ya existe en el mapa, suma la cantidad
                    const existingItem = aggregatedItemsMap.get(item._id)!;
                    existingItem.cantidad += item.cantidad;
                    aggregatedItemsMap.set(item._id, existingItem);
                } else {
                    // Si es un producto nuevo, agrégalo al mapa
                    aggregatedItemsMap.set(item._id, { ...item }); // Clona para evitar mutación directa
                }
            });
            const finalCartItems = Array.from(aggregatedItemsMap.values());

            setCartItems(finalCartItems);
            console.log('Items del carrito cargados, agregados y establecidos:', finalCartItems);
        };

        fetchProductDetails();
    }, []); // Se ejecuta solo una vez al montar el componente

    // Efecto para recalcular el total cada vez que 'cartItems' cambia
    useEffect(() => {
        const newTotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        setTotal(newTotal);
        console.log('Total recalculado:', newTotal);
    }, [cartItems]); // Se ejecuta cada vez que 'cartItems' cambia

    // Maneja el cambio de cantidad de un producto en el carrito
    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            console.log('Intentado establecer una cantidad menor a 1, operación cancelada.');
            return; // Evita cantidades negativas o cero
        }

        console.log('--- handleQuantityChange (Cambio de Cantidad) ---');
        console.log('ID del producto a modificar:', productId, 'Nueva Cantidad:', newQuantity);

        setCartItems(prevItems => {
            console.log('Estado previo del carrito (antes de la actualización):', prevItems); // Muestra el estado antes del map

            const updatedItems = prevItems.map(item =>
                item._id === productId
                    ? { ...item, cantidad: newQuantity }
                    : item
            );
            console.log('Estado del carrito actualizado (después del map):', updatedItems); // Muestra el item con la cantidad modificada

            // Actualiza localStorage con las nuevas cantidades
            // Asegúrate de que los datos en localStorage sean únicos por productId
            const cartForLocalStorage = updatedItems.map(item => ({
                productId: item._id,
                cantidad: item.cantidad
            }));
            console.log('Datos para localStorage:', cartForLocalStorage);
            localStorage.setItem('cart', JSON.stringify(cartForLocalStorage));
            return updatedItems;
        });
    };

    // Maneja la eliminación de un producto del carrito
    const handleRemoveItem = (productId: string) => {
        console.log('--- handleRemoveItem (Eliminar Ítem) ---');
        console.log('ID del producto a eliminar:', productId);

        setCartItems(prevItems => {
            console.log('Estado previo del carrito (antes de la eliminación):', prevItems);

            const updatedItems = prevItems.filter(item => item._id !== productId);
            console.log('Estado del carrito actualizado (después del filter):', updatedItems);

            // Actualiza localStorage después de eliminar el producto
            const cartForLocalStorage = updatedItems.map(item => ({
                productId: item._id,
                cantidad: item.cantidad
            }));
            console.log('Datos para localStorage (después de eliminar):', cartForLocalStorage);
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
