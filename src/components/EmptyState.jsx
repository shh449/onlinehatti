import React from "react";
import { FaSearch } from "react-icons/fa";

export default function EmptyState({
    setSearchTerm,
    setCategory,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-5">
                <FaSearch className="text-3xl text-orange-300" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                No Products Found
            </h2>

            <p className="text-white/60 mt-3 max-w-md">
                Try another keyword or category.
            </p>

            <button
                onClick={() => {
                    setSearchTerm("");
                    setCategory("all");
                }}
                className="mt-6 bg-[#eb6a00] hover:bg-[#cf5d00] text-white px-6 py-3 rounded-full transition-all"
            >
                Back To Home
            </button>
        </div>
    );
}