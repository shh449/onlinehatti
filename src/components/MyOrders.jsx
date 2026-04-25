import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Button, Modal, Box, Typography } from "@mui/material";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [open, setOpen] = useState(false);
    const [notification, setNotification] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/order/myorders", {
                headers: { "auth-token": localStorage.getItem("token") },
            });
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error(err);
        }
    };

    const cancelOrder = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/order/cancel/${id}`, {
                method: "PUT",
                headers: { "auth-token": localStorage.getItem("token") },
            });
            const data = await res.json();
            setNotification(data.message);
            fetchOrders();
        } catch (err) {
            console.error(err);
        }
        setTimeout(() => setNotification(""), 3000);
    };

    const deleteOrder = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/order/delete/${id}`, {
                method: "DELETE",
                headers: { "auth-token": localStorage.getItem("token") },
            });
            const data = await res.json();
            setNotification(data.message);
            fetchOrders();
        } catch (err) {
            console.error(err);
        }
        setTimeout(() => setNotification(""), 3000);
    };

    return (
        <>
            <Navbar />

            <div className="pt-20 sm:pt-24 min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] px-3 sm:px-6 lg:px-12 text-white">
                <h1 className="text-2xl font-bold mb-6">My Orders</h1>

                {notification && (
                    <div className="fixed top-4 right-4 bg-green-500 px-4 py-2 rounded z-50">
                        {notification}
                    </div>
                )}

                <div className="grid gap-4">
                    {orders.length === 0 ? (
                        <p>No orders yet</p>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white/20 backdrop-blur-lg p-4 rounded-xl shadow-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3 transition md:hover:scale-105 active:scale-95"
                            >
                                <div>
                                    <p><b>Order ID:</b> {order._id}</p>
                                    <p><b>Total:</b> ${order.totalPrice}</p>
                                    <p><b>Payment:</b> {order.paymentMethod}</p>
                                    <p>
                                        <b>Status:</b>
                                        <span
                                            className={`ml-2 px-2 py-1 rounded ${order.orderStatus === "Pending" ? "bg-yellow-500" :
                                                order.orderStatus === "Paid" ? "bg-green-500" :
                                                    order.orderStatus === "Delivered" ? "bg-blue-500" :
                                                        order.orderStatus === "Cancelled" ? "bg-red-500" : ""
                                                }`}
                                        >
                                            {order.orderStatus}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setOpen(true);
                                        }}
                                        sx={{ background: "#124b68" }}
                                    >
                                        Details
                                    </Button>

                                    {order.orderStatus === "Pending" && (
                                        <Button
                                            variant="contained"
                                            onClick={() => cancelOrder(order._id)}
                                            sx={{ background: "red" }}
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                    <Button
                                        variant="contained"
                                        onClick={() => deleteOrder(order._id)}
                                        sx={{ background: "#6b4f2c" }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal for Order Details */}
                <Modal open={open} onClose={() => setOpen(false)}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: { xs: "95%", sm: "80%", md: "500px" },
                            maxHeight: "90vh",
                            overflowY: "auto",
                            bgcolor: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(12px)",
                            borderRadius: 3,
                            boxShadow: 24,
                            p: 3,
                            color: "white",
                        }}
                    >
                        <Typography variant="h6" className="mb-3">
                            Order Details
                        </Typography>

                        {selectedOrder && (
                            <>
                                {selectedOrder.orderitems.length === 0 ? (
                                    <p className="text-red-400">
                                        No items in this order (products might have been removed)
                                    </p>
                                ) : (
                                    selectedOrder.orderitems.map((item) => (
                                        <div key={item._id} className="flex justify-between mb-2 flex-col">
                                            <span>
                                                {item.product
                                                    ? `${item.product.name} x ${item.quantity}`
                                                    : "Product removed"}
                                            </span>
                                            {item.selectedOptions && (
                                                <span className="text-gray-300">
                                                    Options: {Object.entries(item.selectedOptions).map(([key, val]) => `${key}: ${val}`).join(", ")}
                                                </span>
                                            )}
                                            <span>
                                                {item.product ? `$${item.product.price * item.quantity}` : "-"}
                                            </span>
                                        </div>
                                    ))
                                )}

                                <hr className="my-3" />

                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>
                                        ${selectedOrder.orderitems.reduce((acc, item) => {
                                            if (!item.product) return acc;
                                            return acc + item.product.price * item.quantity;
                                        }, 0)}
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <p><b>Address:</b> {selectedOrder.shippingAddress.address}</p>
                                    <p><b>City:</b> {selectedOrder.shippingAddress.city}</p>
                                    <p><b>Postal:</b> {selectedOrder.shippingAddress.postalcode}</p>
                                    <p><b>Country:</b> {selectedOrder.shippingAddress.country}</p>
                                </div>
                            </>
                        )}

                        <Button
                            fullWidth
                            onClick={() => setOpen(false)}
                            sx={{ background: "gray", color: "white", mt: 2 }}
                        >
                            Close
                        </Button>
                    </Box>
                </Modal>
            </div>
        </>
    );
}