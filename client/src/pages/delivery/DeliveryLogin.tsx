import { useEffect, useState } from "react";
import { BikeIcon } from "lucide-react";
import { heroSectionData } from "../../assets/assets";
import deliveryApi from "../../config/deliveryApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function DeliveryLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await deliveryApi.post("/delivery/login", { email, password });
            localStorage.setItem("delivery_token", data.token);
            localStorage.setItem("delivery_partner", JSON.stringify(data.partner));
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            toast.success("Login successful");
            navigate("/delivery");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("delivery_token")) {
            navigate("/delivery");
        }
    }, []);

    return (
        <div className="min-h-screen flex">
            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-app-green-light via-app-green to-app-green animate-gradient relative items-center justify-center overflow-hidden">
                <img src={heroSectionData.hero_image} alt="" className="absolute inset-0 object-cover h-full w-full bg-center opacity-15 scale-105" />
                <div className="absolute -top-10 -left-10 size-60 rounded-full bg-app-orange/20 blur-3xl animate-float" />
                <div className="relative text-center px-12 animate-slide-in-up">
                    <h2 className="font-serif text-4xl text-white mb-4">Delivery Partner Portal</h2>
                    <p className="text-white/70 font-serif text-xl max-w-sm mx-auto">Manage your deliveries and keep customers happy.</p>
                </div>
            </div>

            {/* Right Side Form */}
            <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
                <div className="w-full max-w-md animate-scale-in">
                    <div className="text-center mb-8">
                        <div className="flex-center gap-2 mb-4">
                            <span className="size-10 rounded-xl bg-gradient-to-br from-app-green-light to-app-green flex-center text-white shadow-glow-green"><BikeIcon className="size-6" /></span>
                            <span className="text-2xl font-bold text-gradient-green">Instacart</span>
                        </div>
                        <h1 className="text-2xl font-bold text-app-green mb-2">Delivery Partner Login</h1>
                        <p className="text-sm text-app-text-light">Sign in to manage your deliveries</p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5 shadow-soft border border-app-border/60">
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 outline-none text-sm transition-all" placeholder="partner@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">Password</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 outline-none text-sm transition-all" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading} className="btn-green w-full !rounded-xl disabled:opacity-60 disabled:hover:translate-y-0">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
