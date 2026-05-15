import React, { memo } from "react";
import ProductCard from "./ProductCard";

function ProductGrid({
    products,
    handleViewDetails,
    handleOrder,
    lastProductRef,
}) {

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">

            {products.map((item, index) => {

                if (
                    products.length === index + 1
                ) {
                    return (
                        <div
                            ref={lastProductRef}
                            key={item._id}
                        >
                            <ProductCard
                                item={item}
                                handleViewDetails={handleViewDetails}
                                handleOrder={handleOrder}
                            />
                        </div>
                    );
                }

                return (
                    <ProductCard
                        key={item._id}
                        item={item}
                        handleViewDetails={handleViewDetails}
                        handleOrder={handleOrder}
                    />
                );
            })}
        </div>
    );
}

export default memo(ProductGrid);