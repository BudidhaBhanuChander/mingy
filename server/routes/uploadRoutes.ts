import express from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

console.log("Upload route initialized. cloudinary uploader present:", !!cloudinary && typeof cloudinary.uploader?.upload === "function");

const uploadRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post("/", auth, upload.single("image"), async (req, res) => {
    try {
        console.log('Server env CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
        try {
            const uploaderStr = cloudinary?.uploader?.upload?.toString?.() || '';
            console.log('cloudinary.uploader.upload type:', typeof cloudinary?.uploader?.upload);
            console.log('cloudinary.uploader.upload snippet:', uploaderStr.slice(0, 200));
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.log("Could not stringify uploader function", message);
        }
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Ensure we use a request-time configured Cloudinary client (avoids stale/placeholder config)
        let result;
        try {
            const cloudinaryLib = (await import("cloudinary")).v2;
            cloudinaryLib.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            result = await cloudinaryLib.uploader.upload(dataURI, {
                folder: "grocery-del",
                resource_type: "auto",
            });
        } catch (e) {
            // fallback to the configured client (imported from config)
            result = await cloudinary.uploader.upload(dataURI, {
                folder: "grocery-del",
                resource_type: "auto",
            });
        }
        res.json({ url: result.secure_url });
    } catch (error: any) {
        console.error("Upload error:", error);
        const msg = error?.message || "Upload failed";
        res.status(500).json({ message: msg });
    }
});

export default uploadRouter;
