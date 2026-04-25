import React, { useEffect, useState } from 'react';

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'auth-token': localStorage.getItem('token') },
            });
            const data = await res.json();
            setUsers(data);
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <ul className="space-y-2">
                {users?.map(user => (
                    <li key={user._id} className="bg-white p-2 rounded shadow flex justify-between">
                        <span>{user.name}</span>
                        <span>{user.email}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}