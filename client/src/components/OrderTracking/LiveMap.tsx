import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPinIcon } from "lucide-react";
import { iconsForLeafpad } from "../../assets/assets";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

/**
 * Smoothly animates a value from its previous position to the next target over
 * ~1s using requestAnimationFrame, so the driver marker "glides" between
 * real-time location updates instead of teleporting (Swiggy/Zepto feel).
 */
function useSmoothPosition(target: { lat: number; lng: number } | null) {
    const [pos, setPos] = useState(target);
    const fromRef = useRef(target);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!target) return;
        const from = fromRef.current ?? target;
        const start = performance.now();
        const DURATION = 1000;

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / DURATION);
            // ease-out
            const e = 1 - Math.pow(1 - t, 3);
            setPos({
                lat: from.lat + (target.lat - from.lat) * e,
                lng: from.lng + (target.lng - from.lng) * e,
            });
            if (t < 1) rafRef.current = requestAnimationFrame(tick);
            else fromRef.current = target;
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target?.lat, target?.lng]);

    return pos ?? target;
}

export default function LiveMap({ order, liveLocation }: { order: any; liveLocation: any }) {
    // Glide the truck marker between real-time updates.
    const smooth = useSmoothPosition(
        liveLocation && liveLocation.lat ? { lat: liveLocation.lat, lng: liveLocation.lng } : null
    );

    // Custom delivery truck icon
    const truckIcon = new L.Icon({
        iconUrl: iconsForLeafpad.truck,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });

    // Destination pin icon
    const destinationIcon = new L.Icon({
        iconUrl: iconsForLeafpad.destination,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    // Component to re-center map when location changes
    function MapUpdater({ center }: { center: [number, number] }) {
        const map = useMap();
        useEffect(() => {
            map.setView(center, map.getZoom());
        }, [center, map]);
        return null;
    }

    return (
        <>
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
                <div className="rounded-2xl overflow-hidden border border-app-border/60 shadow-soft" style={{ height: 280 }}>
                    {liveLocation && liveLocation.lat !== 0 ? (
                        <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[smooth!.lat, smooth!.lng]} icon={truckIcon}>
                                <Popup>Delivery Partner</Popup>
                            </Marker>
                            {order.shippingAddress.lat && order.shippingAddress.lng && (
                                <Marker position={[order.shippingAddress.lat, order.shippingAddress.lng]} icon={destinationIcon}>
                                    <Popup>Delivery Address</Popup>
                                </Marker>
                            )}
                            <MapUpdater center={[smooth!.lat, smooth!.lng]} />
                        </MapContainer>
                    ) : order.shippingAddress.lat && order.shippingAddress.lng ? (
                        <MapContainer center={[order.shippingAddress.lat, order.shippingAddress.lng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[order.shippingAddress.lat, order.shippingAddress.lng]} icon={destinationIcon}>
                                <Popup>Delivery Address</Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        <div className="h-full bg-app-green/5 flex-center">
                            <div className="text-center">
                                <MapPinIcon className="size-8 text-app-green/40 mx-auto mb-2" />
                                <p className="text-sm text-app-green/50 font-medium">Waiting for delivery partner location...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
