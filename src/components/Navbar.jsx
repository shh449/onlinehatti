import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PoliciesDropdown from "./Policies";

export default function Navbar({ searchTerm, setSearchTerm, onCategorySelect, activeCategory }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loadingBarWidth, setLoadingBarWidth] = useState(0);
    const [loading, setLoading] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);

    const categories = ["all", "clothes", "shoes", "watches", "fashion bags"];

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Navigate Home
    const handleHomeClick = () => {
        navigate("/");
        if (onCategorySelect) onCategorySelect("all");
        setMobileMenuOpen(false);
        triggerLoadingBar();
    };

    // Detect pages
    const isProductDetailsPage = location.pathname.startsWith("/product/");
    const isCartPage = location.pathname === "/cart";
    const isOrdersPage = location.pathname === "/myorders";
    const isHomePage = location.pathname === "/";

    const getActiveClass = (active) =>
        `font-medium ${active ? "text-[#eb6a00]" : "text-white hover:text-[#eb6a00]"}`;

    // Top loading bar simulation
    const triggerLoadingBar = () => {
        setLoading(true);
        setLoadingBarWidth(0);
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 10; // Random increment
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                setTimeout(() => setLoading(false), 300); // small delay
            }
            setLoadingBarWidth(width);
        }, 50);
    };

    useEffect(() => {
        // Trigger loading bar on first mount
        triggerLoadingBar();
    }, []);

    return (
        <nav className="fixed top-0 left-0 w-full bg-[#124b68]/30 backdrop-blur-lg shadow-md z-50">

            {/* Top Loading Bar */}
            {loading && (
                <div className="h-1 bg-orange-500 absolute top-0 left-0 transition-all duration-75" style={{ width: `${loadingBarWidth}%` }} />
            )}

            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

                {/* Logo */}
                <div className="flex items-center space-x-2 cursor-pointer" onClick={handleHomeClick}>
                    <img src="/images/oh.png" alt="Logo" className="w-14 h-14 rounded-full" />
                    <span className="text-white font-bold text-xl hover:text-[#eb6a00]">OnlineHatti</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-4">
                    {isProductDetailsPage || isCartPage || isOrdersPage ? (
                        <button onClick={handleHomeClick} className={getActiveClass(isHomePage)}>Home</button>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setCategoryOpen(!categoryOpen)}
                                className="text-white hover:text-[#eb6a00] font-medium"
                            >
                                Categories ▼
                            </button>

                            {categoryOpen && (
                                <div className="absolute top-10 left-0 bg-[#124b68] backdrop-blur-lg shadow-lg rounded-lg w-48 flex flex-col z-50">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                onCategorySelect(cat);
                                                triggerLoadingBar();
                                                setCategoryOpen(false);
                                            }}
                                            className={`text-left px-4 py-2 hover:bg-[#eb6a00]/20 capitalize ${activeCategory === cat ? "text-[#eb6a00]" : "text-white"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-2 py-1 rounded bg-white/80 text-black focus:outline-none"
                    />

                    {/* Cart & Orders */}
                    <Link to="/cart" className={getActiveClass(isCartPage)}>Cart</Link>
                    <Link to="/myorders" className={getActiveClass(isOrdersPage)}>My Orders</Link>
                    <PoliciesDropdown />

                    {/* Logout */}
                    <button onClick={handleLogout} className="text-white hover:text-[#eb6a00] font-medium">Logout</button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white text-2xl">
                        {mobileMenuOpen ? "✖" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#124b68]/80 backdrop-blur-lg p-4 flex flex-col space-y-3">
                    {isProductDetailsPage || isCartPage || isOrdersPage ? (
                        <button onClick={handleHomeClick} className={getActiveClass(isHomePage) + " text-left"}>Home</button>
                    ) : (
                        <div className="border-t border-white/20 pt-2">
                            <p className="text-white font-semibold mb-2">Categories</p>

                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        onCategorySelect(cat);
                                        setMobileMenuOpen(false);
                                        triggerLoadingBar();
                                    }}
                                    className={`block text-left w-full py-1 capitalize ${activeCategory === cat ? "text-[#eb6a00]" : "text-white"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-2 py-1 rounded bg-white/80 text-black focus:outline-none w-full"
                    />

                    {/* Cart & Orders */}
                    <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className={getActiveClass(isCartPage) + " text-left"}>Cart</Link>
                    <Link to="/myorders" onClick={() => setMobileMenuOpen(false)} className={getActiveClass(isOrdersPage) + " text-left"}>My Orders</Link>
                    <PoliciesDropdown />

                    {/* Logout */}
                    <button onClick={handleLogout} className="text-white hover:text-[#eb6a00] font-medium text-left">Logout</button>
                </div>
            )}
        </nav>
    );
}