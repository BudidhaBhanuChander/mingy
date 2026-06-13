import React, { useEffect, useState } from "react";
import type { Address } from "../types";
import { MapPinIcon, PlusIcon } from "lucide-react";
import Loading from "../components/Loading";
import AddressCard from "../components/AddressCard";
import AddressForm from "../components/AddressForm";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import toast from "react-hot-toast";

const Addresses = () => {
    const { updateUser } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ label: "", address: "", city: "", state: "", zip: "", isDefault: false });

    const resetForm = () => {
        setForm({ label: "", address: "", city: "", state: "", zip: "", isDefault: false });
        setShowForm(false);
        setEditingId(null);
    };

    const getLocation = (retries = 3): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }

            const attempt = () => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (error: GeolocationPositionError) => {
                        if (retries > 0) {
                            retries--;
                            setTimeout(attempt, 1000);
                        } else {
                            reject(new Error(error?.message || "Failed to get location after retries"));
                        }
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 15000,
                        maximumAge: 60000,
                    }
                );
            };
            attempt();
        });
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        try {
            const coords = await getLocation();
            const payload = { ...form, ...coords };

            if (editingId) {
                const { data } = await api.put(`/addresses/${editingId}`, payload);
                setAddresses(data.addresses);
                updateUser({ addresses: data.addresses });
                toast.success("Address updated!");
            } else {
                const { data } = await api.post(`/addresses`, payload);
                setAddresses(data.addresses);
                updateUser({ addresses: data.addresses });
                toast.success("Address added!");
            }
            resetForm();
        } catch (err: unknown) {
            const msg = getErrorMessage(err) || "Failed";
            toast.error(msg);
        }
    };

    const onEditHandler = (add: Address) => {
        setForm({ label: add.label, address: add.address, city: add.city, state: add.state, zip: add.zip, isDefault: add.isDefault });
        setEditingId(add.id);
        setShowForm(true);
    };

    // helper to extract message from unknown errors
    const getErrorMessage = (err: unknown): string | undefined => {
        if (!err) return undefined;
        if (typeof err === "string") return err;
        if (err instanceof Error) return err.message;
        // axios style
        try {
            const axiosLike = err as { response?: { data?: { message?: string } }; message?: string };
            return axiosLike.response?.data?.message || axiosLike.message;
        } catch {
            return undefined;
        }
    };

    useEffect(() => {
        api.get("/addresses")
            .then(({ data }) => {
                setAddresses(data.addresses);
            })
            .catch((err: unknown) => {
                const msg = getErrorMessage(err) || "Failed to fetch addresses";
                toast.error(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* page header  */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-app-green">My Addresses</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="btn-green !px-4 !py-2 text-sm !rounded-xl"
                    >
                        <PlusIcon className="size-4" /> Add Address
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && <AddressForm resetForm={resetForm} handleSubmit={handleSubmit} form={form} setForm={setForm} editingId={editingId} />}

                {/* Addresses List */}
                {loading ? (
                    <Loading />
                ) : addresses.length === 0 ? (
                    <div className="text-center py-16 animate-scale-in">
                        <div className="size-20 rounded-full bg-white flex-center shadow-soft mx-auto mb-4">
                            <MapPinIcon className="size-9 text-app-border" />
                        </div>
                        <h2 className="text-lg font-bold text-app-green mb-2">No addresses saved</h2>
                        <p className="text-sm text-app-text-light">Add an address for faster checkout</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <AddressCard key={addr.id} addr={addr} onEditHandler={onEditHandler} setAddresses={setAddresses} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Addresses;
