import React, { memo } from "react";

function CategoryTabs({
    categories,
    category,
    setCategory,
}) {

    return (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-8 scroll-smooth">

            {categories.map((cat) => (

                <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`whitespace-nowrap px-5 py-3 rounded-2xl capitalize transition-all duration-300 border flex-shrink-0 ${category === cat
                        ? "bg-[#eb6a00] text-white border-orange-400"
                        : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}

export default memo(CategoryTabs);