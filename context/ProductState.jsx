import React, { useState, useEffect } from "react";
import notecontext from "./notecontext";

export default function ProductState(props) {

    // State variables
    const [product, setProduct] = useState([]);
    const [cart, setCart] = useState({ items: [] });

    // ✅ NEW STATES FOR PAGINATION
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);

    //////////////////////////////////////////
    // Fetch products with pagination
    //////////////////////////////////////////
    const getProduct = async (pageNumber = 1, reset = false) => {
        if (loadingProducts) return;

        try {
            setLoadingProducts(true);

            const response = await fetch(
                `http://localhost:5000/api/product/getallproducts?page=${pageNumber}&limit=12`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const data = await response.json();

            if (data.products) {

                const newProducts = data.products;

                // Deduplicate + append
                setProduct(prev => {
                    const merged = reset ? newProducts : [...prev, ...newProducts];
                    const unique = [...new Map(merged.map(p => [p._id, p])).values()];
                    return unique;
                });

                setHasMore(data.hasMore);
                setPage(pageNumber);
            }

        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    //////////////////////////////////////////
    // Load next page
    //////////////////////////////////////////
    const loadMoreProducts = () => {
        if (!hasMore || loadingProducts) return;
        getProduct(page + 1);
    };

    //////////////////////////////////////////
    // Reset products (for search/filter)
    //////////////////////////////////////////
    const resetProducts = () => {
        setProduct([]);
        setPage(1);
        setHasMore(true);
        getProduct(1, true);
    };

    //////////////////////////////////////////
    // Cart APIs (UNCHANGED)
    //////////////////////////////////////////
    const addToCart = async (id, quantity = 1, selectedImage = "", selectedOptions = {}) => {
        try {
            const response = await fetch("http://localhost:5000/api/cart/addcart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    _id: id,
                    quantity,
                    selectedImage,
                    selectedOptions
                }),
            });
            const json = await response.json();
            if (json.cart) setCart(json.cart);
            await getCart();
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    const getCart = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/cart/getcart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
            });
            const json = await response.json();
            if (json.cart) setCart(json.cart);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const increaseValue = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cart/increasevalue/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
            });
            const json = await response.json();
            if (json.cart) setCart(json.cart);
        } catch (error) {
            console.error("Error increasing cart value:", error);
        }
    };

    const decreaseValue = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cart/decreasevalue/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
            });
            const json = await response.json();
            if (json.cart) setCart(json.cart);
        } catch (error) {
            console.error("Error decreasing cart value:", error);
        }
    };

    const deleteCart = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/cart/removecart/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token"),
                },
            });
            const json = await response.json();
            if (json.cart) setCart(json.cart);
        } catch (error) {
            console.error("Error deleting cart item:", error);
        }
    };

    //////////////////////////////////////////
    // Load cart on mount
    //////////////////////////////////////////
    useEffect(() => {
        if (localStorage.getItem("token")) getCart();
    }, []);

    //////////////////////////////////////////
    // Provide context values
    //////////////////////////////////////////
    return (
        <notecontext.Provider
            value={{
                getProduct,
                product,
                addToCart,
                cart,
                getCart,
                decreaseValue,
                deleteCart,
                increaseValue,

                // ✅ NEW EXPORTS
                loadMoreProducts,
                hasMore,
                loadingProducts,
                resetProducts
            }}
        >
            {props.children}
        </notecontext.Provider>
    );
}