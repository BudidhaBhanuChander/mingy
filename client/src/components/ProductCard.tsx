import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { Plus, Star } from "lucide-react";
import { useCart } from "../context/CartContext";

interface Props {
    product: Product;
}

const ProductCard = ({ product }: Props) => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const { addToCart } = useCart();
    const navigate = useNavigate();

    return (
        <div
            className="relative bg-white rounded-3xl overflow-hidden shadow-soft border border-app-border/60 card-lift group animate-fade-in cursor-pointer"
            onClick={() => navigate(`/products/${product.id}`)}
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-app-cream to-orange-50/50">
                {/* glow blob */}
                <div className="absolute -inset-6 bg-app-orange/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                    src={product.image}
                    alt={product.name}
                    className="relative w-full h-full object-cover p-5 group-hover:p-3 group-hover:scale-105 transition-all duration-500 ease-out"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.discount > 0 && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-app-orange to-app-orange-dark text-white rounded-full shadow-glow">
                            {product.discount}% OFF
                        </span>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-4 text-zinc-700">
                <h3 className="text-sm font-medium leading-snug mb-2 line-clamp-2 group-hover:text-app-green transition-colors">{product.name}</h3>

                {/* Rating */}
                {product.rating > 0 && (
                    <div className="inline-flex items-center gap-1 mb-2.5 px-2 py-0.5 rounded-full bg-amber-50 ring-1 ring-amber-200/60">
                        <Star className="size-3 text-app-warning fill-app-warning" />
                        <span className="text-xs font-semibold text-app-text">{product.rating}</span>
                        <span className="text-[11px] text-app-text-light">({product.reviewCount})</span>
                    </div>
                )}

                {/* Price + Add */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1 truncate">
                        <span className="text-lg font-bold text-app-green">
                            {currency}
                            {product.price.toFixed(1)}
                        </span>
                        <span className="text-xs text-app-text-light">/{product.unit}</span>
                        {product.originalPrice > product.price && (
                            <span className="text-xs text-app-text-light line-through ml-1">
                                {currency}
                                {product.originalPrice.toFixed(1)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                        }}
                        className="size-9 rounded-full bg-gradient-to-br from-app-orange to-app-orange-dark text-white flex-center shrink-0 shadow-glow hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300"
                        aria-label="Add to cart"
                    >
                        <Plus className="size-4" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
