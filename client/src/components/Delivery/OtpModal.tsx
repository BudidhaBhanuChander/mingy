interface OtpModalProps {
    setOtpModal: (otpModal: string | null) => void;
    otp: string;
    setOtp: (otp: string) => void;
    handleComplete: () => void;
    submitting: boolean;
}

export default function OtpModal({ setOtpModal, otp, setOtp, handleComplete, submitting }: OtpModalProps) {
    return (
        <>
            <div className="fixed inset-0 bg-app-green/40 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setOtpModal(null)} />
            <div className="fixed inset-0 z-50 flex-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-lift border border-app-border/60">
                    <h3 className="text-lg font-bold text-app-green mb-2">Enter Delivery OTP</h3>
                    <p className="text-sm text-zinc-500 mb-5">Ask the customer for the 6-digit OTP shown on their tracking page.</p>
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 outline-none mb-4 transition-all"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setOtpModal(null);
                                setOtp("");
                            }}
                            className="flex-1 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button onClick={handleComplete} disabled={otp.length !== 6 || submitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-glow-green hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                            {submitting ? "Verifying..." : "Confirm Delivery"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
