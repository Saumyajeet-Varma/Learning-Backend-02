import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

// CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// json configuration
app.use(express.json({
    limit: "16kb"
}));

// url configuration
app.use(express.urlencoded({
    limit: "16kb",
    extended: true,
}));

// upload configuration
app.use(express.static("public"));

// cookie-parser configuration
app.use(cookieParser());

export default app