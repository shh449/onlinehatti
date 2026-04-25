import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import notecontext from "../../context/notecontext";
import Navbar from "./Navbar";
import Button from "@mui/material/Button";
import Spinner from "./Spinner";
import { Modal, Box, Typography } from "@mui/material";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";



export default function ProductDetails() {
    const { id } = useParams();
    const { addToCart, getProduct, getCart } = useContext(notecontext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [review, setReview] = useState({ rating: 0, comment: "" });
    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [shippingAddress, setShippingAddress] = useState({ address: "", city: "", postalcode: "", country: "", contact: "" });
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [reviewsToShow, setReviewsToShow] = useState(5);

    // Fetch product details
    const fetchProduct = async () => {
        try {
            const res = await fetch(`https://onlinehattid-production.up.railway.app/api/product/fetchoneproduct/${id}`);
            const data = await res.json();
            setProduct(data);
            setSelectedImage(data.images?.[0] || data.imageSrc);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProduct(); }, [id]);

    // Submit review
    const submitReview = async () => {
        if (!review.rating || !review.comment) return alert("Please provide rating and comment");
        try {
            await fetch(`https://onlinehattid-production.up.railway.app/api/product/review/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
                body: JSON.stringify(review),
            });
            setReview({ rating: 0, comment: "" });
            setReviewsToShow(5);
            fetchProduct();
        } catch (err) { console.error(err); }
    };

    const getCurrentPrice = () => {
        if (!product) return { price: 0, discountedPrice: 0, stock: 0 };
        if (selectedSize && product.sizePricing?.length) {
            const sp = product.sizePricing.find(s => s.size === selectedSize);
            if (sp) return { price: sp.price, discountedPrice: sp.discountedPrice, stock: sp.stock };
        }
        return { price: product.price, discountedPrice: product.discountedPrice, stock: product.countInStock };
    };

    const { price, discountedPrice, stock } = getCurrentPrice();

    const handleAddToCart = () => {
        if (product.availableColors?.length && !selectedColor) return alert("Please select a color");
        if (product.availableSizes?.length && !selectedSize) return alert("Please select a size");
        addToCart({
            _id: product._id,
            quantity,
            selectedImage,
            selectedOptions: { color: selectedColor || null, size: selectedSize || null },
            price: discountedPrice || price
        });
        setNotification({ message: "Added to cart!", type: "success" });
        setTimeout(() => setNotification({ message: "", type: "" }), 2000);
    };

    const placeOrder = async () => {
        if (!product) return;
        if (product.availableColors?.length && !selectedColor) return alert("Please select a color");
        if (product.availableSizes?.length && !selectedSize) return alert("Please select a size");

        const payload = {
            productId: product._id,
            quantity,
            shippingAddress,
            paymentMethod,
            selectedImage,
            selectedOptions: { color: selectedColor || null, size: selectedSize || null },
            price: discountedPrice || price
        };

        try {
            const res = await fetch("https://onlinehattid-production.up.railway.app/api/order/placeorder", {
                method: "POST",
                headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                if (paymentMethod === "Online") setSelectedOrderId(data.orderId);
                else {
                    setNotification({ message: "Order placed successfully!", type: "success" });
                    setShowModal(false);
                    getCart();
                    getProduct();
                }
            } else setNotification({ message: data.message, type: "error" });
        } catch {
            setNotification({ message: "Server error", type: "error" });
        }

        setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    };

    if (loading || !product) return (
        <>
            <Navbar />
            <div className="pt-24"><Spinner /></div>
        </>
    );

    return (
        <>
            <Navbar />
            {notification.message && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded text-white z-50 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {notification.message}
                </div>
            )}

            <div className="min-h-screen pt-24 bg-gradient-to-br from-[#124b68] to-[#eb6a00] p-6 text-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* IMAGE SECTION */}
                    <div>
                        <img src={selectedImage} alt={product.name} className="w-full h-[400px] object-contain hover:object-cover rounded-xl mb-4" />
                        <div className="flex gap-2 flex-wrap">
                            {product.images?.length
                                ? product.images.map((img, i) => (
                                    <img key={i} src={img} alt={`thumb-${i}`} onClick={() => setSelectedImage(img)}
                                        className={`w-20 h-20 object-contain hover:object-cover rounded cursor-pointer border-2 ${selectedImage === img ? "border-amber-500" : "border-transparent"}`} />
                                ))
                                : <img src={product.imageSrc} alt="default-thumb" className="w-20 h-20 object-contain hover:object-cover rounded cursor-pointer border-2 border-amber-500" />
                            }
                        </div>

                        {/* Color selector */}
                        {product.availableColors && (
                            <div className="flex gap-2 mt-2">
                                {product.availableColors.map(color => (
                                    <button key={color} onClick={() => setSelectedColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? "border-white" : "border-gray-500"}`}
                                        style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        )}

                        {/* Size selector */}
                        {product.availableSizes && (
                            <div className="flex gap-2 mt-2">
                                {product.availableSizes.map(size => (
                                    <button key={size} onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1 rounded border-2 ${selectedSize === size ? "border-white bg-white/20" : "border-gray-500"}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DETAILS SECTION */}
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-gray-200 mt-2">{product.description}</p>
                        {discountedPrice
                            ? <div className="flex gap-2 mt-3 items-center">
                                <span className="line-through text-gray-300 text-xl">${price}</span>
                                <span className="text-xl font-bold text-yellow-400">${discountedPrice}</span>
                            </div>
                            : <p className="mt-3 text-xl font-semibold">${price}</p>
                        }
                        {product.brand && <p>Brand: {product.brand}</p>}
                        <p>Category: {product.category}</p>
                        <p className="mt-2">⭐ {product.rating} ({product.numReviews || 0} reviews)</p>
                        <p className="mt-2">{stock > 0 ? "In Stock" : "Out of Stock"}</p>

                        {/* Quantity */}
                        <div className="flex gap-3 mt-4">
                            <Button onClick={() => setQuantity(q => (q > 1 ? q - 1 : 1))} className="!bg-[#eb6a00] !text-white">−</Button>
                            <span className="flex items-center">{quantity}</span>
                            <Button onClick={() => setQuantity(q => (q < stock ? q + 1 : q))} className="!bg-[#eb6a00] !text-white">+</Button>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mt-4">
                            <Button onClick={handleAddToCart} disabled={stock === 0} className="!bg-[#124b68] !text-white !hover:!bg-[#0d3b52]">
                                {stock === 0 ? "Out of Stock" : "Add to Cart"}
                            </Button>
                            <Button onClick={() => setShowModal(true)} disabled={stock === 0} className="!bg-[#eb6a00] !text-white !hover:!bg-[#cf5d00]">
                                Order Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* REVIEWS */}
                <div className="max-w-4xl mx-auto mt-10">
                    <h2 className="text-2xl mb-4">Reviews</h2>
                    {product.reviews?.length
                        ? product.reviews.slice(0, reviewsToShow).map((r, i) => (
                            <div key={i} className="bg-white/20 p-3 rounded mb-2">
                                <p>⭐ {r.rating}</p>
                                <p>{r.comment}</p>
                            </div>
                        ))
                        : <p>No reviews yet</p>
                    }
                    {product.reviews?.length > reviewsToShow && (
                        <Button onClick={() => setReviewsToShow(prev => prev + 5)} className="!bg-[#eb6a00] !text-white mt-2">Show More</Button>
                    )}

                    <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center">
                        <input type="number" min={1} max={5} placeholder="Rating (1-5)" value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })} className="p-2 text-black w-full sm:w-32" />
                        <input type="text" placeholder="Comment" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} className="p-2 text-black flex-1" />
                        <Button onClick={submitReview} className="!bg-[#eb6a00] !text-white mt-2 sm:mt-0">Submit</Button>
                    </div>
                </div>

                {/* ORDER MODAL */}
                <Modal open={showModal} onClose={() => setShowModal(false)}>
                    <Box sx={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "95%", sm: "90%", md: 450 },
                        maxHeight: "90vh", overflowY: "auto",
                        bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px) saturate(180%)",
                        borderRadius: 3, boxShadow: 24, p: 4, display: "flex", flexDirection: "column", gap: 3
                    }}>
                        <Typography variant="h6" className="text-center font-bold text-white mb-2">Shipping & Payment</Typography>

                        {/* Color selector */}
                        {product.availableColors && (
                            <div className="flex gap-2 mb-2">
                                {product.availableColors.map(color => (
                                    <button key={color} onClick={() => setSelectedColor(color)}
                                        className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? "border-white" : "border-gray-500"}`}
                                        style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        )}

                        {/* Size selector */}
                        {product.availableSizes && (
                            <div className="flex gap-2 mb-2">
                                {product.availableSizes.map(size => (
                                    <button key={size} onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1 rounded border-2 ${selectedSize === size ? "border-white bg-white/20" : "border-gray-500"}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="flex gap-2 items-center mb-2">
                            <Button onClick={() => setQuantity(q => (q > 1 ? q - 1 : 1))} className="!bg-[#eb6a00] !text-white min-w-[40px]">−</Button>
                            <span className="px-3">{quantity}</span>
                            <Button onClick={() => setQuantity(q => (q < stock ? q + 1 : q))} className="!bg-[#eb6a00] !text-white min-w-[40px]">+</Button>
                        </div>

                        {/* Address */}
                        {["address", "city", "postalcode", "country", "contact No"].map(f => (
                            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={shippingAddress[f]} onChange={e => setShippingAddress({ ...shippingAddress, [f]: e.target.value })}
                                className="w-full p-2 rounded border text-white bg-black/40 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#eb6a00]" />
                        ))}

                        {/* Payment Method */}
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                            className="w-full p-2 border rounded text-white bg-black/40 focus:ring-2 focus:ring-[#eb6a00]">
                            <option value="COD">Cash on Delivery</option>

                        </select>



                        {!selectedOrderId && (
                            <Button fullWidth onClick={placeOrder} className="!bg-[#6b4f2c] !text-white py-3 rounded-lg font-semibold mt-2">Place Order</Button>
                        )}
                        <Button fullWidth onClick={() => setShowModal(false)} className="!bg-gray-500 !text-white py-2 rounded-lg mt-1">Cancel</Button>
                    </Box>
                </Modal>
            </div>
        </>
    );
}