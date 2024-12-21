import { Router } from "express"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const dashboardRouter = Router();

// Apply verifyJWT middleware to all routes in this file
dashboardRouter.use(verifyJwt);

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/dashboard/stats
dashboardRouter
    .route("/stats")
    .get(getChannelStats);

// http://localhost:8000/api/v1/dashboard/videos
dashboardRouter
    .route("/videos")
    .get(getChannelVideos);

export default dashboardRouter