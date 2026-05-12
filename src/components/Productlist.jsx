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
    const { getCart } = useContext(notecontext);

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");
    const [selectedFilter, setSelectedFilter] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();

    const [shippingAddress, setShippingAddress] = useState({
        address: "",
        city: "",
        postalcode: "",
        country: "",
        contact: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("COD");

    const fetchProducts = async (pageNumber = 1) => {
        try {
            const res = await fetch(
                `https://onlinehattid-production.up.railway.app/api/product/getallproducts?page=${pageNumber}&limit=12`
            );

            const data = await res.json();

            if (pageNumber === 1) {
                setProducts(data.products || []);
            } else {
                setProducts((prev) => [
                    ...prev,
                    ...(data.products || []),
                ]);
            }

            setHasMore(data.hasMore);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);
    const lastProductRef = useCallback(
        (node) => {
            if (loading) return;

            if (observer.current) {
                observer.current.disconnect();
            }

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (
                        entries[0].isIntersecting &&
                        hasMore
                    ) {
                        setPage((prev) => prev + 1);
                    }
                }
            );

            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page);
        }
    }, [page]);

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchCategory =
                category === "all" ||
                p.category?.toLowerCase() === category;

            const matchSearch =
                p.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchFilter =
                !selectedFilter ||
                p.subcategory === selectedFilter ||
                p.tags?.includes(selectedFilter);

            return (
                matchCategory &&
                matchSearch &&
                matchFilter
            );
        });
    }, [
        products,
        category,
        searchTerm,
        selectedFilter,
    ]);
    const handleViewDetails = (id) => {
        navigate(`/product/${id}`);
    };

    const handleOrder = (item) => {
        setSelectedProduct(item);
        setQuantity(1);
        setShowModal(true);
    };

    const calculatePrice = (prod) =>
        prod.discountedPrice
            ? prod.discountedPrice
            : prod.price;

    const calculateTotal = (prod, qty) => {
        const delivery = prod.deliveryCharge || 5;

        return calculatePrice(prod) * qty + delivery;
    };

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
                        "Content-Type": "application/json",
                        "auth-token": localStorage.getItem("token"),
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

                {loading ? (
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