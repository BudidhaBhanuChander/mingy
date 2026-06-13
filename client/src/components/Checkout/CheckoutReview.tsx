import { CheckIcon, TruckIcon } from "lucide-react";
import type { Address } from "../../types";

interface CheckoutReviewProps {
    address: Address;
    items: any[];
    handlePlaceOrder: () => void;
    loading: boolean;
    total: number;
}

export default function CheckoutReview({ address, items, handlePlaceOrder, loading, total }: CheckoutReviewProps) {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    return (
        <div className="bg-white rounded-2xl p-6 animate-fade-in shadow-soft border border-app-border/60">
            <h2 className="text-lg font-bold text-app-green mb-5 flex items-center gap-2">
                <span className="size-8 rounded-lg bg-app-cream flex-center text-app-green"><CheckIcon className="size-4.5" /></span> Review Your Order
            </h2>

            {/* Delivery Info */}
            <div className="mb-5 p-4 bg-app-cream rounded-xl border border-app-border/50">
                <div className="flex items-center gap-2 mb-2">
                    <TruckIcon className="size-4 text-app-green" />
                    <span className="text-sm font-semibold text-app-green">Delivery Address</span>
                </div>
                <p className="text-sm text-app-text-light">
                    {address.label} — {address.address}, {address.city}, {address.state} {address.zip}
                </p>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-5">
                {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-app-cream/60 transition-colors">
                        <img src={item.product.image} alt={item.product.name} className="size-12 rounded-lg object-cover bg-app-cream" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-app-green">{item.product.name}</p>
                            <p className="text-xs text-app-text-light">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold">
                            {currency}
                            {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full !rounded-xl disabled:opacity-60 disabled:hover:translate-y-0">
                {loading ? "Placing Order..." : `Place Order — ${currency}${total.toFixed(2)}`}
            </button>
        </div>
    );
}
