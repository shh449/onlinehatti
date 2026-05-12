import React from "react";

export default function ProductFilters({
    filters,
    selectedFilter,
    setSelectedFilter,
}) {
    if (!filters?.length) return null;

    return (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-8">
            <button
                onClick={() => setSelectedFilter("")}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${selectedFilter === ""
                    ? "bg-[#eb6a00] text-white"
                    : "bg-white/10 text-white"
                    }`}
            >
                All
            </button>

            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap capitalize transition-all ${selectedFilter === filter
                        ? "bg-[#eb6a00] text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
}