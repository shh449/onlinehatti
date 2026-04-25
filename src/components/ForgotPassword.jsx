import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("https://onlinehattid-production.up.railway.app/api/auth/forgotpassword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const json = await response.json();

            if (json.success) {
                setMessage("Reset link sent to your email");
                setError("");
            } else {
                setError(json.message || "Failed to send reset link");
                setMessage("");
            }

        } catch (err) {
            setError("Server error");
            setMessage("");
        }

        setLoading(false);
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(267deg, #124b68, #eb6a00)"
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

                    <img src="/images/oh2.png" alt="logo" className="w-[359px] h-[218px]" />

                    {message && <Alert severity="success" className="w-full">{message}</Alert>}
                    {error && <Alert severity="error" className="w-full">{error}</Alert>}

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="w-[309px]"
                        sx={{
                            width: "309px",
                            input: { color: "white" },
                            label: { color: "white" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "white" },
                                "&:hover fieldset": { borderColor: "#eb6a00" },
                                "&.Mui-focused fieldset": { borderColor: "#eb6a00" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                                color: "#eb6a00",
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="!bg-red-400 !text-black !rounded-xl !w-[113px]"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <Typography className="text-white">
                        Remember your password?{" "}
                        <span
                            className="text-amber-600 cursor-pointer"
                            onClick={() => navigate("/login")}
                        >
                            Back to Login
                        </span>
                    </Typography>

                </CardContent>

            </Card>

        </div>
    );
}