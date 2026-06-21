import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

interface Props {
    product: Product;
}

const ProductCard = ({ product }: Props) => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const { addToCart, updateQuantity, items } = useCart();
    const { isFavorite, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const cartItem = items.find((i) => i.product?.id === product.id);
    const cartQty = cartItem?.quantity ?? 0;
    const fav = isFavorite(product.id);

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

                {/* Heart / Favorite */}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                    className="absolute top-3 right-3 size-7 rounded-full bg-white/80 backdrop-blur-sm flex-center shadow-soft hover:scale-110 active:scale-95 transition-all duration-200"
                    aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart className={`size-4 transition-colors ${fav ? "fill-red-500 text-red-500" : "text-app-text-light"}`} />
                </button>
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
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1 min-w-0 truncate">
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

                    {cartQty === 0 ? (
                        /* Empty state — single Add button */
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                            }}
                            className="size-9 rounded-full bg-linear-to-br from-app-orange to-app-orange-dark text-white flex-center shrink-0 shadow-glow hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300"
                            aria-label="Add to cart"
                        >
                            <Plus className="size-4" strokeWidth={2.5} />
                        </button>
                    ) : (
                        /* In-cart state — Blinkit/Zepto style − qty + stepper (compact) */
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center h-9 rounded-full bg-linear-to-br from-app-orange to-app-orange-dark text-white shrink-0 shadow-glow overflow-hidden animate-scale-in"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product.id, cartQty - 1);
                                }}
                                className="w-7 h-9 flex-center hover:bg-black/15 active:scale-90 transition-all"
                                aria-label={cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
                            >
                                <Minus className="size-3.5" strokeWidth={3} />
                            </button>
                            <span className="min-w-4 text-center text-sm font-bold tabular-nums select-none">
                                {cartQty}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product.id, cartQty + 1);
                                }}
                                className="w-7 h-9 flex-center hover:bg-black/15 active:scale-90 transition-all"
                                aria-label="Increase quantity"
                            >
                                <Plus className="size-3.5" strokeWidth={3} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
