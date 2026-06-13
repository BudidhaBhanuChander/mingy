interface CancelModalProps {
    setCancelModal: (cancelModal: string | null) => void;
    cancelReason: string;
    setCancelReason: (cancelReason: string) => void;
    handleCancel: () => void;
    submitting: boolean;
}

export default function CancelModal({ setCancelModal, cancelReason, setCancelReason, handleCancel, submitting }: CancelModalProps) {
    return (
        <>
            <div className="fixed inset-0 bg-app-green/40 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setCancelModal(null)} />
            <div className="fixed inset-0 z-50 flex-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-lift border border-app-border/60">
                    <h3 className="text-lg font-bold text-red-600 mb-2">Cancel Delivery</h3>
                    <p className="text-sm text-zinc-500 mb-4">Please provide a reason for cancellation.</p>
                    <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="Reason..." className="w-full px-4 py-3 text-sm rounded-xl border border-app-border focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none resize-none mb-4 transition-all" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setCancelModal(null);
                                setCancelReason("");
                            }}
                            className="flex-1 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Back
                        </button>
                        <button onClick={handleCancel} disabled={submitting} className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-soft hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                            {submitting ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
