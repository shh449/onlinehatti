import React from "react";

export default function ProductSkeleton() {

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

            {Array(10)
                .fill(0)
                .map((_, i) => (

                    <div
                        key={i}
                        className="animate-pulse bg-white/10 rounded-2xl p-4 h-[320px] backdrop-blur-sm border border-white/10"
                    >
                        <div className="w-full h-40 rounded-xl bg-white/10 mb-4"></div>

                        <div className="h-4 rounded bg-white/10 mb-3"></div>

                        <div className="h-4 rounded bg-white/10 w-2/3 mb-5"></div>

                        <div className="h-10 rounded-xl bg-white/10"></div>
                    </div>
                ))}
        </div>
    );
}