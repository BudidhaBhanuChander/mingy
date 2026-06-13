import { KeyRoundIcon } from "lucide-react";

export default function OrderOTP({ order }: { order: any }) {
    const showOtp = order.deliveryOtp && ["Assigned", "Packed", "Out for Delivery"].includes(order.status);
    if (!showOtp) return null;
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-app-green-light via-app-green to-app-green animate-gradient rounded-2xl p-6 text-white shadow-lift">
            <div className="absolute -top-8 -right-8 size-32 rounded-full bg-app-orange/20 blur-3xl" />
            <div className="relative flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-white/15 flex-center">
                    <KeyRoundIcon className="size-5" />
                </div>
                <div>
                    <h3 className="font-semibold">Delivery OTP</h3>
                    <p className="text-xs text-white/70">Share this with your delivery partner</p>
                </div>
            </div>
            <div className="relative flex gap-2 mt-2">
                {order.deliveryOtp.split("").map((digit: string, i: number) => (
                    <div key={i} className="w-11 h-13 rounded-xl bg-white/15 ring-1 ring-white/20 flex-center text-2xl font-mono font-bold tracking-wider animate-scale-in" style={{ animationDelay: `${i * 0.06}s` }}>
                        {digit}
                    </div>
                ))}
            </div>
        </div>
    );
}
