import { Router } from "express"
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const subscriptionRouter = Router();

// Apply verifyJWT middleware to all routes in this file
subscriptionRouter.use(verifyJwt);

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/subscriptions/c/:channelId
subscriptionRouter
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

// http://localhost:8000/api/v1/subscriptions/u/:subscriberId
subscriptionRouter
    .route("/u/:subscriberId")
    .get(getUserChannelSubscribers);

export default subscriptionRouter