import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminRoutes({ children }) {
    const [isAdmin, setIsAdmin] = useState(null); // null while checking

    useEffect(() => {
        const checkAdmin = async () => {
            // First, check localStorage
            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");

            if (!token || !user || user.role !== "admin") {
                setIsAdmin(false);
                return;
            }

            // Optional: verify token with backend
            try {
                const res = await fetch("https://onlinehattid-production.up.railway.app/api/auth/fetchuser", {
                    method: "GET",
                    headers: {
                        "auth-token": token
                    }
                });

                const data = await res.json();

                if (data.success && data.user.role === "admin") {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    if (isAdmin === null) return <div>Loading...</div>; // still checking

    if (!isAdmin) return <Navigate to="/login" />;

    return children; // render admin page
}