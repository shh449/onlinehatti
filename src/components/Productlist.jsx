import React, {
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
} from "react";

import notecontext from "../../context/notecontext";
import Navbar from "./Navbar";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Modal, Box } from "@mui/material";

import { useNavigate } from "react-router-dom";

import Spinner from "./Spinner";

import {
    FaShoppingCart,
    FaEye,
    FaBoxOpen,
    FaFire,
    FaArrowRight,
    FaStar,
} from "react-icons/fa";

import { MdDiscount } from "react-icons/md";

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

    // ================= CATEGORIES =================
    const categories = [
        "all",
        "clothes",
        "shoes",
        "watches",
        "fashion bags",
        "mens clothes",
        "kids clothes",
        "kithchenware",
        "home decore",
        "Electronic Accessories",
    ];

    // ================= FETCH PRODUCTS =================
    const fetchProducts = async (pageNumber = 1) => {
        try {
            const res = await fetch(
                `https://onlinehattid-production.up.railway.app/api/product/getallproducts?page=${pageNumber}&limit=12`
            );

            const data = await res.json();

            if (!res.ok)
                throw new Error(
                    data.message || "Failed to fetch products"
                );

            if (pageNumber === 1) {
                setProducts(data.products || []);
            } else {
                setProducts((prev) => [
                    ...prev,
                    ...(data.products || []),
                ]);
            }

            setHasMore(data.hasMore);
        } catch (err) {
            console.error(
                "Fetch products error:",
                err.message
            );
        } finally {
            setLoading(false);
        }
    };

    // ================= AUTH =================
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

            if (observer.current)
                observer.current.disconnect();

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (
                        entries[0].isIntersecting &&
                        hasMore
                    ) {
                        setPage((prev) => prev + 1);
                    }
                }
            );

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
            category === "all" ||
            p.category?.toLowerCase() ===
            category.toLowerCase();

        const matchSearch = p.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchCategory && matchSearch;
    });

    // ================= CATEGORY SECTION PRODUCTS =================
    const getCategoryProducts = (cat) => {
        return products.filter(
            (p) =>
                p.category?.toLowerCase() ===
                cat.toLowerCase()
        );
    };

    // ================= ACTIONS =================
    const handleViewDetails = (id) =>
        navigate(`/product/${id}`);

    const handleOrder = (item) => {
        setSelectedProduct(item);

        setQuantity(1);

        setShowModal(true);

        setSelectedOrderId(null);

        setPaymentMethod("COD");
    };

    // ================= PRICE =================
    const calculatePrice = (prod) =>
        prod.discountedPrice
            ? prod.discountedPrice
            : prod.price;

    const calculateTotal = (prod, qty) => {
        const price = calculatePrice(prod);

        const delivery =
            prod.deliveryCharge || 5;

        return price * qty + delivery;
    };

    // ================= ORDER =================
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
                        "Content-Type":
                            "application/json",

                        "auth-token":
                            localStorage.getItem(
                                "token"
                            ),
                    },

                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                return setNotification({
                    message:
                        data.message ||
                        "Order failed",

                    type: "error",
                });
            }

            setNotification({
                message:
                    "Order placed successfully!",

                type: "success",
            });

            setShowModal(false);

            getCart();

            fetchProducts(1);
        } catch (err) {
            setNotification({
                message:
                    err.message ||
                    "Something went wrong",

                type: "error",
            });
        }

        setTimeout(
            () =>
                setNotification({
                    message: "",
                    type: "",
                }),
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
                    activeCategory={category}
                />

                <div className="pt-24 flex justify-center items-center min-h-screen bg-gradient-to-br from-[#124b68] via-[#1b5d7e] to-[#eb6a00]">
                    <Spinner />
                </div>
            </>
        );

    // ================= PRODUCT CARD =================
    const ProductCard = (
        item,
        index,
        arrLength
    ) => {
        const card = (
            <div
                key={item._id}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-2xl text-white shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-orange-500/20 active:scale-95"
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                {/* Hot Badge */}
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                    <FaFire />
                    Hot
                </div>

                {/* Image */}
                <div className="bg-white/5 rounded-2xl p-2 mb-3">
                    <img
                        src={item.images?.[0]}
                        onClick={() =>
                            handleViewDetails(
                                item._id
                            )
                        }
                        className="h-40 sm:h-48 w-full object-contain rounded-xl cursor-pointer transition-all duration-300 group-hover:scale-105"
                    />
                </div>

                {/* Name */}
                <h2
                    className="font-bold text-sm sm:text-base lg:text-lg cursor-pointer line-clamp-2 min-h-[48px]"
                    onClick={() =>
                        handleViewDetails(
                            item._id
                        )
                    }
                >
                    {item.name}
                </h2>

                {/* Price */}
                <div className="flex items-center gap-2 flex-wrap mt-2">
                    {item.discountedPrice ? (
                        <>
                            <span className="line-through text-white/60 text-sm">
                                {item.price}Rs
                            </span>

                            <span className="text-lg sm:text-xl font-extrabold text-yellow-300 flex items-center gap-1">
                                <MdDiscount />
                                {
                                    item.discountedPrice
                                }
                                Rs
                            </span>
                        </>
                    ) : (
                        <span className="text-lg font-bold text-orange-200">
                            {item.price}Rs
                        </span>
                    )}
                </div>

                {/* Stock */}
                <div className="flex items-center justify-between mt-3 mb-2">
                    <div className="flex items-center gap-2 text-sm">
                        <FaBoxOpen className="text-orange-300" />

                        <span>
                            Stock:{" "}
                            {
                                item.countInStock
                            }
                        </span>
                    </div>

                    <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${item.countInStock > 0
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                            }`}
                    >
                        {item.countInStock > 0
                            ? "Available"
                            : "Out"}
                    </span>
                </div>

                {/* Buttons */}
                <Button
                    fullWidth
                    startIcon={<FaEye />}
                    onClick={() =>
                        handleViewDetails(
                            item._id
                        )
                    }
                    sx={{
                        background: "#124b68",

                        color: "white",

                        mt: 2,

                        borderRadius: "12px",

                        padding: "10px",

                        fontWeight: "bold",

                        textTransform: "none",

                        fontSize: {
                            xs: "12px",
                            sm: "14px",
                        },

                        boxShadow:
                            "0 4px 14px rgba(0,0,0,0.2)",

                        "&:hover": {
                            background: "#0d3b52",

                            transform:
                                "translateY(-2px)",
                        },
                    }}
                >
                    View Details
                </Button>

                <Button
                    fullWidth
                    startIcon={
                        <FaShoppingCart />
                    }
                    onClick={() =>
                        handleOrder(item)
                    }
                    disabled={
                        item.countInStock === 0
                    }
                    sx={{
                        background: "#eb6a00",

                        color: "white",

                        mt: 1,

                        borderRadius: "12px",

                        padding: "10px",

                        fontWeight: "bold",

                        textTransform: "none",

                        fontSize: {
                            xs: "12px",
                            sm: "14px",
                        },

                        boxShadow:
                            "0 4px 14px rgba(0,0,0,0.2)",

                        "&:hover": {
                            background: "#cf5d00",

                            transform:
                                "translateY(-2px)",
                        },
                    }}
                >
                    {item.countInStock === 0
                        ? "Out of stock"
                        : "Order"}
                </Button>
            </div>
        );

        return arrLength === index + 1 ? (
            <div
                ref={lastProductRef}
                key={item._id}
            >
                {card}
            </div>
        ) : (
            card
        );
    };

    // ================= UI =================
    return (
        <>
            <Navbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onCategorySelect={setCategory}
                activeCategory={category}
            />

            <div
                className="pt-24 sm:pt-28 min-h-screen bg-gradient-to-br from-[#124b68] via-[#1b5d7e] to-[#eb6a00] px-3 sm:px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-24 pb-10"
                style={{
                    scrollBehavior: "smooth",
                }}
            >
                {/* Notification */}
                {notification.message && (
                    <div
                        className={`fixed top-4 right-4 px-4 py-2 rounded-xl text-white z-50 shadow-2xl ${notification.type ===
                                "success"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                    >
                        {notification.message}
                    </div>
                )}

                {/* Hero */}
                <div className="text-center mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg mb-4">
                        <FaShoppingCart className="text-orange-300 text-sm" />

                        <span className="text-sm tracking-wide text-white font-medium">
                            Trending Products
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-white tracking-tight leading-tight">
                        Just for you
                    </h2>

                    <p className="text-white/70 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
                        Discover premium products
                        with unbeatable prices and
                        fast delivery.
                    </p>

                    <div className="w-28 h-1 bg-gradient-to-r from-orange-400 via-white to-orange-300 mx-auto mt-5 rounded-full shadow-lg"></div>
                </div>

                {/* ================= HOME CATEGORY SECTIONS ================= */}
                {category === "all" ? (
                    <>
                        {categories
                            .filter((c) => c !== "all")
                            .map((cat) => {
                                const categoryProducts =
                                    getCategoryProducts(
                                        cat
                                    );

                                if (
                                    categoryProducts.length ===
                                    0
                                )
                                    return null;

                                return (
                                    <div
                                        key={cat}
                                        className="mb-14"
                                    >
                                        {/* Heading */}
                                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FaStar className="text-orange-300" />

                                                    <span className="text-orange-200 text-sm uppercase tracking-widest">
                                                        Collection
                                                    </span>
                                                </div>

                                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white capitalize">
                                                    {cat}
                                                </h2>

                                                <p className="text-white/60 text-sm mt-1">
                                                    Explore
                                                    premium{" "}
                                                    {
                                                        cat
                                                    }{" "}
                                                    collection
                                                </p>
                                            </div>

                                            {/* MORE BUTTON */}
                                            <button
                                                onClick={() =>
                                                    setCategory(
                                                        cat
                                                    )
                                                }
                                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all text-white px-4 py-2 rounded-full backdrop-blur-lg border border-white/10"
                                            >
                                                More

                                                <FaArrowRight />
                                            </button>
                                        </div>

                                        {/* Products */}
                                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-5 lg:gap-6">
                                            {categoryProducts
                                                .slice(
                                                    0,
                                                    6
                                                )
                                                .map(
                                                    (
                                                        item,
                                                        index
                                                    ) =>
                                                        ProductCard(
                                                            item,
                                                            index,
                                                            categoryProducts.length
                                                        )
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                    </>
                ) : (
                    <>
                        {/* ================= FULL CATEGORY PAGE ================= */}

                        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FaFire className="text-orange-300" />

                                    <span className="text-orange-200 uppercase tracking-widest text-sm">
                                        Category
                                    </span>
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-black text-white capitalize">
                                    {category}
                                </h2>

                                <p className="text-white/60 mt-2 text-sm sm:text-base">
                                    Showing all
                                    products from{" "}
                                    {category}
                                </p>
                            </div>

                            {/* BACK BUTTON */}
                            <button
                                onClick={() =>
                                    setCategory(
                                        "all"
                                    )
                                }
                                className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full backdrop-blur-lg border border-white/10 transition-all"
                            >
                                ← Back To Home
                            </button>
                        </div>

                        {/* FULL PRODUCTS */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-5 lg:gap-6">
                            {filteredProducts.map(
                                (
                                    item,
                                    index
                                ) =>
                                    ProductCard(
                                        item,
                                        index,
                                        filteredProducts.length
                                    )
                            )}
                        </div>
                    </>
                )}

                {/* Loading */}
                {loading && page > 1 && (
                    <div className="flex justify-center py-6">
                        <Spinner />
                    </div>
                )}

                {/* MODAL */}
                <Modal
                    open={showModal}
                    onClose={() =>
                        setShowModal(false)
                    }
                >
                    <Box
                        sx={{
                            position: "absolute",

                            top: "50%",

                            left: "50%",

                            transform:
                                "translate(-50%, -50%)",

                            width: {
                                xs: "96%",

                                sm: "90%",

                                md: "500px",

                                lg: "550px",
                            },

                            maxHeight: "90vh",

                            overflowY: "auto",

                            bgcolor:
                                "rgba(255,255,255,0.1)",

                            backdropFilter:
                                "blur(16px)",

                            border:
                                "1px solid rgba(255,255,255,0.1)",

                            borderRadius: 3,

                            boxShadow: 24,

                            p: {
                                xs: 2,
                                sm: 3,
                            },

                            color: "white",

                            scrollBehavior:
                                "smooth",
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
                                    <span>
                                        {
                                            selectedProduct.name
                                        }
                                    </span>

                                    <span>
                                        {calculatePrice(
                                            selectedProduct
                                        )}
                                        Rs
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <span>
                                        Quantity
                                    </span>

                                    <div className="flex gap-2 items-center">
                                        <Button
                                            onClick={() =>
                                                setQuantity(
                                                    (
                                                        q
                                                    ) =>
                                                        q >
                                                            1
                                                            ? q -
                                                            1
                                                            : 1
                                                )
                                            }
                                        >
                                            −
                                        </Button>

                                        <span className="px-3">
                                            {
                                                quantity
                                            }
                                        </span>

                                        <Button
                                            onClick={() =>
                                                quantity <
                                                selectedProduct.countInStock &&
                                                setQuantity(
                                                    (
                                                        q
                                                    ) =>
                                                        q +
                                                        1
                                                )
                                            }
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between font-bold mb-4">
                                    <span>
                                        Total
                                    </span>

                                    <span>
                                        {calculateTotal(
                                            selectedProduct,
                                            quantity
                                        )}
                                        Rs
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Shipping */}
                        <Typography
                            variant="subtitle1"
                            sx={{
                                mb: 1,
                            }}
                        >
                            Shipping Information
                        </Typography>

                        {[
                            "address",
                            "city",
                            "postalcode",
                            "country",
                            "contact",
                        ].map((field) => (
                            <input
                                key={field}
                                placeholder={
                                    field
                                        .charAt(0)
                                        .toUpperCase() +
                                    field.slice(1)
                                }
                                className="w-full mb-3 p-3 rounded-xl bg-black/30 backdrop-blur-md text-white placeholder-gray-300 border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 focus:outline-none transition-all"
                                onChange={(e) =>
                                    setShippingAddress(
                                        {
                                            ...shippingAddress,

                                            [field]:
                                                e
                                                    .target
                                                    .value,
                                        }
                                    )
                                }
                            />
                        ))}

                        {/* Payment */}
                        <Typography
                            variant="subtitle1"
                            sx={{
                                mb: 1,
                            }}
                        >
                            Payment Method
                        </Typography>

                        <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value
                                )
                            }
                            className="w-full mb-4 p-3 text-white bg-black/30 rounded-xl border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-300/40 focus:outline-none"
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
                                    background:
                                        "#6b4f2c",

                                    color: "white",

                                    mt: 1,

                                    borderRadius:
                                        "12px",

                                    padding:
                                        "12px",

                                    fontWeight:
                                        "bold",
                                }}
                            >
                                Place Order
                            </Button>
                        )}

                        <Button
                            fullWidth
                            onClick={() =>
                                setShowModal(false)
                            }
                            sx={{
                                background: "gray",

                                color: "white",

                                mt: 1,

                                borderRadius:
                                    "12px",

                                padding:
                                    "12px",

                                fontWeight:
                                    "bold",
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