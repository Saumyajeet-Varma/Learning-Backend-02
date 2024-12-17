import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import verifyJwt from "../middlewares/auth.middleware.js";

const userRouter = Router();

// http://localhost:8000/api/v1/user/register
userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar", // This should be same in Frontend (name of the input)
            maxCount: 1,
        },
        {
            name: "coverImage", // This should be same in Frontend (name of the input)
            maxCount: 1,
        }
    ]),
    registerUser
)

// http://localhost:8000/api/v1/user/login
userRouter.route("/login").post(loginUser)

// SECURED ROUTE__________________________________________________

// http://localhost:8000/api/v1/user/logout
userRouter.route("/logout").post(verifyJwt, logoutUser)

// http://localhost:8000/api/v1/user/refresh-token
userRouter.route("/refresh-token").post(refreshAccessToken)

export default userRouter