import { Link } from "react-router-dom";
import { categoriesData } from "../../assets/assets";

const HomeCategories = () => {
    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">
                        Browse <span className="text-gradient">Categories</span>
                    </h2>
                    <p className="text-sm text-app-text-light mt-1.5">Find exactly what you need, faster</p>
                </div>
                <div className="flex items-center mt-8 overflow-x-scroll no-scrollbar">
                    {categoriesData.map((cat) => (
                        <Link key={cat.slug} to={`/products?category=${cat.slug}`} onClick={() => window.scrollTo(0, 0)} className="group flex flex-col items-center gap-3 p-4 shrink-0">
                            <div className="size-18 sm:size-26 sm:p-2 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50 ring-1 ring-app-orange/10 group-hover:ring-2 group-hover:ring-app-orange/50 group-hover:-translate-y-1.5 group-hover:shadow-lift transition-all duration-300">
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain rounded-full group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-xs font-semibold text-zinc-600 group-hover:text-app-green text-center leading-tight transition-colors">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomeCategories;
