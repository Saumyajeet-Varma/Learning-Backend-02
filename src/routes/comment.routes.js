import { Router } from "express"
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const commentRouter = Router();

// Apply verifyJWT middleware to all routes in this file
commentRouter.use(verifyJwt);

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/comments/v/:videoId
commentRouter
    .route("/v/:videoId")
    .get(getVideoComments)
    .post(addComment);

// http://localhost:8000/api/v1/comments/c/commentId
commentRouter
    .route("/c/:commentId")
    .delete(deleteComment)
    .patch(updateComment);

export default commentRouter