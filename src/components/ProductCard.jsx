import React, { useCallback, memo } from "react";

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

    //////////////////////////////////////////
    // MEMOIZED HANDLERS
    //////////////////////////////////////////

    const viewDetails = useCallback(() => {
        handleViewDetails(item._id);
    }, [handleViewDetails, item._id]);

    const orderProduct = useCallback(() => {
        handleOrder(item);
    }, [handleOrder, item]);

    //////////////////////////////////////////
    // PRICE
    //////////////////////////////////////////

    const hasDiscount =
        item.discountedPrice &&
        item.discountedPrice > 0;

    //////////////////////////////////////////
    // STOCK
    //////////////////////////////////////////

    const inStock =
        item.countInStock > 0;

    return (

        <div className="group relative overflow-hidden bg-white/10 backdrop-blur-lg border border-white/10 p-3 sm:p-4 rounded-2xl text-white shadow-lg transition-all duration-300 hover:shadow-orange-500/20 active:scale-[0.98] will-change-transform">

            {/* BACKGROUND EFFECT */}

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

            {/* HOT BADGE */}

            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">

                <FaFire />

                Hot
            </div>

            {/* IMAGE */}

            <div className="bg-white/5 rounded-2xl p-2 mb-3 overflow-hidden">

                <img
                    src={item.images?.[0]}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    onClick={viewDetails}
                    className="h-40 sm:h-52 w-full object-contain rounded-xl cursor-pointer transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* TITLE */}

            <h2
                className="font-bold text-sm sm:text-base lg:text-lg cursor-pointer line-clamp-2 min-h-[48px]"
                onClick={viewDetails}
            >
                {item.name}
            </h2>

            {/* PRICE */}

            <div className="flex items-center gap-2 flex-wrap mt-2">

                {hasDiscount ? (
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

            {/* STOCK */}

            <div className="flex items-center justify-between mt-3 mb-2">

                <div className="flex items-center gap-2 text-sm">

                    <FaBoxOpen className="text-orange-300" />

                    <span>
                        Stock: {item.countInStock}
                    </span>
                </div>

                <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${inStock
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                        }`}
                >
                    {inStock
                        ? "Available"
                        : "Out"}
                </span>
            </div>

            {/* VIEW DETAILS */}

            <Button
                fullWidth
                startIcon={<FaEye />}
                onClick={viewDetails}
                sx={{
                    background: "#124b68",
                    color: "white",
                    mt: 2,
                    borderRadius: "12px",
                    padding: "10px",
                    fontWeight: "bold",
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        background: "#124b68",
                    },
                }}
            >
                View Details
            </Button>

            {/* ORDER */}

            <Button
                fullWidth
                startIcon={<FaShoppingCart />}
                onClick={orderProduct}
                disabled={!inStock}
                sx={{
                    background: "#eb6a00",
                    color: "white",
                    mt: 1,
                    borderRadius: "12px",
                    padding: "10px",
                    fontWeight: "bold",
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        background: "#eb6a00",
                    },
                }}
            >
                {!inStock
                    ? "Out of stock"
                    : "Order"}
            </Button>
        </div>
    );
}

export default memo(ProductCard);