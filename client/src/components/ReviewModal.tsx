import { useState } from "react";
import { StarIcon, XIcon } from "lucide-react";
import api from "../config/api";
import toast from "react-hot-toast";

interface Props {
    orderId: string;
    onClose: () => void;
    onSubmitted: () => void;
}

const ReviewModal = ({ orderId, onClose, onSubmitted }: Props) => {
    const [rating, setRating] = useState(5);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) { toast.error("Please write a comment"); return; }
        setLoading(true);
        try {
            await api.post(`/orders/${orderId}/review`, { rating, comment });
            toast.success("Review submitted!");
            onSubmitted();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lift animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-app-green">Rate Your Order</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-app-cream rounded-lg transition-colors">
                        <XIcon className="size-5" />
                    </button>
                </div>

                {/* Stars */}
                <div className="flex items-center justify-center gap-2 mb-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            onMouseEnter={() => setHovered(s)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(s)}
                            className="transition-transform hover:scale-125 active:scale-95"
                        >
                            <StarIcon className={`size-9 transition-colors ${s <= (hovered || rating) ? "text-app-warning fill-app-warning" : "text-app-border"}`} />
                        </button>
                    ))}
                </div>

                <textarea
                    rows={4}
                    placeholder="Share your experience with this order..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-app-border focus:border-app-green focus:ring-2 focus:ring-app-green/20 transition-all resize-none mb-4"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green/90 disabled:opacity-50 transition-all"
                >
                    {loading ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </div>
    );
};

export default ReviewModal;
