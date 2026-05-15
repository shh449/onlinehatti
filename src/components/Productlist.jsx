import React, {
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
    useMemo,
} from "react";

import notecontext from "../../context/notecontext";
import Navbar from "./Navbar";

import ProductHero from "./ProductHero";
import CategoryTabs from "./CategoryTabs";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import EmptyState from "./EmptyState";
import ProductSkeleton from "./ProductSkeleton";
import OrderModal from "./OrderModal";

import {
    categories,
    categoryFilters,
} from "./constants";

import { useNavigate } from "react-router-dom";

export default function Productlist() {

    const {
        product,
        getProduct,
        loadMoreProducts,
        hasMore,
        loadingProducts,
        getCart,
    } = useContext(notecontext);

    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedFilter, setSelectedFilter] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const observer = useRef();

    const [shippingAddress, setShippingAddress] = useState({
        address: "",
        city: "",
        postalcode: "",
        country: "",
        contact: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");

    //////////////////////////////////////////
    // INITIAL LOAD
    //////////////////////////////////////////

    useEffect(() => {
        if (!product.length) {
            getProduct(1, true);
        }
    }, []);

    //////////////////////////////////////////
    // INFINITE SCROLL
    //////////////////////////////////////////

    const lastProductRef = useCallback(
        (node) => {

            if (loadingProducts) return;

            if (observer.current) {
                observer.current.disconnect();
            }

            observer.current = new IntersectionObserver(
                (entries) => {

                    if (
                        entries[0].isIntersecting &&
                        hasMore
                    ) {
                        loadMoreProducts();
                    }
                },
                {
                    threshold: 0.2,
                    rootMargin: "100px",
                }
            );

            if (node) {
                observer.current.observe(node);
            }
        },
        [loadingProducts, hasMore]
    );

    //////////////////////////////////////////
    // FILTER PRODUCTS
    //////////////////////////////////////////

    const filteredProducts = useMemo(() => {

        const normalizedCategory =
            category?.toLowerCase();

        return product.filter((p) => {

            const productCategory =
                p.category?.toLowerCase();

            const matchCategory =
                normalizedCategory === "all" ||
                productCategory === normalizedCategory;

            const matchSearch =
                p.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchFilter =
                !selectedFilter ||
                p.subcategory?.toLowerCase() ===
                selectedFilter.toLowerCase() ||
                p.tags?.some(
                    (tag) =>
                        tag.toLowerCase() ===
                        selectedFilter.toLowerCase()
                );

            return (
                matchCategory &&
                matchSearch &&
                matchFilter
            );
        });

    }, [
        product,
        category,
        searchTerm,
        selectedFilter,
    ]);

    //////////////////////////////////////////
    // NAVIGATION
    //////////////////////////////////////////

    const handleViewDetails = (id) => {
        navigate(`/product/${id}`);
    };

    //////////////////////////////////////////
    // ORDER
    //////////////////////////////////////////

    const handleOrder = (item) => {
        setSelectedProduct(item);
        setQuantity(1);
        setShowModal(true);
    };

    //////////////////////////////////////////
    // PRICE
    //////////////////////////////////////////

    const calculatePrice = (prod) =>
        prod.discountedPrice
            ? prod.discountedPrice
            : prod.price;

    const calculateTotal = (prod, qty) => {

        const delivery =
            prod.deliveryCharge || 5;

        return (
            calculatePrice(prod) *
            qty +
            delivery
        );
    };

    //////////////////////////////////////////
    // PLACE ORDER
    //////////////////////////////////////////

    const placeOrder = async () => {

        const payload = {
            productId: selectedProduct._id,
            quantity,
            shippingAddress,
            paymentMethod,
        };

        try {

            await fetch(
                "https://onlinehattid-production.up.railway.app/api/order/placeorder",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "auth-token":
                            localStorage.getItem(
                                "token"
                            ),
                    },
                    body: JSON.stringify(payload),
                }
            );

            setShowModal(false);

            getCart();

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Navbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onCategorySelect={setCategory}
                activeCategory={category}
            />

            <div className="pt-24 sm:pt-28 min-h-screen bg-gradient-to-br from-[#124b68] via-[#1b5d7e] to-[#eb6a00] px-3 sm:px-5 md:px-8 lg:px-12 xl:px-16 pb-10">

                <ProductHero />

                <CategoryTabs
                    categories={categories}
                    category={category}
                    setCategory={setCategory}
                />

                <ProductFilters
                    filters={categoryFilters[category]}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                />

                {loadingProducts && !product.length ? (
                    <ProductSkeleton />
                ) : filteredProducts.length > 0 ? (
                    <ProductGrid
                        products={filteredProducts}
                        handleViewDetails={handleViewDetails}
                        handleOrder={handleOrder}
                        lastProductRef={lastProductRef}
                    />
                ) : (
                    <EmptyState
                        setSearchTerm={setSearchTerm}
                        setCategory={setCategory}
                    />
                )}

                {loadingProducts &&
                    product.length > 0 && (
                        <div className="mt-8">
                            <ProductSkeleton />
                        </div>
                    )}

                <OrderModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    selectedProduct={selectedProduct}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    shippingAddress={shippingAddress}
                    setShippingAddress={setShippingAddress}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    placeOrder={placeOrder}
                    calculatePrice={calculatePrice}
                    calculateTotal={calculateTotal}
                />
            </div>
        </>
    );
}