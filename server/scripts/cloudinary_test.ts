import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const onePixelPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn0B9WgQq3kAAAAASUVORK5CYII=";

(async () => {
    try {
        console.log("Using Cloudinary:", {
            cloud: process.env.CLOUDINARY_CLOUD_NAME,
            key: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.slice(0, 6) + '...' : undefined,
        });
        const res = await cloudinary.uploader.upload(onePixelPng, { folder: "grocery-del-test", resource_type: "auto" });
        console.log("Upload success:", res.secure_url);
    } catch (err: any) {
        console.error("Cloudinary test error:", err && (err.message || err));
        if (err && err.http_code) console.error("HTTP code:", err.http_code);
        process.exit(1);
    }
})();
