import React from "react";
import {
    Modal,
    TextField,
    Button,
    MenuItem,
} from "@mui/material";

import {
    categories,
    subcategories,
    colorOptions,
    sizeOptions,
} from "./constants";

export default function ProductModal({
    open,
    onClose,
    currentProduct,
    setCurrentProduct,
    handleSave,
    handleImageUpload,
    removeImage,
}) {

    const glassInput = {
        input: { color: "white" },

        label: { color: "white" },

        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: "white",
            },

            "&:hover fieldset": {
                borderColor: "#eb6a00",
            },

            "&.Mui-focused fieldset": {
                borderColor: "#eb6a00",
            },
        },
    };

    const handleChange = (e) => {
        setCurrentProduct({
            ...currentProduct,
            [e.target.name]: e.target.value,
        });
    };

    const toggleColor = (color) => {
        const exists =
            currentProduct.availableColors.includes(color);

        setCurrentProduct({
            ...currentProduct,
            availableColors: exists
                ? currentProduct.availableColors.filter(
                    (c) => c !== color
                )
                : [
                    ...currentProduct.availableColors,
                    color,
                ],
        });
    };

    const toggleSize = (size) => {
        const exists =
            currentProduct.availableSizes.includes(size);

        let updatedSizes = exists
            ? currentProduct.availableSizes.filter(
                (s) => s !== size
            )
            : [...currentProduct.availableSizes, size];

        let updatedPricing = [...currentProduct.sizePricing];

        if (!exists) {
            updatedPricing.push({
                size,
                price: currentProduct.price || 0,
                discountedPrice:
                    currentProduct.discountedPrice || "",
                stock:
                    currentProduct.countInStock || 0,
            });
        } else {
            updatedPricing = updatedPricing.filter(
                (s) => s.size !== size
            );
        }

        setCurrentProduct({
            ...currentProduct,
            availableSizes: updatedSizes,
            sizePricing: updatedPricing,
        });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                <div className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                    <h2 className="text-2xl font-bold text-white text-center mb-5">
                        {currentProduct._id
                            ? "Edit Product"
                            : "Add Product"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <TextField
                            label="Name"
                            name="name"
                            value={currentProduct.name}
                            onChange={handleChange}
                            fullWidth
                            sx={glassInput}
                        />

                        <TextField
                            select
                            label="Category"
                            name="category"
                            value={currentProduct.category}
                            onChange={handleChange}
                            fullWidth
                            sx={glassInput}
                        >
                            {categories
                                .filter((c) => c !== "all")
                                .map((cat) => (
                                    <MenuItem
                                        key={cat}
                                        value={cat}
                                    >
                                        {cat}
                                    </MenuItem>
                                ))}
                        </TextField>

                        <TextField
                            select
                            label="Subcategory"
                            name="subcategory"
                            value={
                                currentProduct.subcategory
                            }
                            onChange={handleChange}
                            fullWidth
                            sx={glassInput}
                        >
                            {(subcategories[
                                currentProduct.category
                            ] || []).map((sub) => (
                                <MenuItem
                                    key={sub}
                                    value={sub}
                                >
                                    {sub}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Price"
                            name="price"
                            type="number"
                            value={currentProduct.price}
                            onChange={handleChange}
                            fullWidth
                            sx={glassInput}
                        />

                        <TextField
                            label="Discounted Price"
                            name="discountedPrice"
                            type="number"
                            value={
                                currentProduct.discountedPrice
                            }
                            onChange={handleChange}
                            fullWidth
                            sx={glassInput}
                        />

                        <TextField
                            label="Stock"
                            name="countInStock"
                            type="number"
                            value={
                                currentProduct.countInStock
                            }
                            onChange={handleChange}
                            fullWidth
                            sx={glassInput}
                        />

                        <TextField
                            label="Rating"
                            name="rating"
                            type="number"
                            value={currentProduct.rating}
                            onChange={handleChange}
                            fullWidth
                            sx={glassInput}
                        />

                    </div>

                    <TextField
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        value={currentProduct.description}
                        onChange={handleChange}
                        fullWidth
                        sx={{
                            ...glassInput,
                            mt: 3,
                        }}
                    />

                    <div className="mt-4">
                        <Button
                            variant="contained"
                            component="label"
                            sx={{
                                background: "#124b68",
                                borderRadius: "10px",
                            }}
                        >
                            Upload Images

                            <input
                                hidden
                                multiple
                                type="file"
                                onChange={handleImageUpload}
                            />
                        </Button>

                        <div className="flex flex-wrap gap-2 mt-3">
                            {currentProduct.images.map(
                                (img, index) => (
                                    <div
                                        key={index}
                                        className="relative"
                                    >
                                        <img
                                            src={img}
                                            className="h-20 w-20 object-cover rounded-lg"
                                        />

                                        <button
                                            onClick={() =>
                                                removeImage(
                                                    index
                                                )
                                            }
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2"
                                        >
                                            X
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-white font-semibold mb-2">
                            Colors
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {colorOptions.map((color) => (
                                <div
                                    key={color}
                                    onClick={() =>
                                        toggleColor(color)
                                    }
                                    className={`w-7 h-7 rounded-full border-2 cursor-pointer ${currentProduct.availableColors.includes(
                                        color
                                    )
                                            ? "border-white"
                                            : "border-gray-500"
                                        }`}
                                    style={{
                                        backgroundColor:
                                            color,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-white font-semibold mb-2">
                            Sizes
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {sizeOptions.map((size) => (
                                <button
                                    key={size}
                                    onClick={() =>
                                        toggleSize(size)
                                    }
                                    className={`px-3 py-1 rounded border ${currentProduct.availableSizes.includes(
                                        size
                                    )
                                            ? "bg-white/20 border-white"
                                            : "border-gray-500"
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                color: "white",
                                borderColor: "white",
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSave}
                            sx={{
                                background: "#eb6a00",
                                borderRadius: "10px",
                            }}
                        >
                            Save Product
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}