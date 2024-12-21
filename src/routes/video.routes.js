import { Router } from "express"
import { getAllVideos, publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const videoRouter = Router();

// Apply verifyJWT middleware to all routes in this file
videoRouter.use(verifyJwt)

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/videos/
videoRouter
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },

        ]),
        publishVideo
    );

// http://localhost:8000/api/v1/videos/:videoId
videoRouter
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

// http://localhost:8000/api/v1/videos/toggle/publish/:vidoeId
videoRouter
    .route("/toggle/publish/:videoId")
    .patch(togglePublishStatus);


export default videoRouter