import React from "react";
import { FaShoppingCart } from "react-icons/fa";

export default function ProductHero() {
    return (
        <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg mb-4">
                <FaShoppingCart className="text-orange-300 text-sm" />

                <span className="text-sm tracking-wide text-white font-medium">
                    Trending Products
                </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-white tracking-tight leading-tight">
                Just for you
            </h2>

            <p className="text-white/70 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
                Discover premium products with unbeatable prices and fast delivery.
            </p>

            <div className="w-28 h-1 bg-gradient-to-r from-orange-400 via-white to-orange-300 mx-auto mt-5 rounded-full shadow-lg"></div>
        </div>
    );
}