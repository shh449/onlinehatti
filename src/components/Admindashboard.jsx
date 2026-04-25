import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { apiGet } from "../services/api";

// Import your admin components
import Orders from "./admin//Order";
import Products from "./admin//Products";
import Users from "./admin//Users";
import Stats from "./admin/Stats";

export default function AdminDashboard() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Orders");

    // Stats for navbar badges
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const toggleProfile = () => setProfileOpen(!profileOpen);
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const tabs = ["Orders", "Products", "Users", "Stats"];

    // Fetch data for badges
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedOrders = await apiGet("order/adminorder");
                const fetchedProducts = await apiGet("product/getallproducts");
                const fetchedUsers = await apiGet("admin/users");

                setOrders(fetchedOrders.orders || fetchedOrders || []);;
                setProducts(fetchedProducts.products || []);;
                setUsers(fetchedUsers.users || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Derived stats
    const pendingOrders = Array.isArray(orders) ? orders.filter(o => o.orderStatus !== "delivered").length : 0;
    const outOfStock = Array.isArray(products) ? products.filter(p => p.countInStock === 0).length : 0;
    const totalUsers = users.length;

    const renderContent = () => {
        switch (activeTab) {
            case "Orders": return <Orders />;
            case "Products": return <Products />;
            case "Users": return <Users />;
            case "Stats": return <Stats />;
            default: return <Orders />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] text-white">
            {/* Top Navbar */}
            <header className="flex items-center justify-between p-4 md:px-8 bg-gray-900/80 backdrop-blur-md shadow-md fixed w-full z-50">
                <div className="flex items-center gap-2">
                    <button className="md:hidden" onClick={toggleMenu}>
                        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                </div>

                {/* Desktop nav links with badges */}
                <nav className="hidden md:flex items-center gap-6">
                    {tabs.map(tab => {
                        let badge = null;
                        if (tab === "Orders" && pendingOrders > 0) badge = pendingOrders;
                        if (tab === "Products" && outOfStock > 0) badge = outOfStock;
                        if (tab === "Users" && totalUsers > 0) badge = totalUsers;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-3 py-2 rounded ${activeTab === tab ? "bg-gray-700" : "hover:bg-gray-700"
                                    } transition`}
                            >
                                {tab}
                                {badge && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Profile / Logout */}
                <div className="relative">
                    <button onClick={toggleProfile} className="flex items-center gap-2">
                        <FaUserCircle size={24} />
                        <span className="hidden md:inline">Admin</span>
                    </button>
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded shadow-lg py-2">
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Menu */}
            {menuOpen && (
                <nav className="md:hidden flex flex-col gap-2 bg-gray-900/90 backdrop-blur-md p-4 mt-16">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setMenuOpen(false);
                            }}
                            className={`py-2 px-4 rounded w-full text-left ${activeTab === tab ? "bg-gray-700" : "hover:bg-gray-700"
                                } transition`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            )}

            {/* Main Content */}
            <main className="pt-20 p-6 md:px-8">{renderContent()}</main>
        </div>
    );
}