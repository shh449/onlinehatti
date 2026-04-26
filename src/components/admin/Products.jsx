import React, { useEffect, useState } from "react";
import { Button, Modal, TextField } from "@mui/material";
import { apiGet, apiPost, apiPut, apiDelete } from "../../services/api";

export default function Products() {
    const emptyProduct = {
        _id: "",
        name: "",
        description: "",
        price: "",
        discountedPrice: "", // Optional
        countInStock: "",
        category: "",
        rating: "", // Optional
        images: [],
        availableColors: [],
        availableSizes: [],
        sizePricing: []
    };

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(emptyProduct);

    const colorOptions = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFA500", "#800080"];
    const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
    const API = import.meta.env.VITE_API_URL;
    // Fetch all products
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await apiGet("product/adminproducts");
            setProducts(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Delete a product
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            await apiDelete(`product/deleteproduct/${id}`);
            fetchProducts();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // Open modal for adding or editing
    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct({
                _id: product._id || "",
                name: product.name || "",
                description: product.description || "",
                price: product.price || "",
                discountedPrice: product.discountedPrice || "", // Optional
                countInStock: product.countInStock || "",
                category: product.category || "",
                rating: product.rating || "", // Optional
                images: product.images || [],
                availableColors: product.availableColors || [],
                availableSizes: product.availableSizes || [],
                sizePricing: product.sizePricing || []
            });
        } else {
            setCurrentProduct({ ...emptyProduct, _id: "" });
        }
        setOpenModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentProduct(emptyProduct);
    };

    // Handle input changes
    const handleChange = (e) => {
        setCurrentProduct({
            ...currentProduct,
            [e.target.name]: e.target.value
        });
    };

    // Upload images
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const token = localStorage.getItem("token");

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("image", file);

                const res = await fetch(`${API}api/upload/image`, {
                    method: "POST",
                    headers: { "auth-token": token },
                    body: formData
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message);

                return data;
            });

            const results = await Promise.all(uploadPromises);

            const uploadedImages = results.map(r => r.imageUrl);
            const uploadedPublicIds = results.map(r => r.public_id);

            setCurrentProduct(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedImages],
                imagePublicIds: [...(prev.imagePublicIds || []), ...uploadedPublicIds]
            }));

        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    // Remove uploaded image
    const removeImage = (index) => {
        const updated = [...currentProduct.images];
        updated.splice(index, 1);
        setCurrentProduct({ ...currentProduct, images: updated });
    };

    // Handle color selection (optional)
    const toggleColor = (color) => {
        setCurrentProduct(prev => {
            const exists = prev.availableColors.includes(color);
            const updatedColors = exists
                ? prev.availableColors.filter(c => c !== color)
                : [...prev.availableColors, color];
            return { ...prev, availableColors: updatedColors };
        });
    };

    // Handle size selection (optional)
    const toggleSize = (size) => {
        setCurrentProduct(prev => {
            const exists = prev.availableSizes.includes(size);
            const updatedSizes = exists
                ? prev.availableSizes.filter(s => s !== size)
                : [...prev.availableSizes, size];

            // Add default sizePricing if new size selected
            let updatedSizePricing = [...prev.sizePricing];
            if (!exists) {
                updatedSizePricing.push({
                    size,
                    price: prev.price || 0,
                    discountedPrice: prev.discountedPrice || "", // Optional
                    stock: prev.countInStock || 0
                });
            } else {
                // Remove sizePricing if size deselected
                updatedSizePricing = updatedSizePricing.filter(sp => sp.size !== size);
            }

            return { ...prev, availableSizes: updatedSizes, sizePricing: updatedSizePricing };
        });
    };

    // Handle size pricing changes
    const handleSizePricingChange = (index, field, value) => {
        const updated = [...currentProduct.sizePricing];
        updated[index][field] = value;
        setCurrentProduct({ ...currentProduct, sizePricing: updated });
    };

    // Save product (add or update)
    const handleSave = async () => {
        const { _id, name, description, price, countInStock, category, images, discountedPrice, rating } = currentProduct;

        // Validate required fields
        if (!name || !description || !price || !countInStock || !category || images.length === 0) {
            return alert("Please fill all mandatory fields and upload images");
        }

        // Validate sizePricing if sizes selected
        if (currentProduct.availableSizes.length > 0) {
            for (let sp of currentProduct.sizePricing) {
                if (!sp.price || sp.stock === undefined) {
                    return alert(`Please set price and stock for size ${sp.size}`);
                }
            }
        }

        // Build payload
        const payload = {
            ...currentProduct,
            price: Number(currentProduct.price),
            countInStock: Number(currentProduct.countInStock)
        };

        // Optional fields: only include if they have a valid number
        if (discountedPrice !== "" && discountedPrice !== null && discountedPrice !== undefined) {
            payload.discountedPrice = Number(discountedPrice);
        } else {
            delete payload.discountedPrice;
        }

        if (rating !== "" && rating !== null && rating !== undefined) {
            payload.rating = Number(rating);
        } else {
            delete payload.rating;
        }

        // Handle sizePricing optional discountedPrice
        payload.sizePricing = currentProduct.sizePricing.map(sp => {
            const spCopy = { ...sp };
            spCopy.price = Number(spCopy.price);
            spCopy.stock = Number(spCopy.stock);

            if (spCopy.discountedPrice === "" || spCopy.discountedPrice === null || spCopy.discountedPrice === undefined) {
                delete spCopy.discountedPrice;
            } else {
                spCopy.discountedPrice = Number(spCopy.discountedPrice);
            }

            return spCopy;
        });

        try {
            if (_id) {
                await apiPut(`product/updateproduct/${_id}`, payload);
            } else {
                await apiPost("product/addproducts", payload);
            }

            handleCloseModal();
            fetchProducts();
        } catch (err) {
            console.error("Save error:", err);
            alert("Error saving product. Check console for details.");
        }
    };

    // Styling for glassy inputs
    const glassInput = {
        input: { color: "white" },
        label: { color: "white" },
        "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "white" },
            "&:hover fieldset": { borderColor: "#eb6a00" },
            "&.Mui-focused fieldset": { borderColor: "#eb6a00" },
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: "#eb6a00",
        },
    };

    if (loading) return <div className="p-6 text-white">Loading...</div>;

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-[#124b68] to-[#eb6a00]">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 text-white">
                <div className="mb-4 sm:mb-0">
                    <h1 className="text-3xl font-bold">Manage Products</h1>
                    <p className="text-gray-200">Admin Dashboard</p>
                </div>

                <Button
                    variant="contained"
                    onClick={() => handleOpenModal()}
                    sx={{ background: "#eb6a00", borderRadius: "12px", paddingX: "20px" }}
                >
                    Add Product
                </Button>
            </div>

            {/* Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                    <div key={p._id} className="p-4 rounded-3xl backdrop-blur-lg bg-white/20 text-white shadow-lg hover:scale-105 transform transition">
                        <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-40 w-full object-cover rounded-xl mb-3"
                        />

                        <h2 className="text-lg font-bold">{p.name}</h2>
                        <p className="text-sm text-gray-200">{p.description}</p>

                        <div className="flex justify-between mt-2">
                            {p.discountedPrice ? (
                                <div className="flex flex-col">
                                    <span className="line-through text-gray-300">${p.price}</span>
                                    <span className="font-bold text-lg text-yellow-400">${p.discountedPrice}</span>
                                </div>
                            ) : (
                                <span className="font-bold">${p.price}</span>
                            )}
                            <span>Stock: {p.countInStock}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                            {p.availableColors && p.availableColors.map((color, i) => (
                                <div key={i} className="w-5 h-5 rounded-full border-2" style={{ backgroundColor: color }}></div>
                            ))}
                            {p.availableSizes && p.availableSizes.map((size, i) => (
                                <span key={i} className="px-2 py-1 border rounded text-xs">{size}</span>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-4 flex-col sm:flex-row">
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ background: "#124b68", borderRadius: "10px" }}
                                onClick={() => handleOpenModal(p)}
                            >
                                Edit
                            </Button>

                            <Button
                                fullWidth
                                variant="contained"
                                color="error"
                                sx={{ borderRadius: "10px" }}
                                onClick={() => handleDelete(p._id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white text-center mb-5">
                            {currentProduct._id ? "Edit Product" : "Add Product"}
                        </h2>

                        <div className="flex flex-col gap-4">
                            <TextField label="Name" name="name" value={currentProduct.name} onChange={handleChange} fullWidth sx={glassInput} />
                            <TextField label="Description" name="description" value={currentProduct.description} onChange={handleChange} fullWidth multiline rows={3} sx={glassInput} />
                            <TextField label="Price" name="price" type="number" value={currentProduct.price} onChange={handleChange} fullWidth sx={glassInput} />
                            <TextField label="Discounted Price (Optional)" name="discountedPrice" type="number" value={currentProduct.discountedPrice} onChange={handleChange} fullWidth sx={glassInput} />
                            <TextField label="Stock" name="countInStock" type="number" value={currentProduct.countInStock} onChange={handleChange} fullWidth sx={glassInput} />
                            <TextField label="Category" name="category" value={currentProduct.category} onChange={handleChange} fullWidth sx={glassInput} />
                            <TextField label="Rating (Optional)" name="rating" type="number" value={currentProduct.rating} onChange={handleChange} fullWidth sx={glassInput} />

                            {/* Upload Images */}
                            <Button variant="contained" component="label" sx={{ background: "#124b68", borderRadius: "10px" }}>
                                Upload Images
                                <input type="file" hidden multiple onChange={handleImageUpload} />
                            </Button>
                            <div className="flex flex-wrap gap-2">
                                {currentProduct.images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img src={img} className="h-20 w-20 object-cover rounded-lg" />
                                        <button onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2">X</button>
                                    </div>
                                ))}
                            </div>

                            {/* Color Selection (Optional) */}
                            <div>
                                <p className="text-white mb-1 font-semibold">Available Colors (Optional):</p>
                                <div className="flex gap-2 flex-wrap">
                                    {colorOptions.map((color) => (
                                        <div key={color} onClick={() => toggleColor(color)}
                                            className={`w-6 h-6 rounded-full border-2 cursor-pointer ${currentProduct.availableColors.includes(color) ? "border-white" : "border-gray-500"}`}
                                            style={{ backgroundColor: color }}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selection (Optional) */}
                            <div>
                                <p className="text-white mb-1 font-semibold">Available Sizes (Optional):</p>
                                <div className="flex gap-2 flex-wrap">
                                    {sizeOptions.map((size) => (
                                        <button key={size} onClick={() => toggleSize(size)}
                                            className={`px-3 py-1 rounded border-2 cursor-pointer ${currentProduct.availableSizes.includes(size) ? "border-white bg-white/20" : "border-gray-500"}`}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Pricing (Optional per size) */}
                            {currentProduct.sizePricing.length > 0 && (
                                <div>
                                    <p className="text-white mb-1 font-semibold">Size-based Pricing (Optional Discount):</p>
                                    {currentProduct.sizePricing.map((sp, index) => (
                                        <div key={sp.size} className="flex gap-2 mb-2 flex-wrap sm:flex-nowrap items-center">
                                            <span className="text-white w-10">{sp.size}</span>
                                            <TextField
                                                label="Price"
                                                type="number"
                                                value={sp.price}
                                                onChange={(e) => handleSizePricingChange(index, "price", Number(e.target.value))}
                                                sx={{ ...glassInput, width: "100px" }}
                                            />
                                            <TextField
                                                label="Discounted Price (Optional)"
                                                type="number"
                                                value={sp.discountedPrice || ""}
                                                onChange={(e) => handleSizePricingChange(index, "discountedPrice", Number(e.target.value))}
                                                sx={{ ...glassInput, width: "120px" }}
                                            />
                                            <TextField
                                                label="Stock"
                                                type="number"
                                                value={sp.stock}
                                                onChange={(e) => handleSizePricingChange(index, "stock", Number(e.target.value))}
                                                sx={{ ...glassInput, width: "100px" }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-2 flex-wrap sm:flex-nowrap">
                                <Button variant="outlined" onClick={handleCloseModal} sx={{ color: "white", borderColor: "white" }}>
                                    Cancel
                                </Button>
                                <Button variant="contained" onClick={handleSave} sx={{ background: "#eb6a00", borderRadius: "10px", paddingX: "20px" }}>
                                    Save Product
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}