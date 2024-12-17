import { Router } from "express"
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js"
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

// Secured route

// http://localhost:8000/api/v1/user/logout
userRouter.route("/logout").post(verifyJwt, logoutUser)

export default userRouter