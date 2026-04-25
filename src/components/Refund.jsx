import Navbar from "./Navbar";

export default function RefundPolicy() {
    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] text-white px-6">
                <h1 className="text-3xl font-bold mb-6">Return & Refund Policy</h1>

                <p className="mb-4">
                    We offer a 7-day return policy for damaged or incorrect items.
                </p>

                <p className="mb-4">
                    Items must be unused, in original packaging, and with proof of purchase.
                </p>

                <p className="mb-4">
                    Refunds are processed after inspection and may take 5–7 working days.
                </p>

                <p className="mb-4">
                    Delivery charges are non-refundable unless the product is defective.
                </p>

                <p className="mb-4">
                    For return requests, contact us via phone or email.
                </p>
            </div>
        </>
    );
}