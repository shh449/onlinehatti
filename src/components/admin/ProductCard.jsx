import React from "react";
import { Button } from "@mui/material";

export default function ProductCard({
    product,
    onEdit,
    onDelete,
}) {
    return (
        <div className="p-4 rounded-3xl backdrop-blur-lg bg-white/20 text-white shadow-lg hover:scale-105 transform transition">

            <img
                src={product.images?.[0]}
                alt={product.name}
                className="h-40 w-full object-cover rounded-xl mb-3"
            />

            <h2 className="text-lg font-bold">
                {product.name}
            </h2>

            <p className="text-sm text-gray-200 line-clamp-2">
                {product.description}
            </p>

            <div className="mt-2 flex justify-between">
                <div>
                    {product.discountedPrice ? (
                        <>
                            <p className="line-through text-gray-300 text-sm">
                                {product.price}Rs
                            </p>

                            <p className="text-yellow-400 font-bold text-lg">
                                {product.discountedPrice}Rs
                            </p>
                        </>
                    ) : (
                        <p className="font-bold">
                            {product.price}Rs
                        </p>
                    )}
                </div>

                <div className="text-sm">
                    Stock: {product.countInStock}
                </div>
            </div>

            <div className="mt-2">
                <span className="bg-white/10 px-2 py-1 rounded-lg text-xs">
                    {product.category}
                </span>

                {product.subcategory && (
                    <span className="bg-orange-500/20 ml-2 px-2 py-1 rounded-lg text-xs">
                        {product.subcategory}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
                {product.availableColors?.map((c, i) => (
                    <div
                        key={i}
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
                {product.availableSizes?.map((s, i) => (
                    <span
                        key={i}
                        className="px-2 py-1 border rounded text-xs"
                    >
                        {s}
                    </span>
                ))}
            </div>

            <div className="flex gap-2 mt-4">
                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        background: "#124b68",
                        borderRadius: "10px",
                    }}
                    onClick={() => onEdit(product)}
                >
                    Edit
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    sx={{
                        borderRadius: "10px",
                    }}
                    onClick={() => onDelete(product._id)}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}