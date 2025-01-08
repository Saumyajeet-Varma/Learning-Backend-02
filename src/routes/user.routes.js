import { Router } from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import verifyJwt from "../middlewares/auth.middleware.js"

const userRouter = Router();

// http://localhost:8000/api/v1/users/register
userRouter
    .route("/register")
    .post(
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
    );

// http://localhost:8000/api/v1/users/login
userRouter
    .route("/login")
    .post(loginUser);

// * SECURED ROUTES__________________________________________________

// http://localhost:8000/api/v1/users/logout
userRouter
    .route("/logout")
    .post(verifyJwt, logoutUser);

// http://localhost:8000/api/v1/users/refresh-token
userRouter
    .route("/refresh-token")
    .post(refreshAccessToken);

// http://localhost:8000/api/v1/users/change-password
userRouter
    .route("/change-password")
    .post(verifyJwt, changePassword);

// http://localhost:8000/api/v1/users/current-user
userRouter
    .route("/current-user")
    .get(verifyJwt, getCurrentUser);

// http://localhost:8000/api/v1/users/update-account
userRouter
    .route("/update-account")
    .patch(updateAccountDetails);

// http://localhost:8000/api/v1/users/avatar
userRouter
    .route("/avatar")
    .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);

// http://localhost:8000/api/v1/users/cover-image
userRouter
    .route("/cover-image")
    .patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

// http://localhost:8000/api/v1/users/channel/:username  
userRouter
    .route("/channel/:username") // ? ':' is imp (req.params), for Dynamic Routing
    .get(verifyJwt, getUserChannelProfile);

// http://localhost:8000/api/v1/users/history
userRouter
    .route("/history")
    .get(verifyJwt, getWatchHistory);

export default userRouter