import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const looksLikePlaceholder = (v?: string) => {
    if (!v) return true;
    return /(__+|your_|example|cloudinary_api_key|cloudinary_api_secret)/i.test(v);
};

let client: typeof cloudinary | any;

if (looksLikePlaceholder(cloudName) || looksLikePlaceholder(apiKey) || looksLikePlaceholder(apiSecret)) {
    console.warn("Cloudinary credentials missing or placeholder detected. Using local mock uploader for development.");
    client = {
        uploader: {
            upload: async (_dataURI: string, _opts?: any) => {
                return { secure_url: "https://via.placeholder.com/600x400.png?text=uploaded" };
            },
        },
    };
} else {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
    // Log masked values for debug (never log full secrets in production)
    const mask = (s: string) => s.length > 6 ? `${s.slice(0, 3)}...${s.slice(-3)}` : "***";
    console.log("Cloudinary configured:", { cloudName, apiKey: mask(apiKey!), apiSecret: mask(apiSecret!) });
    client = cloudinary;
}

export default client;
