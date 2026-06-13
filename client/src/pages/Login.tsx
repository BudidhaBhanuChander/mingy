import { useState } from "react";
import { heroSectionData } from "../assets/assets";
import { Link } from "react-router-dom";
import { BikeIcon, Loader2Icon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import deliveryApi from "../config/deliveryApi";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [isLoginState, setIsLoginState] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLoginState) {
                try {
                    await login(email, password);
                } catch {
                    const { data } = await deliveryApi.post("/delivery/login", { email, password });
                    localStorage.setItem("delivery_token", data.token);
                    localStorage.setItem("delivery_partner", JSON.stringify(data.partner));
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("auth_user");
                    toast.success("Delivery partner login successful");
                    navigate("/delivery");
                }
            } else {
                await register(name, email, password);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-app-green-light via-app-green to-app-green animate-gradient relative items-center justify-center overflow-hidden">
                <img src={heroSectionData.hero_image} alt="" className="absolute inset-0 object-cover h-full w-full bg-center opacity-15 scale-105" />
                <div className="absolute -top-10 -left-10 size-60 rounded-full bg-app-orange/20 blur-3xl animate-float" />
                <div className="absolute bottom-0 right-10 size-72 rounded-full bg-emerald-400/15 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
                <div className="relative text-center px-12 animate-slide-in-up">
                    <h2 className="font-serif text-4xl text-white mb-4">Welcome back to <span className="text-gradient">Instacart</span></h2>
                    <p className="text-white/70 font-serif text-xl max-w-sm mx-auto">Fresh groceries and organic produce, delivered to your doorstep.</p>
                </div>
            </div>

            {/* LRight Side */}
            <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
                <div className="w-full max-w-md animate-scale-in">
                    {/* form header message */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                            <span className="size-10 rounded-xl bg-gradient-to-br from-app-green-light to-app-green flex-center text-white shadow-glow-green group-hover:rotate-6 transition-transform">
                                <BikeIcon className="size-6" />
                            </span>
                            <span className="text-2xl font-bold text-gradient-green">Instacart</span>
                        </Link>
                        <h1 className="text-2xl font-semibold text-app-green mb-2">{isLoginState ? "Sign in to your account" : "Sign up for an account"}</h1>

                        <p className="text-sm text-app-text-light">
                            {isLoginState ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => setIsLoginState(!isLoginState)} className="text-orange-500 ml-1 font-semibold hover:text-orange-600 transition-colors">
                                {isLoginState ? "Create one" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    {/* Login / Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLoginState && (
                            <label className="text-sm flex flex-col gap-1">
                                Name
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all" />
                                </div>
                            </label>
                        )}
                        <label className="text-sm flex flex-col gap-1">
                            Email Address
                            <div className="relative">
                                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all" />
                            </div>
                        </label>
                        <label className="text-sm flex flex-col gap-1">
                            Password
                            <div className="relative">
                                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-app-text-light" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all" />
                            </div>
                        </label>
                        <button type="submit" disabled={loading} className="btn-green w-full !rounded-xl disabled:opacity-50 disabled:hover:translate-y-0">
                            {loading ? <Loader2Icon className="animate-spin" /> : isLoginState ? "Sign In" : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
