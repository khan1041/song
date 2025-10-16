
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

// --- CORS POLICY SETUP START ---
// Define allowed origins for security. Ensure your frontend URL is listed here 
// or set in the FRONTEND_URL environment variable.
const allowedOrigins = [
  'https://beamish-seahorse-91e250.netlify.app', // Common for Vite/React dev server
  'https://song-ac7l.onrender.com', // Alternative common dev port
  process.env.FRONTEND_URL, // Production or staging URL from .env
].filter(Boolean); // Filters out any undefined/null/empty strings

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, server-to-server, or same-origin requests)
    if (!origin) return callback(null, true);

    // Check if the requesting origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Policy Blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  // Set credentials to true to allow passing authorization headers (JWT) or cookies
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // FIX: Explicitly allow 'Accept' and the header mentioned in the error.
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'access-control-allow-credentials'],
};

app.use(cors(corsOptions));
// --- CORS POLICY SETUP END ---

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
