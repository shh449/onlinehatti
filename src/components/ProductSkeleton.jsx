import React from "react";

export default function ProductSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(10)
                .fill(0)
                .map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-white/10 rounded-2xl p-4 h-[320px]"
                    />
                ))}
        </div>
    );
}