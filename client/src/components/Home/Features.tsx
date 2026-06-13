import { heroSectionData } from "../../assets/assets";

const Features = () => {
    return (
        <section className="bg-white/80 backdrop-blur py-4 border border-app-border/70 rounded-2xl shadow-soft">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 stagger">
                    {heroSectionData.hero_features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-app-cream/70 transition-colors group">
                            <div className="size-11 rounded-xl bg-gradient-to-br from-app-cream to-orange-100 ring-1 ring-app-orange/10 flex-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                                <feature.icon className="size-5 text-app-green" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-app-green">{feature.title}</p>
                                <p className="text-xs text-app-text-light">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
