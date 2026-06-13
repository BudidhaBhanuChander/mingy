import { ArrowRightIcon, LeafIcon } from "lucide-react";
import { heroSectionData } from "../../assets/assets";
import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <section className="relative overflow-hidden min-h-[540px] mb-10 rounded-[2rem] flex items-center shadow-lift">
            <img src={heroSectionData.hero_image} alt="Hero" className="absolute inset-0 h-full w-full object-cover scale-105" />

            <div className="absolute inset-0 bg-gradient-to-r from-app-green via-app-green/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-app-green/60 via-transparent to-transparent" />

            {/* floating glow accents */}
            <div className="absolute top-10 right-16 size-40 rounded-full bg-app-orange/30 blur-3xl animate-float" />
            <div className="absolute bottom-10 right-40 size-32 rounded-full bg-emerald-400/20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                <div className="max-w-xl xl:pl-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-orange-200 bg-orange-300/15 ring-1 ring-orange-300/30 rounded-full mb-5 backdrop-blur-sm animate-fade-in">
                        <LeafIcon className="size-3.5" /> Farm-Fresh & Organic
                    </span>

                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-5 animate-slide-in-up">
                        Nourish your home with <span className="text-gradient">Earth's finest</span>
                    </h1>

                    <p className="text-base text-white/75 leading-relaxed mb-8 max-w-md animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
                        {heroSectionData.description}
                    </p>

                    <div className="flex flex-wrap gap-3 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
                        <Link to="/products" className="btn-primary shine">
                            Shop Now <ArrowRightIcon className="size-4" />
                        </Link>

                        <Link to="/products" className="inline-flex items-center justify-center px-7 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 hover:-translate-y-0.5 transition-all border border-white/25 backdrop-blur-sm">
                            Browse Categories
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
