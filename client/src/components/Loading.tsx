import { Loader2Icon } from "lucide-react";

const Loading = () => {
    return (
        <div className="flex-center flex-col gap-4 min-h-96 h-full w-full">
            <div className="relative flex-center">
                <div className="absolute size-14 rounded-full bg-app-orange/20 blur-xl animate-pulse-soft" />
                <Loader2Icon className="relative animate-spin size-9 text-app-green" />
            </div>
            <p className="text-sm text-app-text-light animate-pulse-soft">Loading fresh picks…</p>
        </div>
    );
};

export default Loading;
