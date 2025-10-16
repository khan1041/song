
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/dbconnection.js";
import { v2 as cloudinary } from "cloudinary"
import router from "./router/user.js";
import songroute from "./router/song.js"
import album from "./router/album.js"
import expressFileUpload from "express-fileupload";

// Load environment variables from .env file
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// --- MODIFIED CORS POLICY SETUP START ---
// WARNING: This configuration allows ALL domains to access your API.
// This is typically only safe for public APIs that don't handle sensitive user data.

const openCorsOptions = {
    // 🔑 CHANGE: Set origin to the wildcard '*' to allow all domains.
    origin: '*', 
    
    // Credentials must usually be false when origin is set to '*'.
    credentials: false, 
    
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    // Ensure the necessary headers for complex requests are allowed.
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    // Note: 'access-control-allow-credentials' is redundant as a header when credentials: false
};

app.use(cors(openCorsOptions));
// --- MODIFIED CORS POLICY SETUP END ---

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(expressFileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Route definitions
app.use('/api/user', router)
app.use('/api/song', songroute)
app.use('/api/album', album)

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.API_SECRET_KEY
});

// Start the server
app.listen(PORT, () => {
    connectDB()
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`Access it at: http://localhost:${PORT}`);
});
