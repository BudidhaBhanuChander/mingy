import { useEffect, useState } from "react";
import type { Product } from "../types";
import { Zap } from "lucide-react";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import api from "../config/api";
import toast from "react-hot-toast";

const FlashDeals = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/products/flash-deals")
            .then((res) => setProducts(res.data.products))
            .catch((error: any) => toast.error(error.response.data.message || error?.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen">
            {/* Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-app-orange via-app-orange-dark to-app-orange animate-gradient text-white py-12 shadow-lift">
                <div className="absolute -top-10 left-1/4 size-48 rounded-full bg-white/15 blur-3xl animate-float" />
                <div className="absolute -bottom-12 right-1/4 size-56 rounded-full bg-amber-200/20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-slide-in-up">
                    <div className="flex-center gap-2 mb-3">
                        <Zap className="size-7 fill-white animate-pulse-soft" />
                        <h1 className="font-serif text-4xl">Flash Deals</h1>
                        <Zap className="size-7 fill-white animate-pulse-soft" />
                    </div>
                    <p className="text-white/90 max-w-md mx-auto">Limited-time offers on your favorite organic products. Grab them before they're gone!</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <Loading />
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <Zap className="size-16 text-app-border mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-app-green mb-2">No deals right now</h2>
                        <p className="text-sm text-app-text-light">Check back soon for amazing offers!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">{products.map((product) => product.stock > 0 && <ProductCard key={product.id} product={product} />)}</div>
                )}
            </div>
        </div>
    );
};

export default FlashDeals;
