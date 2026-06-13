import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageIcon, UsersIcon, ShoppingBagIcon, AlertTriangleIcon } from "lucide-react";
import Loading from "../../components/Loading";
import { statusColors } from "../../assets/assets";
import api from "../../config/api";

interface Stats {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    outOfStock: number;
    recentOrders: any[];
}

export default function AdminDashboard() {
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/stats")
            .then((res) => setStats(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const cards = stats
        ? [
              { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBagIcon, tint: "from-emerald-400 to-emerald-600" },
              { label: "Total Users", value: stats.totalUsers, icon: UsersIcon, tint: "from-sky-400 to-blue-600" },
              { label: "Total Products", value: stats.totalProducts, icon: PackageIcon, tint: "from-app-orange to-app-orange-dark" },
              { label: "Out of Stock", value: stats.outOfStock, icon: AlertTriangleIcon, tint: "from-rose-400 to-red-600" },
          ]
        : [];

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-app-border/60 shadow-soft card-lift flex justify-between gap-3">
                        <div>
                            <p className="text-3xl font-bold text-app-green">{card.value}</p>
                            <p className="text-sm text-app-text-light">{card.label}</p>
                        </div>
                        <div className={`size-11 rounded-xl flex-center bg-gradient-to-br ${card.tint} text-white shadow-soft`}>
                            <card.icon className="size-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-app-border/60 shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center justify-between">
                    <h2 className="text-lg font-bold text-app-green">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm font-medium text-app-orange hover:text-app-orange-dark transition-colors">
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Items</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {stats?.recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                stats?.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-zinc-900">{order.user?.name || "—"}</p>
                                            <p className="text-xs text-zinc-500">{order.user?.email || ""}</p>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600">{order.items?.length || 0} items</td>
                                        <td className="px-6 py-4 font-medium">
                                            {currency}
                                            {order.total?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-zinc-100 text-zinc-600"}`}>{order.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
