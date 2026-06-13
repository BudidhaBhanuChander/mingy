import { ArrowUpRightIcon, BikeIcon, ChevronDownIcon, LogOutIcon, MapPinIcon, MenuIcon, PackageIcon, SearchIcon, ShieldIcon, ShoppingCartIcon, UserIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate("/");
    };

    return (
        <nav className="glass sticky top-0 z-50 border-b border-app-border/70 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-[22px] font-bold shrink-0 group">
                    <span className="size-9 rounded-xl bg-gradient-to-br from-app-green-light to-app-green flex-center text-white shadow-glow-green group-hover:rotate-6 transition-transform">
                        <BikeIcon size={20} />
                    </span>
                    <span className="text-gradient-green">Instacart</span>
                </Link>

                <div className="w-full flex items-center justify-end gap-4 lg:gap-10">
                    {/* Nav Links - Desktop */}
                    <div className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
                        <Link to="/" className="link-underline hover:text-app-green">Home</Link>
                        <Link to="/products" className="link-underline hover:text-app-green">Products</Link>
                        <Link to="/deals" className="link-underline font-semibold text-app-orange">
                            Deals
                        </Link>
                    </div>
                    {/* Search */}
                    <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm text-xs sm:text-sm">
                        <div className="relative w-full group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-app-orange transition-colors" />
                            <input type="text" placeholder="Search for groceries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-orange-50/70 rounded-full ring-1 ring-app-orange/15 focus:ring-2 focus:ring-app-orange/40 focus:bg-white transition-all" />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Cart */}
                        <button className="relative p-2.5 rounded-xl hover:bg-orange-50 active:scale-95" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCartIcon className="size-5 text-app-green" />
                            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 size-4.5 min-w-4.5 px-1 bg-gradient-to-br from-app-orange to-app-orange-dark text-white text-[10px] font-bold rounded-full flex-center shadow-glow animate-glow">{cartCount}</span>}
                        </button>
                        {/* User */}
                        <div className="relative">
                            {user ? (
                                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-full hover:bg-app-cream-dark/60 active:scale-95">
                                    <div className="size-8 rounded-full bg-gradient-to-br from-app-green-light to-app-green text-white font-semibold flex-center shadow-glow-green">{user.name.charAt(0).toUpperCase()}</div>
                                    <ChevronDownIcon className={`size-3.5 text-zinc-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                            ) : (
                                <div className="flex-center gap-2">
                                    <Link to="/login" className="hidden md:flex btn-green !px-5 !py-2 text-sm">
                                        <UserIcon size={16} /> Sign In
                                    </Link>
                                    {userMenuOpen ? <XIcon className="md:hidden" onClick={() => setUserMenuOpen(!userMenuOpen)} /> : <MenuIcon className="md:hidden" onClick={() => setUserMenuOpen(!userMenuOpen)} />}
                                </div>
                            )}

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-lift border border-app-border py-2 z-50 animate-scale-in origin-top-right">
                                        {user && (
                                            <div className="px-4 py-2 border-b border-app-border">
                                                <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
                                                <p className="text-xs text-zinc-500">{user?.email}</p>
                                            </div>
                                        )}
                                        <div onClick={() => setUserMenuOpen(false)}>
                                            {!user && (
                                                <Link to="/login" className="dropdown-link">
                                                    <UserIcon size={16} /> Sign In{" "}
                                                </Link>
                                            )}

                                            {user && (
                                                <Link to="/orders" className="dropdown-link">
                                                    <PackageIcon size={16} /> My Orders{" "}
                                                </Link>
                                            )}

                                            {user && (
                                                <Link to="/addresses" className="dropdown-link">
                                                    <MapPinIcon size={16} /> Addresses{" "}
                                                </Link>
                                            )}

                                            <Link to="/products" className="dropdown-link md:hidden">
                                                <ArrowUpRightIcon size={16} /> Products{" "}
                                            </Link>

                                            <Link to="/deals" className="dropdown-link md:hidden">
                                                <ArrowUpRightIcon size={16} /> Deals{" "}
                                            </Link>
                                            {user?.isAdmin && (
                                                <Link to="/admin/products" className="dropdown-link">
                                                    <ShieldIcon className="text-app-orange-dark" size={16} /> <span className="text-app-orange-dark">Admin Panel</span>{" "}
                                                </Link>
                                            )}
                                            {user && (
                                                <div className="border-t border-app-border pt-1">
                                                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-error hover:bg-red-50 w-full transition-colors">
                                                        <LogOutIcon size={16} /> Logout
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
