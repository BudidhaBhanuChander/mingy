interface Category {
    slug: string;
    name: string;
}

interface FilterPanelProps {
    categories: Category[];
    category: string;
    organic: string;
    minPrice: string;
    maxPrice: string;
    updateFilter: (key: string, value: string) => void;
    clearFilters: () => void;
    hasFilters: boolean;
}

const FilterPanel = ({ categories, category, organic, minPrice, maxPrice, updateFilter, clearFilters, hasFilters }: FilterPanelProps) => {
    const categoriesWithAll: Category[] = [{ slug: "", name: "All Categories" }, ...categories];

    return (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h3 className="text-sm font-semibold text-app-green mb-3">Categories</h3>
                <div className="space-y-1.5">
                    {categoriesWithAll.map((cat: Category) => (
                        <button key={cat.slug} onClick={() => updateFilter("category", cat.slug)} className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${category === cat.slug ? "bg-gradient-to-r from-app-green-light to-app-green text-white font-medium shadow-glow-green" : "text-app-text-light hover:bg-app-cream hover:translate-x-1"}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-semibold text-app-green mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all" />

                    <span className="text-app-text-light">-</span>

                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all" />
                </div>
            </div>

            {/* Organic */}
            <div>
                <h3 className="text-sm font-semibold text-app-green mb-3">Type</h3>
                <button onClick={() => updateFilter("organic", organic === "true" ? "" : "true")} className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${organic === "true" ? "bg-linear-to-r from-app-green-light to-app-green text-white font-medium" : "text-app-text-light hover:bg-app-cream"}`}>
                    Organic Only
                </button>
            </div>

            {hasFilters && (
                <button onClick={clearFilters} className="w-full py-2 text-sm text-app-error hover:bg-red-50 rounded-lg transition-colors font-medium">
                    Clear All Filters
                </button>
            )}
        </div>
    );
};

export default FilterPanel;
