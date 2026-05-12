import React from "react";
import Button from "@mui/material/Button";

import {
    FaShoppingCart,
    FaEye,
    FaBoxOpen,
    FaFire,
} from "react-icons/fa";

import { MdDiscount } from "react-icons/md";

function ProductCard({
    item,
    handleViewDetails,
    handleOrder,
}) {
    return (
        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/10 p-3 sm:p-4 rounded-2xl text-white shadow-lg transition-all duration-300 hover:shadow-orange-500/20 active:scale-95">

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                <FaFire />
                Hot
            </div>

            <div className="bg-white/5 rounded-2xl p-2 mb-3">
                <img
                    src={item.images?.[0]}
                    loading="lazy"
                    onClick={() => handleViewDetails(item._id)}
                    className="h-40 sm:h-52 w-full object-contain rounded-xl cursor-pointer transition-all duration-300 group-hover:scale-105"
                />
            </div>
            <h2
                className="font-bold text-sm sm:text-base lg:text-lg cursor-pointer line-clamp-2 min-h-[48px]"
                onClick={() => handleViewDetails(item._id)}
            >
                {item.name}
            </h2>

            <div className="flex items-center gap-2 flex-wrap mt-2">
                {item.discountedPrice ? (
                    <>
                        <span className="line-through text-white/60 text-sm">
                            {item.price}Rs
                        </span>

                        <span className="text-lg sm:text-xl font-extrabold text-yellow-300 flex items-center gap-1">
                            <MdDiscount />
                            {item.discountedPrice}Rs
                        </span>
                    </>
                ) : (
                    <span className="text-lg font-bold text-orange-200">
                        {item.price}Rs
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between mt-3 mb-2">
                <div className="flex items-center gap-2 text-sm">
                    <FaBoxOpen className="text-orange-300" />

                    <span>
                        Stock: {item.countInStock}
                    </span>
                </div>

                <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${item.countInStock > 0
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                        }`}
                >
                    {item.countInStock > 0
                        ? "Available"
                        : "Out"}
                </span>
            </div>

            <Button
                fullWidth
                startIcon={<FaEye />}
                onClick={() => handleViewDetails(item._id)}
                sx={{
                    background: "#124b68",
                    color: "white",
                    mt: 2,
                    borderRadius: "12px",
                    padding: "10px",
                    fontWeight: "bold",
                    textTransform: "none",
                }}
            >
                View Details
            </Button>

            <Button
                fullWidth
                startIcon={<FaShoppingCart />}
                onClick={() => handleOrder(item)}
                disabled={item.countInStock === 0}
                sx={{
                    background: "#eb6a00",
                    color: "white",
                    mt: 1,
                    borderRadius: "12px",
                    padding: "10px",
                    fontWeight: "bold",
                    textTransform: "none",
                }}
            >
                {item.countInStock === 0
                    ? "Out of stock"
                    : "Order"}
            </Button>
        </div>
    );
}

export default React.memo(ProductCard);