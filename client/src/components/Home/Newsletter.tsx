import { MailIcon } from "lucide-react";

const Newsletter = () => {
    return (
        <section className="relative overflow-hidden bg-white py-18 px-4 sm:px-6 lg:px-8 rounded-[2rem] mx-auto shadow-soft border border-app-border/60 mt-32 mb-20">
            {/* soft accent backdrop */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-72 rounded-full bg-app-orange/10 blur-3xl" />

            <div className="relative max-w-2xl mx-auto text-center">
                <div className="size-16 bg-gradient-to-br from-app-green-light to-app-green rounded-2xl flex-center mx-auto mb-6 shadow-glow-green animate-float">
                    <MailIcon className="size-8 text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-app-green mb-4">
                    Subscribe to our <span className="text-gradient">Newsletter</span>
                </h2>
                <p className="text-app-text-light mb-8 text-base">Get weekly updates on fresh produce, seasonal offers, and exclusive discounts right to your inbox.</p>

                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input type="email" placeholder="Enter your email address" required className="flex-1 px-5 py-3.5 rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 bg-white text-sm transition-all" />

                    <button type="submit" className="btn-green !rounded-xl whitespace-nowrap">
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;
