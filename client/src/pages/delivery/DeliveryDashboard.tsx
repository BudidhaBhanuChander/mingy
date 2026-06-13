import { useEffect, useRef, useState } from "react";
import { CheckCircleIcon, ClockIcon, NavigationIcon, PackageIcon, RefreshCwIcon, RouteIcon, TruckIcon } from "lucide-react";
import OtpModal from "../../components/Delivery/OtpModal";
import CancelModal from "../../components/Delivery/CancelModal";
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard";
import Loading from "../../components/Loading";
import type { DeliveryPartner, Order } from "../../types";
import toast from "react-hot-toast";
import deliveryApi from "../../config/deliveryApi";

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"active" | "completed">("active");
    const [tracking, setTracking] = useState(false);
    const [partner, setPartner] = useState<DeliveryPartner | null>(null);

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const watchIdRef = useRef<number | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await deliveryApi.get(`/delivery/my-deliveries?status=${tab}`);
            setOrders(data.orders);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to load deliveries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [tab]);

    useEffect(() => {
        const savedPartner = localStorage.getItem("delivery_partner");
        if (savedPartner) {
            setPartner(JSON.parse(savedPartner));
        }
    }, []);

    // send location every 10s for active deliveries
    useEffect(() => {
        const activeOrders = orders.filter((o) => ["Assigned", "Packed", "Out for Delivery"].includes(o.status));

        if (activeOrders.length === 0 || !tracking) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            return;
        }

        const sendLocation = (pos: GeolocationPosition) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            activeOrders.forEach((order) => {
                deliveryApi.put(`/delivery/my-deliveries/${order.id}/location`, { lat, lng }).catch(() => {});
            });
        };

        watchIdRef.current = navigator.geolocation.watchPosition(sendLocation, () => {}, {
            enableHighAccuracy: true,
            maximumAge: 10000,
        });

        // Also send on interval for more consistent updates
        const interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(sendLocation, () => {}, { enableHighAccuracy: true });
        }, 10000);

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            clearInterval(interval);
        };
    }, [orders, tracking]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await deliveryApi.put(`/delivery/my-deliveries/${orderId}/status`, { status });
            toast.success(`Status updated to ${status}`);
            fetchOrders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed");
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await deliveryApi.put(`/delivery/my-deliveries/${otpModal}/complete`, { otp });
            toast.success("Delivery completed!");
            setOtpModal(null);
            setOtp("");
            fetchOrders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        setSubmitting(true);
        try {
            await deliveryApi.put(`/delivery/my-deliveries/${cancelModal}/cancel`, { reason: cancelReason });
            toast.success("Delivery cancelled");
            setCancelModal(null);
            setCancelReason("");
            fetchOrders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const activeCount = orders.filter((order) => ["Assigned", "Packed", "Out for Delivery"].includes(order.status)).length;
    const outForDeliveryCount = orders.filter((order) => order.status === "Out for Delivery").length;
    const deliveredCount = orders.filter((order) => order.status === "Delivered").length;

    const openRoute = (order: Order) => {
        const address = order.shippingAddress;
        const destination = address.lat && address.lng ? `${address.lat},${address.lng}` : `${address.address}, ${address.city}, ${address.state} ${address.zip}`;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-app-border/60 shadow-soft p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-gradient-to-br from-app-green-light to-app-green flex-center text-white font-semibold shadow-glow-green">{partner?.name?.charAt(0).toUpperCase() || "D"}</div>
                        <div>
                            <p className="text-xs uppercase text-zinc-500 font-semibold">Delivery Partner</p>
                            <h1 className="text-xl font-bold text-app-green">{partner?.name || "Partner"}</h1>
                            <p className="text-sm text-zinc-500 capitalize">
                                {partner?.vehicleType || "Vehicle"} {partner?.phone ? `- ${partner.phone}` : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={fetchOrders} className="px-4 py-2 text-sm font-medium rounded-xl bg-white text-zinc-700 border border-app-border shadow-soft hover:border-app-green hover:text-app-green hover:-translate-y-0.5 transition-all flex items-center gap-1.5 active:scale-95">
                            <RefreshCwIcon className="size-4" />
                            Refresh
                        </button>
                        <button onClick={() => setTracking((prev) => !prev)} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 text-white ${tracking ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-glow-green animate-glow" : "bg-gradient-to-r from-app-green-light to-app-green shadow-glow-green hover:-translate-y-0.5"}`}>
                            <NavigationIcon className={`size-4 ${tracking ? "animate-pulse" : ""}`} />
                            {tracking ? "Sharing Location" : "Start Location"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 stagger">
                <div className="bg-white rounded-2xl border border-app-border/60 shadow-soft card-lift p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 font-semibold uppercase">Active</p>
                        <p className="text-3xl font-bold text-app-green">{activeCount}</p>
                    </div>
                    <span className="size-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex-center shadow-soft"><TruckIcon className="size-6" /></span>
                </div>
                <div className="bg-white rounded-2xl border border-app-border/60 shadow-soft card-lift p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 font-semibold uppercase">On Route</p>
                        <p className="text-3xl font-bold text-app-green">{outForDeliveryCount}</p>
                    </div>
                    <span className="size-11 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white flex-center shadow-soft"><RouteIcon className="size-6" /></span>
                </div>
                <div className="bg-white rounded-2xl border border-app-border/60 shadow-soft card-lift p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-zinc-500 font-semibold uppercase">Completed</p>
                        <p className="text-3xl font-bold text-app-green">{deliveredCount}</p>
                    </div>
                    <span className="size-11 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white flex-center shadow-soft"><CheckCircleIcon className="size-6" /></span>
                </div>
            </div>

            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["active", "completed"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${tab === t ? "bg-gradient-to-r from-app-green-light to-app-green text-white shadow-glow-green" : "bg-white text-zinc-600 shadow-soft border border-app-border hover:text-app-green hover:-translate-y-0.5"}`}>
                        {t === "active" ? "Active" : "Completed"}
                    </button>
                ))}
                {tracking && (
                    <span className="ml-auto px-3 py-2 text-xs font-medium rounded-xl bg-green-50 text-green-700 border border-green-100 flex items-center gap-1.5">
                        <ClockIcon className="size-3.5" />
                        Updating every 10 seconds
                    </span>
                )}
            </div>

            {/* Orders */}
            {loading ? (
                <Loading />
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border/60 shadow-soft animate-scale-in">
                    <div className="size-16 rounded-full bg-app-cream flex-center mx-auto mb-3">
                        <PackageIcon className="size-8 text-app-border" />
                    </div>
                    <p className="text-lg font-bold text-app-green mb-1">No {tab} deliveries</p>
                    <p className="text-sm text-zinc-500">{tab === "active" ? "You'll see new assignments here" : "Completed deliveries will appear here"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <DeliveryOrderCard key={order.id} order={order} tab={tab} handleUpdateStatus={handleUpdateStatus} setOtpModal={setOtpModal} setCancelModal={setCancelModal} onOpenRoute={openRoute} />
                    ))}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && <OtpModal setOtpModal={setOtpModal} otp={otp} setOtp={setOtp} handleComplete={handleComplete} submitting={submitting} />}
            {/* Cancel Modal */}
            {cancelModal && <CancelModal setCancelModal={setCancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} handleCancel={handleCancel} submitting={submitting} />}
        </div>
    );
}
