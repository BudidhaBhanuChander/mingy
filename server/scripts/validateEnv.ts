import dotenv from "dotenv";
dotenv.config();

const missing: string[] = [];
const placeholders: string[] = [];

const check = (key: string) => {
    const v = process.env[key];
    if (!v) missing.push(key);
    else if (v.includes("YOUR_") || v.includes("your_") || v.includes("______") || v.includes("your") || v.includes("example")) placeholders.push(key);
};

check("CLOUDINARY_CLOUD_NAME");
check("CLOUDINARY_API_KEY");
check("CLOUDINARY_API_SECRET");

if (missing.length === 0 && placeholders.length === 0) {
    console.log("✅ Cloudinary environment variables look set.");
    process.exit(0);
}

if (missing.length > 0) {
    console.error("Missing env vars:", missing.join(", "));
}
if (placeholders.length > 0) {
    console.error("Likely placeholder values found for:", placeholders.join(", "));
}

console.error("Please update .env (copy .env.example) with real Cloudinary credentials and restart the server.");
process.exit(1);
