import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { Address } from "../types";
import { ArrowLeft, CheckIcon, ChevronRightIcon, CreditCardIcon, MapPinIcon, TagIcon, XIcon } from "lucide-react";
import CheckoutAddress from "../components/Checkout/CheckoutAddress";
import CheckoutPayment from "../components/Checkout/CheckoutPayment";
import CheckoutReview from "../components/Checkout/CheckoutReview";
import api from "../config/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [step, setStep] = useState("address");
    const [loading, setLoading] = useState(false);

    const [address, setAddress] = useState<Address>({
        id: "",
        label: "Home",
        address: "",
        city: "",
        state: "",
        zip: "",
        isDefault: false,
        lat: 0,
        lng: 0,
    });

    const [paymentMethod, setPaymentMethod] = useState("card");

    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

    const deliveryFee = cartTotal > 20 ? 0 : 1.99;
    const tax = cartTotal * 0.08;
    const discount = appliedCoupon?.discount ?? 0;
    const total = cartTotal + deliveryFee + tax - discount;

    const steps: { key: string; label: string; icon: typeof MapPinIcon }[] = [
        { key: "address", label: "Address", icon: MapPinIcon },
        { key: "payment", label: "Payment", icon: CreditCardIcon },
        { key: "review", label: "Review", icon: CheckIcon },
    ];

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const { data } = await api.post("/coupons/validate", { code: couponCode.trim().toUpperCase(), orderTotal: cartTotal });
            setAppliedCoupon({ code: data.coupon.code, discount: data.discount });
            toast.success(`Coupon applied! You save ${currency}${data.discount.toFixed(2)}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid coupon code");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const orderData = {
                items: items.map((item) => ({
                    product: item.product.id,
                    quantity: item.quantity,
                })),
                shippingAddress: address,
                paymentMethod,
                ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
            };

            const { data } = await api.post("/orders", orderData);
            console.log(data);

            if (data.url) {
                window.location.href = data.url;
                return;
            }
            clearCart();
            toast.success("Order placed successfully!");
            navigate(`/orders/${data.order.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
            scrollTo(0, 0);
        }
    };

    // Populate address from user's default address
    useState(() => {
        if (user?.addresses?.length) {
            const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
            setAddress({
                id: defaultAddr?.id,
                label: defaultAddr?.label,
                address: defaultAddr?.address,
                city: defaultAddr?.city,
                state: defaultAddr?.state,
                zip: defaultAddr?.zip,
                isDefault: defaultAddr?.isDefault,
                lat: defaultAddr?.lat,
                lng: defaultAddr?.lng,
            });
        }
    });

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex-center">
                <div className="text-center animate-scale-in">
                    <h2 className="text-xl font-bold text-app-green mb-2">Your cart is empty</h2>
                    <p className="text-sm text-app-text-light mb-4">Add some products to checkout</p>
                    <button onClick={() => navigate("/products")} className="btn-green !px-5 !py-2.5 text-sm !rounded-xl">
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors">
                    <ArrowLeft className="size-4" /> Back
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold text-app-green mb-8">Checkout</h1>

                {/* Steps */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <div key={s.key} className="flex items-center gap-2">
                            <button onClick={() => setStep(s.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${step === s.key ? "bg-gradient-to-r from-app-green-light to-app-green text-white shadow-glow-green" : "bg-white text-app-text-light shadow-soft hover:text-app-green"}`}>
                                <s.icon className="size-4" /> {s.label}
                                {i < steps.length - 1 && <ChevronRightIcon className="size-4 text-app-text-light" />}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="md:col-span-2">
                        {step === "address" && <CheckoutAddress address={address} setAddress={setAddress} setStep={setStep} user={user} />}

                        {step === "payment" && <CheckoutPayment paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} setStep={setStep} />}

                        {step === "review" && <CheckoutReview address={address} items={items} handlePlaceOrder={handlePlaceOrder} loading={loading} total={total} />}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="bg-white rounded-2xl p-5 h-fit sticky top-24 shadow-soft border border-app-border/60">
                        <h3 className="text-sm font-semibold text-app-green mb-4">Order Summary</h3>

                        {/* Coupon */}
                        <div className="mb-4">
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                                    <div className="flex items-center gap-2 text-sm text-app-green font-medium">
                                        <TagIcon className="size-4" />
                                        {appliedCoupon.code}
                                    </div>
                                    <button onClick={handleRemoveCoupon} className="text-app-text-light hover:text-app-error transition-colors">
                                        <XIcon className="size-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Promo code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponCode.trim()}
                                        className="px-3 py-2 text-sm font-medium bg-app-green text-white rounded-xl hover:bg-app-green/90 disabled:opacity-50 transition-all"
                                    >
                                        {couponLoading ? "..." : "Apply"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-app-text-light">Subtotal ({items.length} items)</span>
                                <span>{currency}{cartTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-app-text-light">Delivery</span>
                                <span>{deliveryFee === 0 ? <span className="text-app-success">Free</span> : `${currency}${deliveryFee.toFixed(2)}`}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-app-text-light">Tax</span>
                                <span>{currency}{tax.toFixed(2)}</span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex justify-between text-app-success">
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>-{currency}{discount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between pt-3 border-t border-app-border text-base font-semibold">
                                <span>Total</span>
                                <span className="text-app-green">{currency}{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
