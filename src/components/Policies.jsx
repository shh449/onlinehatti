import { useState } from "react";
import { Link } from "react-router-dom";

export default function PoliciesDropdown() {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="text-white hover:text-[#eb6a00]"
            >
                Policies ▼
            </button>

            {open && (
                <div className="absolute top-8 bg-white text-black rounded shadow-md w-40">
                    <Link to="/privacy" className="block px-3 py-2 hover:bg-gray-200">
                        Privacy
                    </Link>

                    <Link to="/refund" className="block px-3 py-2 hover:bg-gray-200">
                        Refund
                    </Link>

                    <Link to="/shipping" className="block px-3 py-2 hover:bg-gray-200">
                        Shipping
                    </Link>

                    <Link to="/terms" className="block px-3 py-2 hover:bg-gray-200">
                        Terms
                    </Link>

                    <Link to="/contact" className="block px-3 py-2 hover:bg-gray-200">
                        Contact
                    </Link>
                </div>
            )}
        </div>
    );
}