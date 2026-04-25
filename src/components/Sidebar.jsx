import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    const linkClass = ({ isActive }) =>
        `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`;

    return (
        <div className="w-64 h-screen bg-gray-800 text-white p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Admin Menu</h2>
            <nav className="flex flex-col space-y-2">
                <Link to="/admin/orders" className={linkClass}>Orders</Link>
                <Link to="/admin/products" className={linkClass}>Products</Link>
                <Link to="/admin/users" className={linkClass}>Users</Link>
                <Link to="/admin/stats" className={linkClass}>Stats</Link>
            </nav>
        </div>
    );
}