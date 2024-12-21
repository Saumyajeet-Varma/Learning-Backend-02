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
import userRouter from './routes/user.routes.js'
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/likes.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// http://localhost:8000/api/v1/users
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/tweets
app.use("/api/v1/tweets", tweetRouter)

// http://localhost:8000/api/v1/subscriptions
app.use("/api/v1/subscriptions", subscriptionRouter)

// http://localhost:8000/api/v1/videos
app.use("/api/v1/videos", videoRouter)

// http://localhost:8000/api/v1/comments
app.use("/api/v1/comments", commentRouter)

// http://localhost:8000/api/v1/likes
app.use("/api/v1/likes", likeRouter)

// http://localhost:8000/api/v1/playlists
app.use("/api/v1/playlists", playlistRouter)

// http://localhost:8000/api/v1/dashboard
app.use("/api/v1/dashboard", dashboardRouter)

export default app