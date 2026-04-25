// src/services/api.js
const BASE_URL = "https://onlinehattid-production.up.railway.app/api";

export const apiGet = async (url) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${url}`, {
        headers: { "auth-token": token },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const apiPost = async (url, body) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${url}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "auth-token": token
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const apiPut = async (url, body) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${url}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "auth-token": token
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const apiDelete = async (url) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${url}`, {
        method: "DELETE",
        headers: { "auth-token": token },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};