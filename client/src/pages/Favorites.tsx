import { Link } from "react-router-dom";
import { HeartIcon } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";

const Favorites = () => {
    const { favorites, loading } = useFavorites();

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-app-green mb-6">My Wishlist</h1>

                {loading ? (
                    <Loading />
                ) : favorites.length === 0 ? (
                    <div className="text-center py-20 animate-scale-in">
                        <div className="size-20 rounded-full bg-white flex-center shadow-soft mx-auto mb-4">
                            <HeartIcon className="size-9 text-app-border" />
                        </div>
                        <h2 className="text-lg font-bold text-app-green mb-2">No favorites yet</h2>
                        <p className="text-sm text-app-text-light mb-4">Tap the heart on any product to save it here</p>
                        <Link to="/products" className="btn-green !px-5 !py-2.5 text-sm !rounded-xl">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 xl:gap-6">
                        {favorites.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
