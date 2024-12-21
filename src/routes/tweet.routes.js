import { Router } from "express"
import { createTweet, getUserTweets, updateTweet, deleteTweet } from "../controllers/tweet.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const tweetRouter = Router();

// Apply verifyJWT middleware to all routes in this file
tweetRouter.use(verifyJwt);

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/tweets/
tweetRouter
    .route("/")
    .post(createTweet);

// http://localhost:8000/api/v1/tweets/u/:userId
tweetRouter
    .route("/u/:userId")
    .get(getUserTweets);

// http://localhost:8000/api/v1/tweets/:tweetId
tweetRouter
    .route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default tweetRouter