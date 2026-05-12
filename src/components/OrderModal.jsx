import React from "react";
import {
    Modal,
    Box,
    Typography,
    Button,
} from "@mui/material";

export default function OrderModal({
    showModal,
    setShowModal,
    selectedProduct,
    quantity,
    setQuantity,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    placeOrder,
    calculatePrice,
    calculateTotal,
}) {
    return (
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
                        xs: "96%",
                        sm: "90%",
                        md: "500px",
                    },
                    maxHeight: "90vh",
                    overflowY: "auto",
                    bgcolor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 3,
                    p: 3,
                    color: "white",
                }}
            >
                <Typography variant="h6" className="text-center mb-4 font-bold">
                    Order Summary
                </Typography>

                {selectedProduct && (
                    <>
                        <div className="flex justify-between mb-3">
                            <span>{selectedProduct.name}</span>
                            <span>
                                {calculatePrice(selectedProduct)}Rs
                            </span>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <span>Quantity</span>

                            <div className="flex gap-2 items-center">
                                <Button
                                    onClick={() =>
                                        setQuantity((q) =>
                                            q > 1 ? q - 1 : 1
                                        )
                                    }
                                >
                                    −
                                </Button>

                                <span>{quantity}</span>

                                <Button
                                    onClick={() =>
                                        quantity <
                                        selectedProduct.countInStock &&
                                        setQuantity((q) => q + 1)
                                    }
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold mb-4">
                            <span>Total</span>

                            <span>
                                {calculateTotal(selectedProduct, quantity)}Rs
                            </span>
                        </div>
                    </>
                )}  {["address", "city", "postalcode", "country", "contact"].map((field) => (
                    <input
                        key={field}
                        placeholder={field}
                        className="w-full mb-3 p-3 rounded-xl bg-black/30 text-white border border-white/20"
                        onChange={(e) =>
                            setShippingAddress({
                                ...shippingAddress,
                                [field]: e.target.value,
                            })
                        }
                    />
                ))}

                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full mb-4 p-3 text-white bg-black/30 rounded-xl border border-white/20"
                >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Easypaisa">Easypaisa</option>
                </select>

                <Button
                    fullWidth
                    onClick={placeOrder}
                    sx={{
                        background: "#6b4f2c",
                        color: "white",
                        mt: 1,
                        borderRadius: "12px",
                    }}
                >
                    Place Order
                </Button>
            </Box>
        </Modal>
    );
}