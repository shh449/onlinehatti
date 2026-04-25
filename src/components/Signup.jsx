import React from 'react';
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {

    const [crediantials, setcrediantials] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleclick = async (e) => {
        e.preventDefault();

        setErrors({});

        try {
            const response = await fetch("https://onlinehattid-production.up.railway.app/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    name: crediantials.name,
                    email: crediantials.email,
                    password: crediantials.password
                })
            });

            const json = await response.json();

            if (json.success) {
                localStorage.setItem("token", json.token);
                navigate("/");
            } else {

                let fieldErrors = {};

                if (Array.isArray(json.error)) {
                    json.error.forEach(err => {
                        fieldErrors[err.path] = err.msg;
                    });
                } else if (typeof json.error === "string") {
                    fieldErrors.general = json.error;
                } else {
                    fieldErrors.general = "Something went wrong";
                }

                setErrors(fieldErrors);
            }

        } catch (error) {
            setErrors({
                general: "Server error. Please try again later."
            });
        }
    };

    const onchange = (e) => {
        setcrediantials({
            ...crediantials,
            [e.target.name]: e.target.value
        });
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

                    <img
                        src="/images/oh2.png"
                        alt="logo"
                        className="w-[359px] h-[218px]"
                    />

                    {/* General Error */}
                    {errors.general && (
                        <Alert severity="error" className="w-[309px]">
                            {errors.general}
                        </Alert>
                    )}

                    <form onSubmit={handleclick} className="flex flex-col items-center gap-4 w-full">

                        <TextField
                            label="name"
                            name="name"
                            type="text"
                            onChange={onchange}
                            error={!!errors.name}
                            helperText={errors.name}
                            value={crediantials.name}
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

                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            onChange={onchange}
                            error={!!errors.email}
                            helperText={errors.email}
                            value={crediantials.email}
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

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            onChange={onchange}
                            error={!!errors.password}
                            helperText={errors.password}
                            value={crediantials.password}
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
                            type="submit"
                            variant="contained"
                            className="!bg-red-400 !text-black !rounded-xl !w-[113px]"
                        >
                            Sign Up
                        </Button>

                    </form>

                    <Typography>
                        Already a member?{" "}
                        <span
                            className="text-amber-600 cursor-pointer"
                            onClick={() => navigate("/login")}
                        >
                            Login now
                        </span>
                    </Typography>

                </CardContent>
            </Card>
        </div>
    );
}