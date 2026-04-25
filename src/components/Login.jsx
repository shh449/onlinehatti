import React from 'react';
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function Login() {

    const navigate = useNavigate();

    const [crediantials, setcrediantials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleclick = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("https://onlinehattid-production.up.railway.app/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    email: crediantials.email,
                    password: crediantials.password
                })
            });

            const json = await response.json();

            if (response.ok && json.success) {

                localStorage.setItem("token", json.token);
                localStorage.setItem("user", JSON.stringify(json.user));

                if (json.user.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }

            } else {
                setError(json.message || "Invalid email or password");
            }

        } catch (err) {
            setError("Server error. Please try again later.");
        }

        setLoading(false);

        setTimeout(() => {
            setError("");
        }, 2000);
    };

    const onchange = (e) => {
        setcrediantials({ ...crediantials, [e.target.name]: e.target.value });
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(267deg, #124b68, #eb6a00)",
        }}>

            <Card
                sx={{
                    width: 400,
                    height: 545,
                    background: "#2a4ec838",
                    backdropFilter: "blur(10px)",
                    borderRadius: "35px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CardContent className="flex flex-col items-center gap-4 w-full">

                    <img src="/images/oh2.png" alt="logo" className=" w-89.75 h-54.5" />

                    {error && <Alert severity="error" className="w-full">{error}</Alert>}

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        onChange={onchange}
                        value={crediantials.email}
                        error={!!error}
                        className="w-77.25"
                        sx={{ width: "309px" }}
                    />

                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        onChange={onchange}
                        value={crediantials.password}
                        error={!!error}
                        className="w-77.25"
                        sx={{ width: "309px" }}
                    />

                    {/* 👇 UPDATED */}
                    <Typography
                        className="self-start ml-10 text-amber-600 cursor-pointer"
                        onClick={() => navigate("/forgotpassword")}
                    >
                        Forget password?
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleclick}
                        disabled={loading}
                        className="!bg-red-400 !text-black !rounded-xl !w-[113px]"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </Button>

                    <Typography>
                        Not a member?{" "}
                        <span
                            className="text-amber-600 cursor-pointer"
                            onClick={() => navigate("/signup")}
                        >
                            Sign up now
                        </span>
                    </Typography>

                </CardContent>
            </Card>
        </div>
    );
}