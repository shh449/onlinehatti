// OrderModal.jsx
import React, { useState, useContext, useEffect } from "react";
import { Modal, Box, Button, Typography } from "@mui/material";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import notecontext from "../../context/notecontext";

// Stripe instance
const stripePromise = loadStripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// Stripe payment component
function StripePayment({ orderId, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();

    const handlePayment = async () => {
        if (!stripe || !elements) return;
        try {
            const res = await fetch("http://localhost:5000/api/payment/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });
            const { clientSecret } = await res.json();
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) },
            });
            if (error) onError(error.message);
            else if (paymentIntent.status === "succeeded") onSuccess();
        } catch (err) {
            onError(err.message || "Payment failed");
        }
    };

    return (
        <>
            <CardElement options={{ hidePostalCode: true }} className="p-2 border rounded mb-4" />
            <Button onClick={handlePayment} className="!bg-green-600 hover:!bg-green-700 !text-white !w-full py-2 rounded">
                Pay Now
            </Button>
        </>
    );
}

// Reusable modal
export default function OrderModal({ open, onClose, items, onNotification }) {
    const { getCart } = useContext(notecontext);
    const [shippingAddress, setShippingAddress] = useState({ address: "", city: "", postalcode: "", country: "" });
    const [addressErrors, setAddressErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        if (!open) {
            // reset state when modal closes
            setShippingAddress({ address: "", city: "", postalcode: "", country: "" });
            setAddressErrors({});
            setPaymentMethod("COD");
            setSelectedOrderId(null);
        }
    }, [open]);

    const handleChange = e => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
        setAddressErrors({ ...addressErrors, [e.target.name]: "" });
    };

    const placeOrder = async () => {
        if (!items || items.length === 0) {
            onNotification({ message: "No items to order", type: "error" });
            return;
        }

        // Validate shipping fields
        let errors = {};
        ["address", "city", "postalcode", "country"].forEach(f => {
            if (!shippingAddress[f]) errors[f] = `${f} required`;
        });
        if (Object.keys(errors).length > 0) {
            setAddressErrors(errors);
            return;
        }

        try {
            const payload = {
                items: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
                shippingAddress,
                paymentMethod
            };

            const res = await fetch("http://localhost:5000/api/order/placeorder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.orderId) {
                if (paymentMethod === "Online") setSelectedOrderId(data.orderId);
                else {
                    onNotification({ message: "Order placed successfully!", type: "success" });
                    getCart();
                    onClose();
                }
            } else {
                onNotification({ message: data.message || "Error placing order", type: "error" });
            }
        } catch (err) {
            console.error(err);
            onNotification({ message: "Internal server error", type: "error" });
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: "90%", maxWidth: 450, bgcolor: "#f5f5f5", borderRadius: 3, boxShadow: 24, p: 4
            }}>
                <Typography variant="h6" className="mb-4 text-center">Shipping & Payment</Typography>

                {/* Shipping Inputs */}
                <input name="address" placeholder="Address" value={shippingAddress.address} onChange={handleChange} className="mb-1 w-full p-2 border rounded" />
                {addressErrors.address && <p className="text-red-500 text-sm mb-2">{addressErrors.address}</p>}
                <input name="city" placeholder="City" value={shippingAddress.city} onChange={handleChange} className="mb-1 w-full p-2 border rounded" />
                {addressErrors.city && <p className="text-red-500 text-sm mb-2">{addressErrors.city}</p>}
                <input name="postalcode" placeholder="Postal Code" value={shippingAddress.postalcode} onChange={handleChange} className="mb-1 w-full p-2 border rounded" />
                {addressErrors.postalcode && <p className="text-red-500 text-sm mb-2">{addressErrors.postalcode}</p>}
                <input name="country" placeholder="Country" value={shippingAddress.country} onChange={handleChange} className="mb-1 w-full p-2 border rounded" />
                {addressErrors.country && <p className="text-red-500 text-sm mb-2">{addressErrors.country}</p>}

                {/* Payment Method */}
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mb-4 w-full p-2 border rounded">
                    <option value="COD">Cash on Delivery</option>
                    <option value="Online">Online Payment</option>
                </select>

                {/* Online Payment */}
                {paymentMethod === "Online" && selectedOrderId && (
                    <Elements stripe={stripePromise}>
                        <StripePayment
                            orderId={selectedOrderId}
                            onSuccess={() => {
                                onNotification({ message: "Payment successful!", type: "success" });
                                getCart();
                                onClose();
                                setSelectedOrderId(null);
                            }}
                            onError={msg => onNotification({ message: msg, type: "error" })}
                        />
                    </Elements>
                )}

                {!selectedOrderId && (
                    <Button onClick={placeOrder} className="!bg-green-600 hover:!bg-green-700 !text-white !w-full py-2 rounded mb-2">
                        Place Order
                    </Button>
                )}

                <Button onClick={onClose} className="!bg-gray-500 hover:!bg-gray-600 !text-white !w-full py-2 rounded">
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
}