import { Router } from "express"
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const likeRouter = Router();

// Apply verifyJWT middleware to all routes in this file
likeRouter.use(verifyJwt);

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/likes/toggle/v/:videoId
likeRouter
    .route("/toggle/v/:videoId")
    .post(toggleVideoLike);

// http://localhost:8000/api/v1/likes/toggle/c/:commentId
likeRouter
    .route("/toggle/c/:commentId")
    .post(toggleCommentLike);

// http://localhost:8000/api/v1/likes/toggle/t/:tweetId
likeRouter
    .route("/toggle/t/:tweetId")
    .post(toggleTweetLike);

// http://localhost:8000/api/v1/likes/videos
likeRouter
    .route("/videos")
    .get(getLikedVideos);

export default likeRouter