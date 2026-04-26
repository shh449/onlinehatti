import React, { useContext, useState, useEffect } from "react";
import { Button, Typography, Box, Modal } from "@mui/material";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import notecontext from "../../context/notecontext";
import Navbar from "./Navbar";


// Helper function to get product image
const getProductImage = (product) => {
    if (!product) return "/placeholder.png";
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    if (product.imageSrc) return product.imageSrc;
    return "/placeholder.png";
};



export default function CartPage() {
    const { cart, increaseValue, decreaseValue, deleteCart, getCart } = useContext(notecontext);

    const [localCart, setLocalCart] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState({ message: "", type: "" });
    const [shippingAddress, setShippingAddress] = useState({ address: "", city: "", postalcode: "", country: "", contact: "" });
    const [addressErrors, setAddressErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        if (cart?.items) setLocalCart(cart.items);
    }, [cart?.items]);

    const handleChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
        setAddressErrors({ ...addressErrors, [e.target.name]: "" });
    };

    const updateQuantity = (productId, delta) => {
        const updated = localCart.map((item) => {
            if (item.product?._id === productId) {
                const currentStock = item.selectedOptions?.size && item.product?.sizePricing
                    ? item.product.sizePricing.find(sp => sp.size === item.selectedOptions.size)?.stock || 0
                    : item.product?.countInStock || 0;

                let newQty = item.quantity + delta;
                if (newQty < 1) newQty = 1;
                if (newQty > currentStock) newQty = currentStock;

                if (delta > 0) increaseValue(productId);
                else decreaseValue(productId);

                return { ...item, quantity: newQty };
            }
            return item;
        });
        setLocalCart(updated);
    };

    const updateOption = (productId, option, value) => {
        setLocalCart(localCart.map(item =>
            item.product._id === productId
                ? { ...item, selectedOptions: { ...item.selectedOptions, [option]: value } }
                : item
        ));
    };

    const removeItem = (productId) => {
        setLocalCart(localCart.filter((item) => item.product?._id !== productId));
        deleteCart(productId);
    };

    const validCartItems = localCart.filter((item) => item.product && item.product._id);

    // Calculate dynamic price based on size selection
    const getItemPrice = (item) => {
        let price = item.product?.discountedPrice || item.product?.price || 0;
        if (item.selectedOptions?.size && item.product?.sizePricing) {
            const sizePriceObj = item.product.sizePricing.find(sp => sp.size === item.selectedOptions.size);
            if (sizePriceObj) price = sizePriceObj.discountedPrice || sizePriceObj.price || price;
        }
        return price;
    };

    const totalAmount = validCartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

    const placeOrder = async () => {
        if (validCartItems.length === 0) {
            setNotification({ message: "Cart is empty", type: "error" });
            return;
        }

        const errors = {};
        ["address", "city", "postalcode", "country", "contact"].forEach((field) => {
            if (!shippingAddress[field]) errors[field] = `${field} is required`;
        });
        if (Object.keys(errors).length > 0) return setAddressErrors(errors);

        const payload = {
            shippingAddress,
            paymentMethod,
            items: validCartItems.map((item) => {
                let price = item.product?.price || 0;
                let discountedPrice = item.product?.discountedPrice || null;
                let stock = item.product?.countInStock || 0;

                if (item.selectedOptions?.size && item.product?.sizePricing) {
                    const sizePriceObj = item.product.sizePricing.find(sp => sp.size === item.selectedOptions.size);
                    if (sizePriceObj) {
                        price = sizePriceObj.price;
                        discountedPrice = sizePriceObj.discountedPrice;
                        stock = sizePriceObj.stock;
                    }
                }

                return {
                    product: item.product._id,
                    quantity: item.quantity,
                    selectedOptions: item.selectedOptions || {},
                    selectedImage: item.selectedImage || getProductImage(item.product),
                    price,
                    discountedPrice,
                    stock
                };
            }),
        };

        try {
            const res = await fetch("https://onlinehattid-production.up.railway.app/api/order/placeorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                setNotification({ message: data.message || "Error placing order", type: "error" });
                return;
            }

            if (paymentMethod === "Online") setSelectedOrderId(data.orderId);
            else {
                setNotification({ message: "Order placed successfully!", type: "success" });
                setTimeout(() => setNotification({ message: "", type: "" }), 1500);
                setLocalCart([]);
                getCart();
                setShowModal(false);
            }
        } catch (err) {
            setNotification({ message: "Internal server error", type: "error" });
        }

        setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00]">
            <Navbar searchTerm="" setSearchTerm={() => { }} onCategorySelect={() => { }} />

            {notification.message && (
                <div className={`fixed top-20 right-4 px-4 py-2 rounded shadow-lg z-50 ${notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {notification.message}
                </div>
            )}

            <div className="pt-28 px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row gap-6">

                {/* Cart Items */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {validCartItems.length === 0 ? (
                        <Typography className="text-white text-center text-lg">Your cart is empty</Typography>
                    ) : (
                        validCartItems.map((item) => {
                            const itemPrice = getItemPrice(item);
                            const currentStock = item.selectedOptions?.size && item.product?.sizePricing
                                ? item.product.sizePricing.find(sp => sp.size === item.selectedOptions.size)?.stock || 0
                                : item.product?.countInStock || 0;

                            return (
                                <div key={item.product._id} className="flex flex-col p-4 rounded-3xl bg-white/20 backdrop-blur-lg text-white shadow-lg group">
                                    <img
                                        src={item.selectedImage || getProductImage(item.product)}
                                        alt={item.product?.name}
                                        className="h-40 w-full object-contain group-hover:object-cover rounded-xl mb-3 transition-all duration-300"
                                    />
                                    <h2 className="text-lg font-bold">{item.product?.name}</h2>
                                    <p className="text-gray-200">{item.product?.description}</p>

                                    {item.product?.availableColors && (
                                        <div className="flex gap-2 mt-2">
                                            {item.product.availableColors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => updateOption(item.product._id, "color", color)}
                                                    className={`w-6 h-6 rounded-full border-2 ${item.selectedOptions?.color === color ? "border-white" : "border-gray-500"}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {item.product?.availableSizes && (
                                        <div className="flex gap-2 mt-2">
                                            {item.product.availableSizes.map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => updateOption(item.product._id, "size", size)}
                                                    className={`px-3 py-1 rounded border-2 cursor-pointer ${item.selectedOptions?.size === size ? "border-white bg-white/20" : "border-gray-500"}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-between mt-2 font-semibold items-center">
                                        <span className="text-lg font-bold">
                                            {itemPrice}Rs
                                            {itemPrice !== (item.product?.price || 0) && (
                                                <span className="line-through text-sm text-gray-300 ml-1">${item.product?.price}</span>
                                            )}
                                        </span>
                                        <span className="text-lg font-bold">Qty: {item.quantity}/{currentStock}</span>
                                    </div>
                                    <div className="flex justify-between mt-2 gap-2">
                                        <Button onClick={() => updateQuantity(item.product._id, -1)} className="!bg-[#eb6a00] !text-white !px-4 !py-2 !rounded-lg !text-xl hover:!bg-[#d15a00]">-</Button>
                                        <Button onClick={() => updateQuantity(item.product._id, 1)} className="!bg-[#eb6a00] !text-white !px-4 !py-2 !rounded-lg !text-xl hover:!bg-[#d15a00]">+</Button>
                                        <Button onClick={() => removeItem(item.product._id)} className="!bg-[#eb6a00] !text-white !px-4 !py-2 !rounded-lg !text-xl hover:!bg-[#d15a00]">Remove</Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96 p-4 rounded-3xl bg-white/20 backdrop-blur-lg shadow-lg flex flex-col gap-4 text-white">
                    <Typography variant="h6" className="text-center font-bold text-xl mb-2">Order Summary</Typography>
                    {validCartItems.map((item) => {
                        const itemPrice = getItemPrice(item);
                        return (
                            <div key={item.product._id} className="flex justify-between items-center p-2 rounded hover:bg-white/10">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={item.selectedImage || getProductImage(item.product)}
                                        alt={item.product?.name}
                                        className="h-12 w-12 object-contain hover:object-cover rounded transition-all duration-300"
                                    />
                                    <div className="flex flex-col">
                                        <span>{item.product?.name}</span>
                                        <span className="text-sm text-gray-200">
                                            ${itemPrice}
                                            {itemPrice !== (item.product?.price || 0) && (
                                                <span className="line-through text-xs text-gray-400 ml-1">${item.product.price}</span>
                                            )}
                                        </span>
                                        {item.selectedOptions?.color && <span className="text-sm text-gray-200">Color: {item.selectedOptions.color}</span>}
                                        {item.selectedOptions?.size && <span className="text-sm text-gray-200">Size: {item.selectedOptions.size}</span>}
                                    </div>
                                </div>
                                <span className="text-lg font-bold">{item.quantity}</span>
                                <span className="text-lg font-bold">${itemPrice * item.quantity}</span>
                            </div>
                        );
                    })}
                    <hr className="border-gray-400 my-2" />
                    <div className="flex justify-between font-bold text-white text-lg">
                        <span>Total:</span>
                        <span>{totalAmount}Rs</span>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="!bg-[#6b4f2c] hover:!bg-[#583e24] !w-full py-3 rounded text-lg font-semibold shadow-lg mt-2">Checkout</Button>
                </div>
            </div>

            {/* Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "95%", sm: "80%", md: 450 },
                    maxHeight: "90vh",
                    overflowY: "auto",
                    bgcolor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(16px) saturate(180%)",
                    borderRadius: 3,
                    boxShadow: 24,
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3
                }}>
                    <Typography variant="h6" className="text-center font-bold text-white mb-2">Shipping & Payment</Typography>

                    {["address", "city", "postalcode", "country", "contact"].map((f) => (
                        <input
                            key={f}
                            name={f}
                            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                            value={shippingAddress[f]}
                            onChange={handleChange}
                            className="w-full p-2 rounded border text-white bg-black/40 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#eb6a00]"
                        />
                    ))}
                    {Object.keys(addressErrors).map((err) => (
                        <p key={err} className="text-red-500 text-sm">{addressErrors[err]}</p>
                    ))}

                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded text-white bg-black/40 focus:ring-2 focus:ring-[#eb6a00] mt-2"
                    >
                        <option value="COD">Cash on Delivery</option>

                    </select>



                    <Button onClick={placeOrder} className="!bg-[#6b4f2c] hover:!bg-[#583e24] !w-full py-3 rounded text-lg font-semibold shadow-lg mt-2">Place Order</Button>
                    <Button onClick={() => setShowModal(false)} className="!bg-gray-500 hover:!bg-gray-600 !w-full py-2 rounded text-lg font-semibold text-white mt-1">Cancel</Button>
                </Box>
            </Modal>
        </div>
    );
}