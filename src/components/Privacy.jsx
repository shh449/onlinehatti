import Navbar from "./Navbar";

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar />
            <div className="pt-24 min-h-screen bg-gradient-to-br from-[#124b68] to-[#eb6a00] text-white px-6">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

                <p className="mb-4">
                    At OnlineHatti, we respect your privacy and are committed to protecting your personal information.
                </p>

                <p className="mb-4">
                    We collect information such as your name, contact number, address, and email to process orders and improve your shopping experience.
                </p>

                <p className="mb-4">
                    Your data is never sold or shared with third parties except for delivery and payment processing purposes.
                </p>

                <p className="mb-4">
                    We use secure systems to protect your data and ensure safe transactions.
                </p>

                <p className="mb-4">
                    By using our website, you agree to our privacy practices.
                </p>
            </div>
        </>
    );
}