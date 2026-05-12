import React, {
    useEffect,
    useState,
} from "react";

import { Button } from "@mui/material";

import {
    apiDelete,
    apiGet,
    apiPost,
    apiPut,
} from "../../services/api";

import ProductGrid from "./ProductGrid";

import ProductModal from "./ProductModal";

export default function Products() {

    const API = import.meta.env.VITE_API_URL;

    const emptyProduct = {
        _id: "",
        name: "",
        description: "",
        category: "",
        subcategory: "",
        price: "",
        discountedPrice: "",
        countInStock: "",
        rating: "",
        images: [],
        imagePublicIds: [],
        availableColors: [],
        availableSizes: [],
        sizePricing: [],
    };

    const [products, setProducts] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [openModal, setOpenModal] =
        useState(false);

    const [currentProduct, setCurrentProduct] =
        useState(emptyProduct);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const data = await apiGet(
                "product/adminproducts"
            );

            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Delete this product?"
            )
        )
            return;

        try {
            await apiDelete(
                `product/deleteproduct/${id}`
            );

            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenModal = (
        product = null
    ) => {
        if (product) {
            setCurrentProduct(product);
        } else {
            setCurrentProduct(emptyProduct);
        }

        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);

        setCurrentProduct(emptyProduct);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(
            e.target.files
        );

        const token =
            localStorage.getItem("token");

        try {
            const uploadPromises = files.map(
                async (file) => {
                    const formData =
                        new FormData();

                    formData.append(
                        "image",
                        file
                    );

                    const res = await fetch(
                        `${API}api/upload/image`,
                        {
                            method: "POST",

                            headers: {
                                "auth-token":
                                    token,
                            },

                            body: formData,
                        }
                    );

                    const data =
                        await res.json();

                    return data;
                }
            );

            const results =
                await Promise.all(
                    uploadPromises
                );

            setCurrentProduct((prev) => ({
                ...prev,

                images: [
                    ...prev.images,
                    ...results.map(
                        (r) => r.imageUrl
                    ),
                ],

                imagePublicIds: [
                    ...prev.imagePublicIds,
                    ...results.map(
                        (r) => r.public_id
                    ),
                ],
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const removeImage = (index) => {
        const updated = [
            ...currentProduct.images,
        ];

        updated.splice(index, 1);

        setCurrentProduct({
            ...currentProduct,
            images: updated,
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...currentProduct,

                price: Number(
                    currentProduct.price
                ),

                discountedPrice:
                    currentProduct.discountedPrice
                        ? Number(
                            currentProduct.discountedPrice
                        )
                        : null,

                countInStock: Number(
                    currentProduct.countInStock
                ),

                rating: currentProduct.rating
                    ? Number(
                        currentProduct.rating
                    )
                    : 0,
            };

            if (payload._id) {
                await apiPut(
                    `product/updateproduct/${payload._id}`,
                    payload
                );
            } else {
                await apiPost(
                    "product/addproducts",
                    payload
                );
            }

            handleCloseModal();

            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#124b68] to-[#eb6a00] text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-[#124b68] to-[#eb6a00]">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 text-white">

                <div>
                    <h1 className="text-3xl font-bold">
                        Manage Products
                    </h1>

                    <p className="text-gray-200">
                        Admin Dashboard
                    </p>
                </div>

                <Button
                    variant="contained"
                    sx={{
                        background: "#eb6a00",
                        borderRadius: "12px",
                    }}
                    onClick={() =>
                        handleOpenModal()
                    }
                >
                    Add Product
                </Button>
            </div>

            <ProductGrid
                products={products}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <ProductModal
                open={openModal}
                onClose={handleCloseModal}
                currentProduct={currentProduct}
                setCurrentProduct={
                    setCurrentProduct
                }
                handleSave={handleSave}
                handleImageUpload={
                    handleImageUpload
                }
                removeImage={removeImage}
            />
        </div>
    );
}