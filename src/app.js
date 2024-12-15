import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

// CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// middleware used for parsing incoming requests with JSON payload
app.use(express.json({
    limit: "16kb"
}));

// use the urlencoded middleware to parse incoming requests with urlencoded payloads
app.use(express.urlencoded({
    limit: "16kb",
    extended: true,
}));

// serve static files from public folder
app.use(express.static("public"));

// cookie-parser configuration
app.use(cookieParser());



// Import Routes
import userRouter from "./routes/user.routes.js"

// http://localhost:8000/api/v1/user
app.use("/api/v1/user", userRouter)

export default app