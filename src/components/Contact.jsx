import Navbar from "./Navbar";

export default function Contact() {
    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] text-white px-6">
                <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

                <p className="mb-4">
                    📍 Location: Iqbal Nagar, Punjab, Pakistan
                </p>

                <p className="mb-4">
                    📞 Phone: +923285565716
                </p>

                <p className="mb-4">
                    📧 Email: support@onlinehatti.com
                </p>

                <p className="mb-4">
                    Our support team is available to assist you with orders, returns, and inquiries.
                </p>
            </div>
        </>
    );
}