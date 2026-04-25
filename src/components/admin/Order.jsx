import React, { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete } from "../../services/api";
import { Modal, Box, Typography, Button } from "@mui/material";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    // NEW STATES
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");
    const [paidFilter, setPaidFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("latest");

    const fetchOrders = async () => {
        try {
            const data = await apiGet("order/adminorder");
            const formatted = data.map((o) => ({ ...o, orderitems: o.orderitems || [] }));
            setOrders(formatted);
            setFilteredOrders(formatted);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // FILTER + SEARCH + SORT
    useEffect(() => {
        let temp = [...orders];

        if (search) {
            temp = temp.filter((o) =>
                o._id.toLowerCase().includes(search.toLowerCase()) ||
                o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                o.user?.email?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (statusFilter) {
            temp = temp.filter((o) => o.orderStatus === statusFilter);
        }

        if (paymentFilter) {
            temp = temp.filter((o) => o.paymentMethod === paymentFilter);
        }

        if (paidFilter) {
            temp = temp.filter((o) =>
                paidFilter === "paid" ? o.isPaid : !o.isPaid
            );
        }

        if (sortOrder === "latest") {
            temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortOrder === "oldest") {
            temp.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortOrder === "price") {
            temp.sort((a, b) => b.totalPrice - a.totalPrice);
        }

        setFilteredOrders(temp);
    }, [search, statusFilter, paymentFilter, paidFilter, sortOrder, orders]);

    const updateStatus = async (id, status) => {
        try {
            const res = await apiPut(`order/status/${id}`, { status });
            setOrders((prev) => prev.map((o) => (o._id === id ? res.order : o)));
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const deleteOrder = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            await apiDelete(`order/delete/${id}`);
            setOrders((prev) => prev.filter((o) => o._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete order");
        }
    };

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setOpenModal(false);
    };

    const statusColors = {
        processing: "bg-yellow-500",
        shipped: "bg-blue-500",
        delivered: "bg-green-500",
        cancelled: "bg-red-500",
        pending: "bg-gray-500"
    };

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-[#124b68] to-[#eb6a00]">
            <h1 className="text-3xl font-bold text-white mb-6">Orders Dashboard</h1>

            {/* FILTER BAR */}
            <div className="bg-white/10 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                    type="text"
                    placeholder="Search by Order ID / User / Email"
                    className="p-2 rounded bg-gray-800 text-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="p-2 rounded bg-gray-800 text-white"
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                </select>

                <select
                    className="p-2 rounded bg-gray-800 text-white"
                    onChange={(e) => setPaymentFilter(e.target.value)}
                >
                    <option value="">All Payments</option>
                    <option value="COD">COD</option>
                    <option value="ONLINE">Online</option>
                </select>

                <select
                    className="p-2 rounded bg-gray-800 text-white"
                    onChange={(e) => setPaidFilter(e.target.value)}
                >
                    <option value="">All Paid Status</option>
                    <option value="paid">Paid</option>
                    <option value="notpaid">Not Paid</option>
                </select>

                <select
                    className="p-2 rounded bg-gray-800 text-white"
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price">Highest Price</option>
                </select>
            </div>

            {/* ORDERS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                    <div key={order._id} className="bg-gray-800 p-4 rounded-lg shadow text-white">
                        <h2 className="font-bold mb-2">Order ID: {order._id}</h2>
                        <p>User: {order.user?.name} ({order.user?.email})</p>
                        <p>Total: ${order.totalPrice}</p>

                        {/* PAYMENT INFO */}
                        <p className="mt-1">
                            Payment:
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${order.paymentMethod === "COD" ? "bg-yellow-600" : "bg-green-600"}`}>
                                {order.paymentMethod}
                            </span>
                        </p>

                        <p className="text-sm">
                            Paid:
                            <span className={`ml-2 font-bold ${order.isPaid ? "text-green-400" : "text-red-400"}`}>
                                {order.isPaid ? "Paid" : "Not Paid"}
                            </span>
                        </p>

                        <p className={`inline-block px-2 py-1 rounded ${statusColors[order.orderStatus]} mt-1`}>
                            {order.orderStatus}
                        </p>

                        {/* ITEMS */}
                        <div className="mt-2">
                            <h3 className="font-semibold">Items:</h3>
                            {order.orderitems.map((item) => (
                                <div key={item.product?._id} className="flex items-center gap-2 mt-1 bg-white/10 p-2 rounded">
                                    <img
                                        src={item.selectedImage || item.product?.images[0]}
                                        alt=""
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.product?.name}</p>
                                        <p className="text-sm">Qty: {item.quantity}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">Color:</span>
                                            {item.selectedOptions?.color ? (
                                                <div
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: item.selectedOptions.color }}
                                                ></div>
                                            ) : (
                                                <span className="text-sm">Default</span>
                                            )}
                                        </div>

                                        <p className="text-sm">
                                            Size: {item.selectedOptions?.size || "Default"}
                                        </p>
                                    </div>
                                    <div className="font-bold">
                                        ${item.quantity * (item.product?.price || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-4 flex justify-between items-center">
                            <select
                                value={order.orderStatus}
                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                className="bg-gray-700 text-white p-1 rounded"
                            >
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <button
                                onClick={() => deleteOrder(order._id)}
                                className={`p-2 rounded text-white ${order.orderStatus === "delivered"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-gray-500 cursor-not-allowed"
                                    }`}
                                disabled={order.orderStatus !== "delivered"}
                            >
                                Delete
                            </button>
                        </div>

                        <Button
                            variant="contained"
                            sx={{ mt: 2, background: "#eb6a00", textTransform: "none" }}
                            onClick={() => handleOpenModal(order)}
                        >
                            View Details
                        </Button>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: 500,
                        bgcolor: "#1f2937",
                        borderRadius: 3,
                        p: 4,
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}
                >
                    {selectedOrder && (
                        <>
                            <Typography variant="h6" className="text-white font-bold mb-4">
                                Order Details
                            </Typography>

                            <Typography className="text-gray-200 mb-2">
                                <strong>Order ID:</strong> {selectedOrder._id}
                            </Typography>
                            <Typography className="text-gray-200 mb-2">
                                <strong>User:</strong> {selectedOrder.user?.name} ({selectedOrder.user?.email})
                            </Typography>
                            <Typography className="text-gray-200 mb-2">
                                <strong>Total Price:</strong> ${selectedOrder.totalPrice}
                            </Typography>
                            <Typography className="text-gray-200 mb-2">
                                <strong>Status:</strong> {selectedOrder.orderStatus}
                            </Typography>

                            {/* PAYMENT DETAILS */}
                            <Typography className="text-gray-200 mb-2">
                                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                            </Typography>
                            <Typography className="text-gray-200 mb-2">
                                <strong>Paid:</strong> {selectedOrder.isPaid ? "Yes" : "No"}
                            </Typography>
                            {selectedOrder.isPaid && (
                                <Typography className="text-gray-200 mb-2">
                                    <strong>Paid At:</strong>{" "}
                                    {new Date(selectedOrder.paidAt).toLocaleString()}
                                </Typography>
                            )}

                            <Typography className="text-gray-200 mb-2">
                                <strong>Shipping Address:</strong>{" "}
                                {selectedOrder.shippingAddress?.address},{" "}
                                {selectedOrder.shippingAddress?.city},{" "}
                                {selectedOrder.shippingAddress?.postalcode},{" "}
                                {selectedOrder.shippingAddress?.country}
                            </Typography>

                            <Typography className="text-white font-bold mt-4 mb-2">Items:</Typography>
                            <div className="flex flex-col gap-3">
                                {selectedOrder.orderitems.map((item) => (
                                    <div key={item.product?._id} className="flex gap-3 items-center bg-white/10 p-2 rounded">
                                        <img
                                            src={item.selectedImage || item.product?.images[0]}
                                            alt=""
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">{item.product?.name}</p>
                                            <p className="text-gray-200 text-sm">Qty: {item.quantity}</p>
                                            <div className="flex items-center gap-2"><span className="text-sm">Color:</span>{item.selectedOptions?.color ? (<div className="w-4 h-4 rounded-full border" style={{ backgroundColor: item.selectedOptions.color }}></div>) : (<span className="text-sm">Default</span>)}</div><p className="text-sm">Size: {item.selectedOptions?.size || "Default"}</p>
                                        </div>
                                        <div className="bg-[#eb6a00] px-2 py-1 rounded text-white font-bold">
                                            ${item.quantity * (item.product?.price || 0)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Button
                                    variant="contained"
                                    sx={{ background: "#eb6a00", textTransform: "none" }}
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
}