import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import verifyJwt from "../middlewares/auth.middleware.js";

const userRouter = Router();

// http://localhost:8000/api/v1/user/register
userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar", // ! This should be same in Frontend (name of the input)
            maxCount: 1,
        },
        {
            name: "coverImage", // ! This should be same in Frontend (name of the input)
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

// http://localhost:8000/api/v1/user/change-password
userRouter.route("/change-password").post(verifyJwt, changePassword)

// http://localhost:8000/api/v1/user/current-user
userRouter.route("/current-user").get(verifyJwt, getCurrentUser)

// http://localhost:8000/api/v1/user/update-account
userRouter.route("/update-account").patch(updateAccountDetails)

// http://localhost:8000/api/v1/user/avatar
userRouter.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)

// http://localhost:8000/api/v1/user/cover-image
userRouter.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)

// http://localhost:8000/api/v1/user/c/:username  // ! ':' is imp (req.params)
userRouter.route("/c/:username").get(verifyJwt, getUserChannelProfile)

// http://localhost:8000/api/v1/user/history
userRouter.route("/history").get(verifyJwt, getWatchHistory)

export default userRouter