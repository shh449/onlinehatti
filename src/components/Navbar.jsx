import React, { useState, useEffect } from "react";

import {
    Link,
    useNavigate,
    useLocation,
} from "react-router-dom";

import PoliciesDropdown from "./Policies";

import {
    FaHome,
    FaShoppingCart,
    FaClipboardList,
    FaThLarge,
    FaSearch,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaChevronDown,
} from "react-icons/fa";

export default function Navbar({
    searchTerm,
    setSearchTerm,
    onCategorySelect,
    activeCategory,
}) {
    const navigate = useNavigate();

    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [loadingBarWidth, setLoadingBarWidth] =
        useState(0);

    const [loading, setLoading] =
        useState(false);

    const [categoryOpen, setCategoryOpen] =
        useState(false);

    const [mobileCategoryOpen, setMobileCategoryOpen] =
        useState(false);

    const categories = [
        "all",
        "clothes",
        "shoes",
        "watches",
        "fashion bags",
        "mens clothes",
        "kids clothes",
        "kitchenware",
        "home decor",
        "Electronic Accessories",
    ];

    // ================= LOGOUT =================
    const handleLogout = () => {
        localStorage.removeItem("token");

        navigate("/login");
    };

    // ================= LOADING BAR =================
    const triggerLoadingBar = () => {
        setLoading(true);

        setLoadingBarWidth(0);

        let width = 0;

        const interval = setInterval(() => {
            width += Math.random() * 10;

            if (width >= 100) {
                width = 100;

                clearInterval(interval);

                setTimeout(() => {
                    setLoading(false);
                }, 300);
            }

            setLoadingBarWidth(width);
        }, 50);
    };

    // ================= CATEGORY =================
    const handleCategoryClick = (cat) => {
        if (onCategorySelect) {
            onCategorySelect(cat);
        }

        if (location.pathname !== "/") {
            navigate("/");
        }

        triggerLoadingBar();

        setCategoryOpen(false);

        setMobileCategoryOpen(false);

        setMobileMenuOpen(false);
    };

    // ================= HOME =================
    const handleHomeClick = () => {
        navigate("/");

        if (onCategorySelect) {
            onCategorySelect("all");
        }

        setMobileMenuOpen(false);

        triggerLoadingBar();
    };

    // ================= PAGE DETECTION =================
    const isProductDetailsPage =
        location.pathname.startsWith("/product/");

    const isCartPage =
        location.pathname === "/cart";

    const isOrdersPage =
        location.pathname === "/myorders";

    const isHomePage =
        location.pathname === "/";

    // ================= ACTIVE CLASS =================
    const getActiveClass = (active) =>
        `transition-all duration-300 font-semibold flex items-center gap-2 ${active
            ? "text-[#eb6a00]"
            : "text-white hover:text-[#eb6a00]"
        }`;

    useEffect(() => {
        triggerLoadingBar();
    }, []);

    return (
        <>
            {/* ================= TOP NAVBAR ================= */}

            <nav className="fixed top-0 left-0 w-full z-50 bg-[#124b68]/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl">

                {/* ================= LOADING BAR ================= */}

                {loading && (
                    <div
                        className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 absolute top-0 left-0 transition-all duration-75 rounded-r-full shadow-lg"
                        style={{
                            width: `${loadingBarWidth}%`,
                        }}
                    />
                )}

                {/* ================= MAIN NAV ================= */}

                <div className="max-w-[1700px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3">

                    <div className="flex items-center justify-between gap-3">

                        {/* ================= LOGO ================= */}

                        <div
                            onClick={handleHomeClick}
                            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-fit"
                        >
                            <div className="relative">
                                <img
                                    src="/images/oh.png"
                                    alt="Logo"
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/20 shadow-xl group-hover:scale-105 transition-all duration-300"
                                />

                                <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-md group-hover:bg-orange-400/40 transition-all duration-300"></div>
                            </div>

                            <div className="hidden xs:block">
                                <h1 className="text-white font-black text-lg sm:text-xl tracking-wide group-hover:text-[#eb6a00] transition-all duration-300">
                                    OnlineHatti
                                </h1>

                                <p className="text-white/60 text-[10px] sm:text-xs tracking-widest uppercase">
                                    Premium Shopping
                                </p>
                            </div>
                        </div>

                        {/* ================= DESKTOP NAV ================= */}

                        <div className="hidden lg:flex items-center gap-4 xl:gap-6">

                            {/* HOME */}
                            <button
                                onClick={handleHomeClick}
                                className={getActiveClass(
                                    isHomePage
                                )}
                            >
                                <FaHome />

                                Home
                            </button>

                            {/* ================= CATEGORY DROPDOWN ================= */}

                            {!isProductDetailsPage &&
                                !isCartPage &&
                                !isOrdersPage && (
                                    <div className="relative">

                                        <button
                                            onClick={() =>
                                                setCategoryOpen(
                                                    !categoryOpen
                                                )
                                            }
                                            className="text-white hover:text-[#eb6a00] font-semibold flex items-center gap-2 transition-all duration-300"
                                        >
                                            <FaThLarge />

                                            Categories

                                            <FaChevronDown
                                                className={`text-xs transition-all duration-300 ${categoryOpen
                                                    ? "rotate-180"
                                                    : ""
                                                    }`}
                                            />
                                        </button>

                                        {categoryOpen && (
                                            <div className="absolute top-14 left-0 w-72 bg-[#124b68]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">

                                                <div className="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto pr-1">

                                                    {categories.map(
                                                        (
                                                            cat
                                                        ) => (
                                                            <button
                                                                key={
                                                                    cat
                                                                }
                                                                onClick={() =>
                                                                    handleCategoryClick(
                                                                        cat
                                                                    )
                                                                }
                                                                className={`text-left px-4 py-3 rounded-2xl capitalize transition-all duration-300 flex items-center gap-3 ${activeCategory ===
                                                                    cat
                                                                    ? "bg-[#eb6a00] text-white shadow-lg"
                                                                    : "text-white hover:bg-white/10"
                                                                    }`}
                                                            >
                                                                <FaThLarge className="text-sm" />

                                                                {
                                                                    cat
                                                                }
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* ================= SEARCH ================= */}

                            <div className="relative w-[260px] xl:w-[320px]">

                                <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-sm" />

                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target
                                                .value
                                        )
                                    }
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg border border-white/20"
                                />
                            </div>

                            {/* ================= LINKS ================= */}

                            <Link
                                to="/cart"
                                className={getActiveClass(
                                    isCartPage
                                )}
                            >
                                <FaShoppingCart />

                                Cart
                            </Link>

                            <Link
                                to="/myorders"
                                className={getActiveClass(
                                    isOrdersPage
                                )}
                            >
                                <FaClipboardList />

                                My Orders
                            </Link>

                            <PoliciesDropdown />

                            {/* ================= LOGOUT ================= */}

                            <button
                                onClick={handleLogout}
                                className="bg-[#eb6a00] hover:bg-[#cf5d00] text-white px-5 py-2.5 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105"
                            >
                                <FaSignOutAlt />

                                Logout
                            </button>
                        </div>

                        {/* ================= MOBILE RIGHT ================= */}

                        <div className="lg:hidden flex items-center gap-2">

                            {/* SEARCH */}

                            <div className="relative">

                                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 text-xs" />

                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target
                                                .value
                                        )
                                    }
                                    className="w-32 sm:w-44 pl-9 pr-3 py-2.5 rounded-2xl bg-white/90 text-black text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg"
                                />
                            </div>

                            {/* MENU */}

                            <button
                                onClick={() =>
                                    setMobileMenuOpen(
                                        !mobileMenuOpen
                                    )
                                }
                                className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center backdrop-blur-xl shadow-lg"
                            >
                                {mobileMenuOpen ? (
                                    <FaTimes />
                                ) : (
                                    <FaBars />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ================= MOBILE BOTTOM NAV ================= */}

            <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 px-3 pb-3">

                <div className="bg-[#124b68]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl px-2 py-3">

                    <div className="flex items-center justify-around">

                        {/* HOME */}

                        <button
                            onClick={handleHomeClick}
                            className={`flex flex-col items-center gap-1 text-xs font-medium transition-all duration-300 ${isHomePage
                                ? "text-[#eb6a00]"
                                : "text-white"
                                }`}
                        >
                            <FaHome className="text-lg" />

                            Home
                        </button>

                        {/* CATEGORIES */}

                        <button
                            onClick={() =>
                                setMobileCategoryOpen(
                                    !mobileCategoryOpen
                                )
                            }
                            className="flex flex-col items-center gap-1 text-xs font-medium text-white"
                        >
                            <FaThLarge className="text-lg" />

                            Categories
                        </button>

                        {/* CART */}

                        <Link
                            to="/cart"
                            className={`flex flex-col items-center gap-1 text-xs font-medium transition-all duration-300 ${isCartPage
                                ? "text-[#eb6a00]"
                                : "text-white"
                                }`}
                        >
                            <FaShoppingCart className="text-lg" />

                            Cart
                        </Link>

                        {/* ORDERS */}

                        <Link
                            to="/myorders"
                            className={`flex flex-col items-center gap-1 text-xs font-medium transition-all duration-300 ${isOrdersPage
                                ? "text-[#eb6a00]"
                                : "text-white"
                                }`}
                        >
                            <FaClipboardList className="text-lg" />

                            Orders
                        </Link>

                        {/* MENU */}

                        <button
                            onClick={() =>
                                setMobileMenuOpen(
                                    !mobileMenuOpen
                                )
                            }
                            className="flex flex-col items-center gap-1 text-xs font-medium text-white"
                        >
                            <FaBars className="text-lg" />

                            Menu
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= MOBILE MENU ================= */}

            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">

                    <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-[#124b68]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl p-5 overflow-y-auto">

                        {/* CLOSE */}

                        <div className="flex items-center justify-between mb-6">

                            <h2 className="text-white text-xl font-bold">
                                Menu
                            </h2>

                            <button
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false
                                    )
                                }
                                className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* LINKS */}

                        <div className="flex flex-col gap-3">

                            <button
                                onClick={
                                    handleHomeClick
                                }
                                className="flex items-center gap-3 text-white bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-4 py-4 font-semibold"
                            >
                                <FaHome />

                                Home
                            </button>

                            <Link
                                to="/cart"
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false
                                    )
                                }
                                className="flex items-center gap-3 text-white bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-4 py-4 font-semibold"
                            >
                                <FaShoppingCart />

                                Cart
                            </Link>

                            <Link
                                to="/myorders"
                                onClick={() =>
                                    setMobileMenuOpen(
                                        false
                                    )
                                }
                                className="flex items-center gap-3 text-white bg-white/10 hover:bg-white/20 transition-all rounded-2xl px-4 py-4 font-semibold"
                            >
                                <FaClipboardList />

                                My Orders
                            </Link>

                            {/* CATEGORY SECTION */}

                            <div className="bg-white/10 rounded-2xl overflow-hidden">

                                <button
                                    onClick={() =>
                                        setMobileCategoryOpen(
                                            !mobileCategoryOpen
                                        )
                                    }
                                    className="w-full flex items-center justify-between text-white px-4 py-4 font-semibold"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaThLarge />

                                        Categories
                                    </div>

                                    <FaChevronDown
                                        className={`transition-all duration-300 ${mobileCategoryOpen
                                            ? "rotate-180"
                                            : ""
                                            }`}
                                    />
                                </button>

                                {mobileCategoryOpen && (
                                    <div className="px-2 pb-3 flex flex-col gap-1">

                                        {categories.map(
                                            (
                                                cat
                                            ) => (
                                                <button
                                                    key={
                                                        cat
                                                    }
                                                    onClick={() =>
                                                        handleCategoryClick(
                                                            cat
                                                        )
                                                    }
                                                    className={`text-left px-4 py-3 rounded-xl capitalize transition-all duration-300 ${activeCategory ===
                                                        cat
                                                        ? "bg-[#eb6a00] text-white"
                                                        : "text-white hover:bg-white/10"
                                                        }`}
                                                >
                                                    {
                                                        cat
                                                    }
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* POLICIES */}

                            <div className="bg-white/10 rounded-2xl p-1">
                                <PoliciesDropdown />
                            </div>

                            {/* LOGOUT */}

                            <button
                                onClick={
                                    handleLogout
                                }
                                className="flex items-center justify-center gap-3 bg-[#eb6a00] hover:bg-[#cf5d00] text-white rounded-2xl px-4 py-4 font-bold transition-all duration-300 shadow-xl mt-2"
                            >
                                <FaSignOutAlt />

                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}