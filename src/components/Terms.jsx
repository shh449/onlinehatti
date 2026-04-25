import Navbar from "./Navbar";

export default function Terms() {
    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] text-white px-6">
                <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

                <p className="mb-4">
                    By using OnlineHatti, you agree to our terms and conditions.
                </p>

                <p className="mb-4">
                    All products are subject to availability and may vary slightly from images.
                </p>

                <p className="mb-4">
                    We reserve the right to cancel orders due to stock or pricing errors.
                </p>

                <p className="mb-4">
                    Customers must provide accurate information for order processing.
                </p>

                <p className="mb-4">
                    Misuse of the website may result in account suspension.
                </p>
            </div>
        </>
    );
}