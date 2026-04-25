import React, { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
import { FaShoppingCart, FaDollarSign, FaClock, FaBoxOpen } from "react-icons/fa";

export default function Stats() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedOrders = await apiGet("order/adminorder");
            const fetchedProducts = await apiGet("product/getallproducts");
            setOrders(fetchedOrders.orders || fetchedOrders || []);
            setProducts(fetchedProducts.products || []);
        };
        fetchData();
    }, []);

    const totalSales = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingOrders = Array.isArray(orders) ? orders.filter(o => o.orderStatus !== "delivered").length : 0;
    const outOfStock = Array.isArray(products) ? products.filter(p => p.countInStock === 0).length : 0;

    // Latest 5 orders
    const latestOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // Top 5 selling products
    const topProducts = [...products]
        .sort((a, b) => b.sold - a.sold) // Ensure `sold` field exists
        .slice(0, 5);

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-[#124b68] to-[#eb6a00] space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="flex items-center p-4 bg-white/10 text-white rounded-xl shadow-lg hover:scale-105 transform transition">
                    <FaShoppingCart size={36} className="mr-4" />
                    <div>
                        <h2 className="font-bold text-lg">Total Orders</h2>
                        <p className="text-2xl">{orders.length}</p>
                    </div>
                </div>
                <div className="flex items-center p-4 bg-white/10 text-white rounded-xl shadow-lg hover:scale-105 transform transition">
                    <FaDollarSign size={36} className="mr-4" />
                    <div>
                        <h2 className="font-bold text-lg">Total Sales</h2>
                        <p className="text-2xl">${totalSales.toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex items-center p-4 bg-white/10 text-white rounded-xl shadow-lg hover:scale-105 transform transition">
                    <FaClock size={36} className="mr-4" />
                    <div>
                        <h2 className="font-bold text-lg">Pending Orders</h2>
                        <p className="text-2xl">{pendingOrders}</p>
                    </div>
                </div>
                <div className="flex items-center p-4 bg-white/10 text-white rounded-xl shadow-lg hover:scale-105 transform transition">
                    <FaBoxOpen size={36} className="mr-4" />
                    <div>
                        <h2 className="font-bold text-lg">Out of Stock</h2>
                        <p className="text-2xl">{outOfStock}</p>
                    </div>
                </div>
            </div>

            {/* Latest Orders & Top Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-xl shadow-lg p-4 text-white">
                    <h3 className="font-bold text-xl mb-3">Latest Orders</h3>
                    <ul className="space-y-2">
                        {latestOrders.map(o => (
                            <li key={o._id} className="flex justify-between items-center p-2 bg-white/20 rounded hover:bg-white/30 transition">
                                <span>{o.user?.name || "Unknown"}</span>
                                <span className="font-semibold">${o.totalPrice}</span>
                                <span className={`px-2 py-1 rounded text-sm ${o.orderStatus === 'delivered' ? 'bg-green-500' : o.orderStatus === 'processing' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                    {o.orderStatus}
                                </span>
                            </li>
                        ))}
                        {latestOrders.length === 0 && <p className="text-gray-200">No orders yet.</p>}
                    </ul>
                </div>

                <div className="bg-white/10 rounded-xl shadow-lg p-4 text-white">
                    <h3 className="font-bold text-xl mb-3">Top Selling Products</h3>
                    <ul className="space-y-2">
                        {topProducts.map(p => (
                            <li key={p._id} className="flex items-center gap-3 p-2 bg-white/20 rounded hover:bg-white/30 transition">
                                <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} className="w-12 h-12 object-cover rounded" />
                                <span className="flex-1">{p.name}</span>
                                <span className="font-semibold">{p.sold || 0} sold</span>
                            </li>
                        ))}
                        {topProducts.length === 0 && <p className="text-gray-200">No products sold yet.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
}