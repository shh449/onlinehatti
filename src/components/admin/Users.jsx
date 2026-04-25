import React, { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
import { FaUser } from "react-icons/fa";

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const data = await apiGet("admin/users");
            setUsers(data);
        };
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-[#124b68] to-[#eb6a00] space-y-6">
            <h1 className="text-3xl font-bold text-white mb-6">Users Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {users.length > 0 ? users.map(u => (
                    <div
                        key={u._id}
                        className="bg-white/10 text-white p-4 rounded-xl shadow-lg hover:scale-105 transform transition flex flex-col gap-2"
                    >
                        <div className="flex items-center gap-3">
                            <FaUser size={30} />
                            <h2 className="font-bold text-lg">{u.name}</h2>
                        </div>
                        <p className="text-gray-200 text-sm break-all">{u.email}</p>
                        {u.createdAt && (
                            <p className="text-gray-300 text-xs">
                                Joined: {new Date(u.createdAt).toLocaleDateString()}
                            </p>
                        )}
                        {u.totalOrders !== undefined && (
                            <p className="text-gray-300 text-xs">
                                Orders: {u.totalOrders}
                            </p>
                        )}
                    </div>
                )) : (
                    <p className="text-white col-span-full">No users found.</p>
                )}
            </div>
        </div>
    );
}