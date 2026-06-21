import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "../types";
import api from "../config/api";
import { useAuth } from "./AuthContext";

interface FavoritesContextType {
    favorites: Product[];
    isFavorite: (productId: string) => boolean;
    toggleFavorite: (product: Product) => void;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: () => {},
    loading: false,
});

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) { setFavorites([]); return; }
        setLoading(true);
        api.get("/favorites")
            .then(({ data }) => {
                // Backend returns each product spread directly (with a favoriteId),
                // not nested under `f.product`. Support both shapes and drop nulls
                // so `favorites` never contains undefined entries (which crash isFavorite).
                const list = (data.favorites ?? [])
                    .map((f: any) => (f && f.product ? f.product : f))
                    .filter((p: any) => p && p.id);
                setFavorites(list);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user]);

    const isFavorite = (productId: string) => favorites.some((p) => p?.id === productId);

    const toggleFavorite = (product: Product) => {
        if (!user) return;
        const wasFav = isFavorite(product.id);
        // optimistic update
        setFavorites((prev) => wasFav ? prev.filter((p) => p.id !== product.id) : [...prev, product]);
        api.post(`/favorites/${product.id}`).catch(() => {
            // revert on error
            setFavorites((prev) => wasFav ? [...prev, product] : prev.filter((p) => p.id !== product.id));
        });
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
