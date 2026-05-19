import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import notecontext from "../../context/notecontext";
import Navbar from "./Navbar";
import Button from "@mui/material/Button";
import Spinner from "./Spinner";
import { Modal, Box, Typography } from "@mui/material";

export default function ProductDetails() {
    const { id } = useParams();
    const { addToCart, getProduct, getCart } = useContext(notecontext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");

    const [review, setReview] = useState({
        rating: 0,
        comment: "",
    });

    const [reviewsToShow, setReviewsToShow] = useState(5);

    const [showModal, setShowModal] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState("COD");

    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const [shippingAddress, setShippingAddress] = useState({
        address: "",
        city: "",
        postalcode: "",
        country: "",
        contact: "",
    });

    const [notification, setNotification] = useState({
        message: "",
        type: "",
    });

    const showNotification = (message, type = "success") => {
        setNotification({ message, type });

        setTimeout(() => {
            setNotification({ message: "", type: "" });
        }, 3000);
    };

    // FETCH PRODUCT
    const fetchProduct = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                `https://onlinehattid-production.up.railway.app/api/product/fetchoneproduct/${id}`
            );

            const data = await res.json();

            setProduct(data);

            setSelectedImage(data.images?.[0] || data.imageSrc || "");
        } catch (err) {
            console.error(err);

            showNotification("Failed to load product", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    // CURRENT PRICE
    const getCurrentPrice = () => {
        if (!product) {
            return {
                price: 0,
                discountedPrice: 0,
                stock: 0,
            };
        }

        if (selectedSize && product.sizePricing?.length > 0) {
            const sizeData = product.sizePricing.find(
                (s) => s.size === selectedSize
            );

            if (sizeData) {
                return {
                    price: sizeData.price,
                    discountedPrice: sizeData.discountedPrice,
                    stock: sizeData.stock,
                };
            }
        }

        return {
            price: product.price,
            discountedPrice: product.discountedPrice,
            stock: product.countInStock,
        };
    };

    const { price, discountedPrice, stock } = getCurrentPrice();

    // ADD TO CART
    const handleAddToCart = async () => {
        if (!localStorage.getItem("token")) {
            return showNotification("Please login first", "error");
        }

        if (product.availableColors?.length > 0 && !selectedColor) {
            return showNotification("Please select a color", "error");
        }

        if (product.availableSizes?.length > 0 && !selectedSize) {
            return showNotification("Please select a size", "error");
        }

        try {
            await addToCart(
                product._id,
                quantity,
                selectedImage,
                {
                    color: selectedColor || null,
                    size: selectedSize || null,
                }
            );

            showNotification("Added to cart successfully");

        } catch (err) {
            console.error(err);

            showNotification("Failed to add to cart", "error");
        }
    };
    // SUBMIT REVIEW
    const submitReview = async () => {
        if (!localStorage.getItem("token")) {
            return showNotification("Please login first", "error");
        }

        if (!review.rating || !review.comment) {
            return showNotification(
                "Please provide rating and comment",
                "error"
            );
        }

        try {
            const res = await fetch(
                `https://onlinehattid-production.up.railway.app/api/product/review/${id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(review),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            setReview({
                rating: 0,
                comment: "",
            });

            setReviewsToShow(5);

            fetchProduct();

            showNotification("Review submitted");
        } catch (err) {
            console.error(err);

            showNotification("Failed to submit review", "error");
        }
    };

    // PLACE ORDER
    const placeOrder = async () => {
        if (!localStorage.getItem("token")) {
            return showNotification("Please login first", "error");
        }

        // FORCE COLOR SELECTION
        if (product.availableColors?.length > 0 && !selectedColor) {
            return showNotification("Please select a color", "error");
        }

        // FORCE SIZE SELECTION
        if (product.availableSizes?.length > 0 && !selectedSize) {
            return showNotification("Please select a size", "error");
        }

        // VALIDATE ADDRESS
        const requiredFields = [
            "address",
            "city",
            "postalcode",
            "country",
            "contact",
        ];

        for (let field of requiredFields) {
            if (!shippingAddress[field]?.trim()) {
                return showNotification(
                    `${field} is required`,
                    "error"
                );
            }
        }

        try {
            const payload = {
                productId: product._id,
                quantity,

                shippingAddress,

                paymentMethod,

                selectedImage,

                selectedOptions: {
                    color: selectedColor || null,
                    size: selectedSize || null,
                },

                price: discountedPrice || price,
            };

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
                throw new Error(data.message);
            }

            if (paymentMethod === "Online") {
                setSelectedOrderId(data.orderId);
            } else {
                showNotification("Order placed successfully");

                setShowModal(false);

                getCart();

                getProduct();
            }
        } catch (err) {
            console.error(err);

            showNotification(
                err.message || "Failed to place order",
                "error"
            );
        }
    };

    // LOADING
    if (loading || !product) {
        return (
            <>
                <Navbar />

                <div className="pt-24">
                    <Spinner />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            {/* NOTIFICATION */}
            {notification.message && (
                <div
                    className={`fixed top-4 right-4 px-4 py-2 rounded text-white z-50 shadow-lg ${notification.type === "success"
                        ? "bg-green-500"
                        : "bg-red-500"
                        }`}
                >
                    {notification.message}
                </div>
            )}

            <div className="min-h-screen pt-24 bg-gradient-to-br from-[#124b68] to-[#eb6a00] p-6 text-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* IMAGE SECTION */}
                    <div>
                        <img
                            src={selectedImage}
                            alt={product.name}
                            className="w-full h-[400px] object-contain hover:object-cover rounded-xl mb-4"
                        />

                        <div className="flex gap-2 flex-wrap">
                            {product.images?.length ? (
                                product.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`thumb-${i}`}
                                        onClick={() =>
                                            setSelectedImage(img)
                                        }
                                        className={`w-20 h-20 object-contain hover:object-cover rounded cursor-pointer border-2 ${selectedImage === img
                                            ? "border-amber-500"
                                            : "border-transparent"
                                            }`}
                                    />
                                ))
                            ) : (
                                <img
                                    src={product.imageSrc}
                                    alt="default-thumb"
                                    className="w-20 h-20 object-contain hover:object-cover rounded cursor-pointer border-2 border-amber-500"
                                />
                            )}
                        </div>

                        {/* COLOR SELECTOR */}
                        {product.availableColors?.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 font-semibold">
                                    Select Color
                                </p>

                                <div className="flex gap-2 flex-wrap">
                                    {product.availableColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() =>
                                                setSelectedColor(color)
                                            }
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color
                                                ? "border-white scale-110"
                                                : "border-gray-500"
                                                }`}
                                            style={{
                                                backgroundColor: color,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SIZE SELECTOR */}
                        {product.availableSizes?.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 font-semibold">
                                    Select Size
                                </p>

                                {/* FIXED SIZE OVERFLOW */}
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2">
                                    {product.availableSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() =>
                                                setSelectedSize(size)
                                            }
                                            className={`w-full min-h-[42px] px-2 py-2 rounded-lg border-2 text-sm font-semibold transition-all overflow-hidden text-ellipsis whitespace-nowrap ${selectedSize === size
                                                ? "border-white bg-white/20"
                                                : "border-gray-500 bg-black/10"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DETAILS SECTION */}
                    <div>
                        <h1 className="text-3xl font-bold">
                            {product.name}
                        </h1>

                        <p className="text-gray-200 mt-2">
                            {product.description}
                        </p>

                        <p className="text-gray-200 mt-2">
                            Delivery charges: Free
                        </p>

                        {discountedPrice ? (
                            <div className="flex gap-2 mt-3 items-center">
                                <span className="line-through text-gray-300 text-xl">
                                    {price}Rs
                                </span>

                                <span className="text-xl font-bold text-yellow-400">
                                    Rs{discountedPrice}
                                </span>
                            </div>
                        ) : (
                            <p className="mt-3 text-xl font-semibold">
                                {price}Rs
                            </p>
                        )}

                        {product.brand && (
                            <p className="mt-2">
                                Brand: {product.brand}
                            </p>
                        )}

                        <p className="mt-2">
                            Category: {product.category}
                        </p>

                        <p className="mt-2">
                            ⭐ {product.rating} (
                            {product.numReviews || 0} reviews)
                        </p>

                        <p className="mt-2">
                            {stock > 0
                                ? `In Stock (${stock})`
                                : "Out of Stock"}
                        </p>

                        {/* QUANTITY */}
                        <div className="flex gap-3 mt-4 items-center">
                            <Button
                                onClick={() =>
                                    setQuantity((q) =>
                                        q > 1 ? q - 1 : 1
                                    )
                                }
                                className="!bg-[#eb6a00] !text-white"
                            >
                                −
                            </Button>

                            <span className="flex items-center text-lg font-semibold">
                                {quantity}
                            </span>

                            <Button
                                onClick={() =>
                                    setQuantity((q) =>
                                        q < stock ? q + 1 : q
                                    )
                                }
                                className="!bg-[#eb6a00] !text-white"
                            >
                                +
                            </Button>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-4 mt-6">
                            <Button
                                onClick={handleAddToCart}
                                disabled={stock === 0}
                                className="!bg-[#124b68] !text-white"
                            >
                                {stock === 0
                                    ? "Out of Stock"
                                    : "Add to Cart"}
                            </Button>

                            <Button
                                onClick={() => setShowModal(true)}
                                disabled={stock === 0}
                                className="!bg-[#eb6a00] !text-white"
                            >
                                Order Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* REVIEWS */}
                <div className="max-w-4xl mx-auto mt-10">
                    <h2 className="text-2xl mb-4">Reviews</h2>

                    {product.reviews?.length > 0 ? (
                        product.reviews
                            .slice(0, reviewsToShow)
                            .map((r, i) => (
                                <div
                                    key={i}
                                    className="bg-white/20 p-3 rounded mb-2"
                                >
                                    <p>⭐ {r.rating}</p>

                                    <p>{r.comment}</p>
                                </div>
                            ))
                    ) : (
                        <p>No reviews yet</p>
                    )}

                    {product.reviews?.length > reviewsToShow && (
                        <Button
                            onClick={() =>
                                setReviewsToShow((prev) => prev + 5)
                            }
                            className="!bg-[#eb6a00] !text-white mt-2"
                        >
                            Show More
                        </Button>
                    )}

                    {/* REVIEW FORM */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center">
                        <input
                            type="number"
                            min={1}
                            max={5}
                            placeholder="Rating (1-5)"
                            value={review.rating}
                            onChange={(e) =>
                                setReview({
                                    ...review,
                                    rating: e.target.value,
                                })
                            }
                            className="p-2 text-black w-full sm:w-32 rounded"
                        />

                        <input
                            type="text"
                            placeholder="Comment"
                            value={review.comment}
                            onChange={(e) =>
                                setReview({
                                    ...review,
                                    comment: e.target.value,
                                })
                            }
                            className="p-2 text-black flex-1 rounded w-full"
                        />

                        <Button
                            onClick={submitReview}
                            className="!bg-[#eb6a00] !text-white mt-2 sm:mt-0"
                        >
                            Submit
                        </Button>
                    </div>
                </div>

                {/* ORDER MODAL */}
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: {
                                xs: "95%",
                                sm: "90%",
                                md: 450,
                            },
                            maxHeight: "90vh",
                            overflowY: "auto",
                            bgcolor: "rgba(255,255,255,0.1)",
                            backdropFilter:
                                "blur(16px) saturate(180%)",
                            borderRadius: 3,
                            boxShadow: 24,
                            p: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <Typography
                            variant="h6"
                            className="text-center font-bold text-white"
                        >
                            Shipping & Payment
                        </Typography>

                        {/* COLOR */}
                        {product.availableColors?.length > 0 && (
                            <div>
                                <p className="text-white mb-2">
                                    Select Color
                                </p>

                                <div className="flex gap-2 flex-wrap">
                                    {product.availableColors.map(
                                        (color) => (
                                            <button
                                                key={color}
                                                onClick={() =>
                                                    setSelectedColor(
                                                        color
                                                    )
                                                }
                                                className={`w-8 h-8 rounded-full border-2 ${selectedColor ===
                                                    color
                                                    ? "border-white scale-110"
                                                    : "border-gray-500"
                                                    }`}
                                                style={{
                                                    backgroundColor:
                                                        color,
                                                }}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SIZE */}
                        {product.availableSizes?.length > 0 && (
                            <div>
                                <p className="text-white mb-2">
                                    Select Size
                                </p>

                                {/* FIXED SIZE OVERFLOW */}
                                <div className="grid grid-cols-4 gap-2">
                                    {product.availableSizes.map(
                                        (size) => (
                                            <button
                                                key={size}
                                                onClick={() =>
                                                    setSelectedSize(
                                                        size
                                                    )
                                                }
                                                className={`w-full min-h-[42px] px-2 py-2 rounded-lg border-2 text-sm font-semibold transition-all overflow-hidden text-ellipsis whitespace-nowrap ${selectedSize ===
                                                    size
                                                    ? "border-white bg-white/20"
                                                    : "border-gray-500 bg-black/10"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        {/* QUANTITY */}
                        <div className="flex gap-2 items-center">
                            <Button
                                onClick={() =>
                                    setQuantity((q) =>
                                        q > 1 ? q - 1 : 1
                                    )
                                }
                                className="!bg-[#eb6a00] !text-white min-w-[40px]"
                            >
                                −
                            </Button>

                            <span className="px-3 text-white">
                                {quantity}
                            </span>

                            <Button
                                onClick={() =>
                                    setQuantity((q) =>
                                        q < stock ? q + 1 : q
                                    )
                                }
                                className="!bg-[#eb6a00] !text-white min-w-[40px]"
                            >
                                +
                            </Button>
                        </div>

                        {/* ADDRESS */}
                        {[
                            "address",
                            "city",
                            "postalcode",
                            "country",
                            "contact",
                        ].map((f) => (
                            <input
                                key={f}
                                placeholder={
                                    f.charAt(0).toUpperCase() +
                                    f.slice(1)
                                }
                                value={shippingAddress[f]}
                                onChange={(e) =>
                                    setShippingAddress({
                                        ...shippingAddress,
                                        [f]: e.target.value,
                                    })
                                }
                                className="w-full p-2 rounded border text-white bg-black/40 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#eb6a00]"
                            />
                        ))}

                        {/* PAYMENT */}
                        <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value
                                )
                            }
                            className="w-full p-2 border rounded text-white bg-black/40 focus:ring-2 focus:ring-[#eb6a00]"
                        >
                            <option value="COD">
                                Cash on Delivery
                            </option>
                        </select>

                        {/* BUTTONS */}
                        {!selectedOrderId && (
                            <Button
                                fullWidth
                                onClick={placeOrder}
                                className="!bg-[#6b4f2c] !text-white py-3 rounded-lg font-semibold"
                            >
                                Place Order
                            </Button>
                        )}

                        <Button
                            fullWidth
                            onClick={() =>
                                setShowModal(false)
                            }
                            className="!bg-gray-500 !text-white py-2 rounded-lg"
                        >
                            Cancel
                        </Button>
                    </Box>
                </Modal>
            </div>
        </>
    );
}