import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {

    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`https://onlinehattid-production.up.railway.app/api/auth/resetpassword/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });

            const json = await response.json();

            if (json.success) {
                setMessage("Password reset successful! Redirecting to login...");
                setError("");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError(json.message || "Failed to reset password");
                setMessage("");
            }

        } catch (err) {
            setError("Server error. Please try again later.");
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
                        label="New Password"
                        name="password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
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
                        {loading ? "Resetting..." : "Reset Password"}
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