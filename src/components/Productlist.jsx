import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import notecontext from "../../context/notecontext";
import Navbar from "./Navbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Modal, Box } from "@mui/material";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";




// ================= MAIN COMPONENT =================
export default function Productlist() {
    const { getCart } = useContext(notecontext);
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [shippingAddress, setShippingAddress] = useState({
        address: "",
        city: "",
        postalcode: "",
        country: "",
        contact: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const [notification, setNotification] = useState({
        message: "",
        type: "",
    });

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();

    // ================= FETCH PRODUCTS =================
    const fetchProducts = async (pageNumber = 1) => {
        try {
            const res = await fetch(
                `https://onlinehattid-production.up.railway.app/api/product/getallproducts?page=${pageNumber}&limit=12`
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to fetch products");

            if (pageNumber === 1) {
                setProducts(data.products || []);
            } else {
                setProducts((prev) => [...prev, ...(data.products || [])]);
            }

            setHasMore(data.hasMore);
        } catch (err) {
            console.error("Fetch products error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // ================= AUTH CHECK =================
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            window.location.href = "/login";
        } else {
            fetchProducts();
        }
    }, []);

    // ================= INFINITE SCROLL =================
    const lastProductRef = useCallback(
        (node) => {
            if (loading) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev) => prev + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    useEffect(() => {
        if (page > 1) fetchProducts(page);
    }, [page]);

    // ================= FILTER =================
    const filteredProducts = products.filter((p) => {
        const matchCategory =
            category === "all" || p.category?.toLowerCase() === category;

        const matchSearch = p.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchCategory && matchSearch;
    });

    // ================= ACTIONS =================
    const handleViewDetails = (id) => navigate(`/product/${id}`);

    const handleOrder = (item) => {
        setSelectedProduct(item);
        setQuantity(1);
        setShowModal(true);
        setSelectedOrderId(null);
        setPaymentMethod("COD");
    };

    const calculatePrice = (prod) =>
        prod.discountedPrice ? prod.discountedPrice : prod.price;

    const calculateTotal = (prod, qty) => {
        const price = calculatePrice(prod);
        const delivery = prod.deliveryCharge || 5;
        return price * qty + delivery;
    };

    // ================= JAZZCASH FORM =================
    const submitJazzCashForm = (data, url) => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = url;

        Object.keys(data).forEach((key) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = data[key];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    // ================= PLACE ORDER =================
    const placeOrder = async () => {
        if (!selectedProduct) return;

        const payload = {
            productId: selectedProduct._id,
            quantity,
            shippingAddress,
            paymentMethod,
        };

        try {
            const res = await fetch(
                "https://onlinehattid-production.up.railway.app/api/order/placeorder",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                return setNotification({
                    message: data.message || "Order failed",
                    type: "error",
                });
            }

            const orderId = data.orderId;

            // STRIPE
            if (paymentMethod === "Online") {
                setSelectedOrderId(orderId);
            }

            // JAZZCASH
            else if (paymentMethod === "JazzCash") {
                const jcRes = await fetch(
                    "https://onlinehattid-production.up.railway.app/api/payment/jazzcash/initiate",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId }),
                    }
                );

                const jcData = await jcRes.json();

                if (jcData.paymentData && jcData.url) {
                    submitJazzCashForm(jcData.paymentData, jcData.url);
                } else {
                    throw new Error("JazzCash failed");
                }
            }

            // EASYPAISA
            else if (paymentMethod === "Easypaisa") {
                const epRes = await fetch(
                    "https://onlinehattid-production.up.railway.app/api/payment/easypaisa/initiate",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId }),
                    }
                );

                const epData = await epRes.json();

                if (epData.paymentUrl) {
                    window.location.href = epData.paymentUrl;
                } else {
                    throw new Error("Easypaisa failed");
                }
            }

            // COD
            else {
                setNotification({
                    message: "Order placed successfully!",
                    type: "success",
                });
                setShowModal(false);
                getCart();
                fetchProducts(1);
            }
        } catch (err) {
            setNotification({
                message: err.message || "Something went wrong",
                type: "error",
            });
        }

        setTimeout(
            () => setNotification({ message: "", type: "" }),
            3000
        );
    };

    // ================= LOADING =================
    if (loading && page === 1)
        return (
            <>
                <Navbar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onCategorySelect={setCategory}
                />
                <div className="pt-24 flex justify-center items-center min-h-screen">
                    <Spinner />
                </div>
            </>
        );

    // ================= UI =================
    return (
        <>
            <Navbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onCategorySelect={setCategory}
            />

            <div className="pt-20 sm:pt-24 min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] px-3 sm:px-6 lg:px-12">
                {notification.message && (
                    <div
                        className={`fixed top-4 right-4 px-4 py-2 rounded text-white z-50 ${notification.type === "success"
                            ? "bg-green-500"
                            : "bg-red-500"
                            }`}
                    >
                        {notification.message}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((item, index) => {
                        const productContent = (
                            <div
                                key={item._id}
                                className="bg-white/20 p-4 rounded-xl text-white shadow-lg transition md:hover:scale-105 active:scale-95"
                            >
                                <img
                                    src={item.images?.[0]}
                                    onClick={() =>
                                        handleViewDetails(item._id)
                                    }
                                    className="h-40 w-full object-contain rounded mb-2 cursor-pointer hover:object-cover"
                                />

                                <h2
                                    className="font-bold text-lg cursor-pointer"
                                    onClick={() =>
                                        handleViewDetails(item._id)
                                    }
                                >
                                    {item.name}
                                </h2>

                                {item.discountedPrice ? (
                                    <p>
                                        <span className="line-through mr-2">
                                            ${item.price}
                                        </span>
                                        <span className="font-bold">
                                            ${item.discountedPrice}
                                        </span>
                                    </p>
                                ) : (
                                    <p>${item.price}</p>
                                )}

                                <p className="mb-2">
                                    Stock: {item.countInStock}
                                </p>

                                {item.deliveryCharge && (
                                    <p className="mb-2 text-sm">
                                        Delivery: ${item.deliveryCharge}
                                    </p>
                                )}

                                <Button
                                    fullWidth
                                    onClick={() =>
                                        handleViewDetails(item._id)
                                    }
                                    sx={{
                                        background: "#124b68",
                                        color: "white",
                                        mt: 2,
                                        "&:hover": {
                                            background: "#0d3b52",
                                        },
                                    }}
                                >
                                    View Details
                                </Button>

                                <Button
                                    fullWidth
                                    onClick={() => handleOrder(item)}
                                    disabled={item.countInStock === 0}
                                    sx={{
                                        background: "#eb6a00",
                                        color: "white",
                                        mt: 1,
                                        "&:hover": {
                                            background: "#cf5d00",
                                        },
                                    }}
                                >
                                    {item.countInStock === 0
                                        ? "Out of stock"
                                        : "Order"}
                                </Button>
                            </div>
                        );

                        return filteredProducts.length === index + 1 ? (
                            <div ref={lastProductRef} key={item._id}>
                                {productContent}
                            </div>
                        ) : (
                            productContent
                        );
                    })}
                </div>

                {loading && page > 1 && (
                    <div className="flex justify-center py-6">
                        <Spinner />
                    </div>
                )}

                {/* MODAL (UNCHANGED UI) */}
                <Modal open={showModal} onClose={() => setShowModal(false)}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: {
                                xs: "95%",
                                sm: "80%",
                                md: "450px",
                            },
                            maxHeight: "90vh",
                            overflowY: "auto",
                            bgcolor: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(16px)",
                            borderRadius: 3,
                            boxShadow: 24,
                            p: 3,
                            color: "white",
                            scrollBehavior: "smooth",
                        }}
                    >
                        <Typography
                            variant="h6"
                            className="text-center mb-4 font-bold"
                        >
                            Order Summary
                        </Typography>

                        {selectedProduct && (
                            <>
                                <div className="flex justify-between mb-3">
                                    <span>{selectedProduct.name}</span>
                                    <span>
                                        {selectedProduct.discountedPrice ? (
                                            <>
                                                <span className="line-through mr-1">
                                                    ${selectedProduct.price}
                                                </span>
                                                <span className="font-bold">
                                                    $
                                                    {
                                                        selectedProduct.discountedPrice
                                                    }
                                                </span>
                                            </>
                                        ) : (
                                            `$${selectedProduct.price}`
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mb-3">
                                    <span>Quantity</span>
                                    <div className="flex gap-2 items-center">
                                        <Button
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    q > 1 ? q - 1 : 1
                                                )
                                            }
                                            sx={{
                                                background:
                                                    "rgba(235,106,0,0.8)",
                                                color: "white",
                                                minWidth: "45px",
                                                fontSize: "18px",
                                                "&:hover": {
                                                    background:
                                                        "rgba(207,93,0,0.8)",
                                                },
                                            }}
                                        >
                                            −
                                        </Button>

                                        <span className="px-3">
                                            {quantity}
                                        </span>

                                        <Button
                                            onClick={() =>
                                                quantity <
                                                selectedProduct.countInStock &&
                                                setQuantity((q) => q + 1)
                                            }
                                            sx={{
                                                background:
                                                    "rgba(235,106,0,0.8)",
                                                color: "white",
                                                minWidth: "45px",
                                                fontSize: "18px",
                                                "&:hover": {
                                                    background:
                                                        "rgba(207,93,0,0.8)",
                                                },
                                            }}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between mb-1">
                                    <span>Subtotal</span>
                                    <span>
                                        $
                                        {calculatePrice(selectedProduct) *
                                            quantity}
                                    </span>
                                </div>

                                <div className="flex justify-between mb-3">
                                    <span>Delivery</span>
                                    <span>
                                        $
                                        {selectedProduct.deliveryCharge || 5}
                                    </span>
                                </div>

                                <div className="flex justify-between font-bold mb-4">
                                    <span>Total</span>
                                    <span>
                                        $
                                        {calculateTotal(
                                            selectedProduct,
                                            quantity
                                        )}
                                    </span>
                                </div>
                            </>
                        )}

                        <Typography
                            variant="subtitle1"
                            sx={{ mb: 1 }}
                        >
                            Shipping Information
                        </Typography>

                        {["address", "city", "postalcode", "country", "contact"].map(
                            (field) => (
                                <input
                                    key={field}
                                    placeholder={
                                        field.charAt(0).toUpperCase() +
                                        field.slice(1)
                                    }
                                    className="w-full mb-2 p-2 rounded-lg bg-black/40 text-white placeholder-gray-300 border border-gray-300 focus:border-orange-400 focus:outline-none"
                                    onChange={(e) =>
                                        setShippingAddress({
                                            ...shippingAddress,
                                            [field]: e.target.value,
                                        })
                                    }
                                />
                            )
                        )}

                        <Typography
                            variant="subtitle1"
                            sx={{ mb: 1 }}
                        >
                            Payment Method
                        </Typography>

                        <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                            className="w-full mb-3 p-2 text-white bg-black/40 rounded border border-gray-300 focus:border-orange-400 focus:outline-none"
                        >
                            <option value="COD">
                                Cash on Delivery
                            </option>


                            <option value="Easypaisa">
                                Easypaisa
                            </option>
                        </select>



                        {!selectedOrderId && (
                            <Button
                                fullWidth
                                onClick={placeOrder}
                                sx={{
                                    background: "#6b4f2c",
                                    color: "white",
                                    mt: 1,
                                }}
                            >
                                Place Order
                            </Button>
                        )}

                        <Button
                            fullWidth
                            onClick={() => setShowModal(false)}
                            sx={{
                                background: "gray",
                                color: "white",
                                mt: 1,
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Modal>
            </div>
        </>
    );
}