import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowRightIcon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon, XIcon } from "lucide-react";

const CartSidebar = () => {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const { items, updateQuantity, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();

    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const deliveryFee = cartTotal > 20 ? 0 : 1.99;
    const grandTotal = cartTotal + deliveryFee;

    return (
        <>
            {/* Overlay */}
            <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-app-green/40 backdrop-blur-sm z-50 transition-opacity animate-fade-in" />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-app-cream z-50 shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-app-border bg-white">
                    <div className="flex items-center gap-2">
                        <span className="size-9 rounded-xl bg-gradient-to-br from-app-orange to-app-orange-dark text-white flex-center shadow-glow">
                            <ShoppingBagIcon className="size-4.5" />
                        </span>
                        <h2 className="text-lg font-bold">Your Cart</h2>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-app-cream rounded-full">{items.length} items</span>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl hover:bg-app-cream transition-colors">
                        <XIcon className="size-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="size-20 rounded-full bg-white flex-center shadow-soft mb-4">
                                <ShoppingBagIcon className="size-9 text-app-border" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
                            <p className="text-sm text-app-text-light">Add some fresh goodies to get started</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="flex gap-3 bg-white rounded-2xl p-3 shadow-soft border border-app-border/50 hover:shadow-lift transition-shadow animate-fade-in">
                                <img src={item.product.image} alt={item.product.name} className="size-16 rounded-xl object-cover shrink-0 bg-app-cream" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold truncate">{item.product.name}</h4>
                                    <p className="text-xs text-app-text-light">
                                        {currency}
                                        {item.product.price.toFixed(2)} / {item.product.unit}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="size-7 rounded-lg bg-app-cream border border-app-border flex-center hover:bg-app-cream-dark active:scale-90 transition-all">
                                                <MinusIcon className="size-3" />
                                            </button>

                                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>

                                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="size-7 rounded-lg bg-app-cream border border-app-border flex-center hover:bg-app-cream-dark active:scale-90 transition-all">
                                                <PlusIcon className="size-3" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">
                                                {currency}
                                                {(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-app-text-light hover:text-app-error transition-colors">
                                                <Trash2Icon className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-5 border-t border-app-border space-y-3 bg-white">
                        <div className="flex justify-between text-sm">
                            <span className="text-app-text-light">Subtotal</span>
                            <span className="font-medium">
                                {currency}
                                {cartTotal.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-app-text-light">Delivery</span>
                            <span className="font-medium">{deliveryFee === 0 ? <span className="text-app-success">Free</span> : `${currency}${deliveryFee.toFixed(2)}`}</span>
                        </div>

                        {deliveryFee > 0 && <p className="text-xs text-app-text-light text-center">Free delivery on orders over {currency}20!</p>}

                        <div className="flex justify-between text-base font-semibold border-t border-app-border pt-3">
                            <span>Total</span>
                            <span>
                                {currency}
                                {grandTotal.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                setIsCartOpen(false);
                                navigate("/checkout");
                                window.scrollTo(0, 0);
                            }}
                            className="btn-primary w-full !rounded-xl group"
                        >
                            Proceed to Checkout <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
