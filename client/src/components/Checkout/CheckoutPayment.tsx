import { ChevronRightIcon, CreditCardIcon } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface CheckoutPaymentProps {
    setStep: Dispatch<SetStateAction<string>>;
    paymentMethod: string;
    setPaymentMethod: Dispatch<SetStateAction<string>>;
}

export default function CheckoutPayment({ setStep, paymentMethod, setPaymentMethod }: CheckoutPaymentProps) {
    return (
        <div className="bg-white rounded-2xl p-6 animate-fade-in shadow-soft border border-app-border/60">
            <h2 className="text-lg font-bold text-app-green mb-5 flex items-center gap-2">
                <span className="size-8 rounded-lg bg-app-cream flex-center text-app-green"><CreditCardIcon className="size-4.5" /></span> Payment Method
            </h2>
            <div className="space-y-3">
                {[
                    { value: "card", label: "Credit / Debit Card", desc: "Pay securely with your card" },
                    { value: "cash", label: "Cash on Delivery", desc: "Pay when you receive" },
                ].map((method) => (
                    <label key={method.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.value ? "border-app-green bg-app-cream shadow-soft" : "border-app-border hover:border-app-green/40 hover:-translate-y-0.5"}`}>
                        <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={(e) => setPaymentMethod(e.target.value)} className="size-4 text-app-green" />
                        <div>
                            <p className="text-sm font-semibold text-app-green">{method.label}</p>
                            <p className="text-xs text-app-text-light">{method.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
            <button
                onClick={() => {
                    setStep("review");
                    scrollTo(0, 0);
                }}
                className="btn-green !rounded-xl mt-6"
            >
                Review Order <ChevronRightIcon className="size-4" />
            </button>
        </div>
    );
}
