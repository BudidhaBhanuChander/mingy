import { useRef, useState } from "react";
import { heroSectionData } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { BikeIcon, ChevronLeftIcon, Loader2Icon, LockIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import deliveryApi from "../config/deliveryApi";
import api from "../config/api";
import { GoogleLogin } from "@react-oauth/google";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";

type Tab = "email" | "phone";

const Login = () => {
    const [isLoginState, setIsLoginState] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("email");

    // email/password fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // phone OTP fields — always +91, user types only 10 digits
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
    const recaptchaRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const { login, register, setUserFromToken } = useAuth();

    // ── Email / Password ──────────────────────────────────────────────
    const handleEmailSubmit = async (e: React.FormEvent) => {
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

    // ── Google Sign-In ────────────────────────────────────────────────
    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) { toast.error("Google sign-in failed"); return; }
        try {
            const { data } = await api.post("/auth/google", { idToken: credentialResponse.credential });
            setUserFromToken(data.user, data.token);
            toast.success(`Welcome, ${data.user.name}!`);
            navigate("/", { replace: true });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Google sign-in failed");
        }
    };

    // ── Phone OTP ─────────────────────────────────────────────────────
    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => {},
            });
        }
        return (window as any).recaptchaVerifier as RecaptchaVerifier;
    };

    const handleSendOtp = async () => {
        if (phone.length !== 10) { toast.error("Enter a valid 10-digit phone number"); return; }
        const formatted = `+91${phone}`;
        setPhoneLoading(true);
        try {
            const verifier = setupRecaptcha();
            const result = await signInWithPhoneNumber(auth, formatted, verifier);
            setConfirmResult(result);
            setOtpSent(true);
            toast.success(`OTP sent to ${formatted}`);
        } catch (err: any) {
            (window as any).recaptchaVerifier = null;
            toast.error(err.message?.includes("too-many-requests") ? "Too many attempts. Try later." : "Failed to send OTP. Check the number.");
        } finally {
            setPhoneLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!confirmResult || otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
        setPhoneLoading(true);
        try {
            const credential = await confirmResult.confirm(otp);
            const idToken = await credential.user.getIdToken();
            const { data } = await api.post("/auth/phone", { idToken });
            // Set React auth state + localStorage, then SPA-navigate (no full reload,
            // so no re-fetch storm / navigation race that caused the blank page).
            setUserFromToken(data.user, data.token);
            toast.success("Phone login successful!");
            navigate("/", { replace: true });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid OTP. Try again.");
            setPhoneLoading(false);
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

            {/* Right Side */}
            <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
                <div className="w-full max-w-md animate-scale-in">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                            <span className="size-10 rounded-xl bg-gradient-to-br from-app-green-light to-app-green flex-center text-white shadow-glow-green group-hover:rotate-6 transition-transform">
                                <BikeIcon className="size-6" />
                            </span>
                            <span className="text-2xl font-bold text-gradient-green">Instacart</span>
                        </Link>
                        <h1 className="text-2xl font-semibold text-app-green mb-2">
                            {isLoginState ? "Sign in to your account" : "Create your account"}
                        </h1>
                        <p className="text-sm text-app-text-light">
                            {isLoginState ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => { setIsLoginState(!isLoginState); setActiveTab("email"); }} className="text-orange-500 ml-1 font-semibold hover:text-orange-600 transition-colors">
                                {isLoginState ? "Create one" : "Sign in"}
                            </button>
                        </p>
                    </div>

                    {/* Tab switcher — only show on login */}
                    {isLoginState && (
                        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-soft border border-app-border/60">
                            {(["email", "phone"] as Tab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${activeTab === tab ? "bg-app-green text-white shadow-glow-green" : "text-app-text-light hover:text-app-green"}`}
                                >
                                    {tab === "email" ? "Email" : "Phone OTP"}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Email / Password Form ── */}
                    {(activeTab === "email" || !isLoginState) && (
                        <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                            <button type="submit" disabled={loading} className="btn-green w-full !rounded-xl disabled:opacity-50">
                                {loading ? <Loader2Icon className="animate-spin" /> : isLoginState ? "Sign In" : "Sign Up"}
                            </button>
                        </form>
                    )}

                    {/* ── Phone OTP Form ── */}
                    {activeTab === "phone" && isLoginState && (
                        <div className="space-y-4">
                            {!otpSent ? (
                                <>
                                    <label className="text-sm flex flex-col gap-1">
                                        Phone Number
                                        <div className="flex items-center bg-white rounded-xl border border-app-border focus-within:border-app-green focus-within:ring-2 focus-within:ring-app-green/20 transition-all overflow-hidden">
                                            <span className="flex items-center gap-1.5 pl-3.5 pr-2 border-r border-app-border text-sm font-medium text-app-text shrink-0">
                                                <PhoneIcon className="size-4 text-app-text-light" />
                                                +91
                                            </span>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                placeholder="9999999999"
                                                maxLength={10}
                                                className="flex-1 px-3 py-3 text-sm bg-transparent outline-none"
                                            />
                                            <span className={`pr-3 text-xs font-medium shrink-0 ${phone.length === 10 ? "text-app-green" : "text-app-text-light"}`}>
                                                {phone.length}/10
                                            </span>
                                        </div>
                                    </label>
                                    <button onClick={handleSendOtp} disabled={phoneLoading || phone.length !== 10} className="btn-green w-full !rounded-xl disabled:opacity-50">
                                        {phoneLoading ? <Loader2Icon className="animate-spin" /> : "Send OTP"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <button onClick={() => { setOtpSent(false); setOtp(""); }} className="p-1.5 hover:bg-app-cream rounded-lg transition-colors">
                                            <ChevronLeftIcon className="size-4 text-app-text-light" />
                                        </button>
                                        <p className="text-sm text-app-text-light">OTP sent to <span className="font-medium text-app-text">{phone}</span></p>
                                    </div>
                                    <label className="text-sm flex flex-col gap-1">
                                        Enter 6-digit OTP
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            placeholder="123456"
                                            className="w-full px-4 py-3 text-sm text-center tracking-[0.5em] font-bold bg-white rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all"
                                        />
                                    </label>
                                    <button onClick={handleVerifyOtp} disabled={phoneLoading || otp.length !== 6} className="btn-green w-full !rounded-xl disabled:opacity-50">
                                        {phoneLoading ? <Loader2Icon className="animate-spin" /> : "Verify & Sign In"}
                                    </button>
                                    <button onClick={handleSendOtp} disabled={phoneLoading} className="w-full text-sm text-app-text-light hover:text-app-green transition-colors">
                                        Resend OTP
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Divider + Google ── */}
                    <div className="mt-6">
                        <div className="relative flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px bg-app-border" />
                            <span className="text-xs text-app-text-light">or continue with</span>
                            <div className="flex-1 h-px bg-app-border" />
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error("Google sign-in was cancelled")}
                                width="400"
                                text="continue_with"
                                shape="rectangular"
                                theme="outline"
                            />
                        </div>
                    </div>

                    {/* invisible recaptcha anchor */}
                    <div id="recaptcha-container" ref={recaptchaRef} />
                </div>
            </div>
        </div>
    );
};

export default Login;
