import { useEffect, useState } from "react";
import { StarIcon } from "lucide-react";
import type { Product, Review } from "../types";
import api from "../config/api";

const Stars = ({ rating, size = "size-4" }: { rating: number; size?: string }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} className={`${size} ${s <= Math.round(rating) ? "text-app-warning fill-app-warning" : "text-app-border"}`} />
        ))}
    </div>
);

const ReviewsSection = ({ product }: { product: Product }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/products/${product.id}/reviews`)
            .then(({ data }) => setReviews(data.reviews ?? []))
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, [product.id]);

    // rating breakdown from live data
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => Math.round(r.rating) === star).length,
    }));
    const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

    if (loading) return <div className="mt-10 h-24 animate-pulse bg-white/50 rounded-2xl" />;
    if (reviews.length === 0) return null;

    return (
        <section className="mt-10">
            <h2 className="text-2xl font-semibold text-app-green mb-6">Customer Reviews</h2>

            <div className="bg-white/50 rounded-2xl p-6 md:p-8">
                {/* Summary */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-app-border">
                    <div className="flex-center flex-col md:min-w-[160px] lg:w-1/3">
                        <span className="text-5xl font-semibold text-app-green">{product.rating.toFixed(1)}</span>
                        <div className="mt-2 mb-1"><Stars rating={product.rating} /></div>
                        <span className="text-sm text-zinc-600">{reviews.length} reviews</span>
                    </div>

                    <div className="flex-1 space-y-2">
                        {breakdown.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-sm text-zinc-600 w-8 text-right">{star} ★</span>
                                <div className="flex-1 h-2.5 bg-app-border rounded-full overflow-hidden">
                                    <div className="h-full bg-app-warning rounded-full transition-all duration-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                                </div>
                                <span className="text-xs text-zinc-600 w-6">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Individual reviews */}
                <div className="space-y-6">
                    {reviews.map((review) => {
                        const initials = review.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                        return (
                            <div key={review.id} className="flex gap-4">
                                <div className="size-10 rounded-full bg-app-green/10 text-app-green flex-center shrink-0 text-sm font-semibold">
                                    {review.user.avatar ? <img src={review.user.avatar} className="size-10 rounded-full object-cover" alt={review.user.name} /> : initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <span className="text-sm font-semibold text-app-text">{review.user.name}</span>
                                        <span className="text-xs text-zinc-400">·</span>
                                        <span className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                    </div>
                                    <div className="mb-2"><Stars rating={review.rating} size="size-3.5" /></div>
                                    <p className="text-sm text-zinc-600 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ReviewsSection;
