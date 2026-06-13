import { appPromoBannerData, assets } from "../../assets/assets";

const AppPromoBanner = () => {
    return (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 my-14 rounded-[2rem] overflow-hidden shadow-lift bg-gradient-to-br from-app-green-light via-app-green to-app-green animate-gradient">
            {/* decorative glow blobs */}
            <div className="absolute -top-10 -left-10 size-52 rounded-full bg-app-orange/20 blur-3xl" />
            <div className="absolute -bottom-16 right-1/4 size-60 rounded-full bg-emerald-400/15 blur-3xl animate-float" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 xl:px-10">
                {/* Left side content */}
                <div className="text-center md:text-left">
                    <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">{appPromoBannerData.title}</h2>
                    <p className="text-white/75 mb-6 max-w-md">{appPromoBannerData.description}</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <button className="px-6 py-3 bg-white text-app-green font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lift transition-all">App Store</button>
                        <button className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 hover:-translate-y-0.5 transition-all border border-white/25 backdrop-blur-sm">Google Play</button>
                    </div>
                </div>

                {/* Right side image */}
                <img src={assets.delivery_truck} alt="Delivery Truck" className="max-w-60 sm:max-w-120 xl:pr-10 drop-shadow-2xl animate-float" />
            </div>
        </section>
    );
};

export default AppPromoBanner;
