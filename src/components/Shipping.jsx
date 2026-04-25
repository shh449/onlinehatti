import Navbar from "./Navbar";

export default function ShippingPolicy() {
    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] text-white px-6">
                <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>

                <p className="mb-4">
                    We deliver all over Pakistan through trusted courier services.
                </p>

                <p className="mb-4">
                    Orders are processed within 1–2 working days.
                </p>

                <p className="mb-4">
                    Delivery time is usually 3–5 working days depending on your location.
                </p>

                <p className="mb-4">
                    Shipping charges may vary based on product and city.
                </p>

                <p className="mb-4">
                    Customers will receive updates via SMS or email for order confirmation.
                </p>
            </div>
        </>
    );
}